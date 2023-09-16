import * as Imap from 'node-imap';
import { config } from 'dotenv';
import parseMsg from './utils/parseMsg';
import moveMsg from './utils/moveMsg';
import batchInputs from './utils/batchInputs';
import getClassifications from './utils/getClassifications';

/**
 * The `MailOrganizer` class provides functionalities to connect to an IMAP
 * server, retrieve email messages, and classify them using a given
 * classification API key. Messages are organized in batches, classified,
 * and then moved based on the classification received.
 *
 * @example
 *
 * const organizer = new MailOrganizer(
 *   'example@mail.com',
 *   'password123',
 *   'imap.mail.com',
 *   'API_KEY_HERE'
 * );
 * organizer.organize('INBOX').then(() => console.log('Mail organized'));
 */
class MailOrganizer {
  private imapClient: Imap;

  private messageUIDs: number[] = [];

  private messages: string[] = [];

  private classifyApiKey: string;

  private classifyApiMaxInput = 96;

  /**
   * Creates an instance of the `MailOrganizer` class.
   *
   * @param {string} email - The email address to access the IMAP server.
   * @param {string} password - The password associated with the email address.
   * @param {string} host - The host address of the IMAP server.
   * @param {string} classifyApiKey - The API key for the classification
   * service.
   * @param {number} [port=993] - The port number of the IMAP server (default is
   * 993).
   * @param {boolean} [tls=true] - Indicates whether to use TLS for the
   * connection (default is true).
   */
  constructor(
    email: string,
    password: string,
    host: string,
    classifyApiKey: string,
    port = 993,
    tls = true
  ) {
    this.classifyApiKey = classifyApiKey;

    this.imapClient = new Imap({
      user: email,
      password,
      host,
      port,
      tls,
    })
      .once('end', () => console.log('IMAP Connection ended'))
      .once('error', (err: unknown) => console.log('IMAP Error:', err));
  }

  /**
   * Retrieves all message UIDs and their respective contents from the IMAP
   * server and stores them in class properties `messageUIDs` and `messages`.
   *
   * @private
   * @async
   * @function
   * @throws Throws an error if any error occurs during message retrieval or
   * if no messages are found.
   */
  private async getMessages() {
    // get UIDs
    this.messageUIDs = await new Promise<number[]>((resolve, reject) => {
      this.imapClient.search(['ALL'], (searchErr, UIDs) => {
        if (searchErr) {
          return reject(
            new Error(
              `An error occured while searching for mail: ${searchErr.message}`
            )
          );
        }

        if (UIDs.length === 0) {
          return reject(new Error(`No messages found!`));
        }

        return resolve(UIDs);
      });
    });

    // get Content
    this.messages = await new Promise<string[]>((resolve) => {
      const messagePromises: Promise<string>[] = [];

      this.imapClient
        .fetch(this.messageUIDs, {
          bodies: ['HEADER', 'TEXT'],
          markSeen: false,
        })
        .on('message', (msg) => messagePromises.push(parseMsg(msg)))
        .once('end', () => {
          console.log('Done fetching messages');
          return resolve(Promise.all(messagePromises));
        });
    });
  }

  /**
   * Classifies the messages retrieved from the IMAP server in batches. Each
   * message batch is sent to the classification API for classification. Once
   * classified, the `moveMsg` function is used to move each message to the
   * appropriate folder based on its classification.
   *
   * @private
   * @async
   * @function
   * @returns {Promise<any[]>} A promise that resolves with an array of
   * results from the `moveMsg` function.
   *
   * @throws Throws an error if any error occurs during the classification
   * process.
   */
  private async classifyMessages() {
    const messageBatches = batchInputs(this.classifyApiMaxInput, this.messages);

    try {
      // Classify each chunk
      return Promise.all(
        messageBatches.map(async (messageBatch, batchIndex) => {
          const classifications = await getClassifications(
            messageBatch,
            this.classifyApiKey
          );

          return Promise.all(
            classifications.map((classification, index) =>
              moveMsg(
                this.imapClient,
                this.messageUIDs[batchIndex * this.classifyApiMaxInput + index],
                classification
              )
            )
          );
        })
      );
    } catch (error) {
      throw new Error(`Error occurred while classifying messages: ${error}`);
    }
  }

  /**
   * Initiates the mail organization process. It connects to the IMAP server,
   * opens the specified mailbox, retrieves and classifies messages in
   * batches, and organizes them accordingly. If any error occurs during
   * these operations, it logs the error to the console.
   *
   * @async
   * @function
   * @param {string} [mailboxName='INBOX'] - The name of the mailbox to
   * organize (default is 'INBOX').
   *
   * @returns {Promise<void>} A promise that resolves when the organization
   * process completes successfully.
   *
   * @throws Logs any error that occurs during the organization process to
   * the console.
   */
  async organize(mailboxName = 'INBOX') {
    this.imapClient.connect();

    return new Promise<void>((resolve, reject) => {
      this.imapClient.once('ready', () =>
        this.imapClient.openBox(mailboxName, async (openErr: Error) => {
          if (openErr) {
            reject(new Error(`Error opening mailbox: ${openErr}`));
            return;
          }

          try {
            await this.getMessages();
            await this.classifyMessages();
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      );
    })
      .catch((error) => console.log(error?.message ?? error))
      .finally(() => this.imapClient.end());
  }
}

config();

const { EMAIL_PASSWORD, EMAIL_ADDRESS, EMAIL_HOST, COHERE_API_KEY } =
  process.env;

const mailOrganizer = new MailOrganizer(
  EMAIL_ADDRESS!,
  EMAIL_PASSWORD!,
  EMAIL_HOST!,
  COHERE_API_KEY!
);

export default mailOrganizer;
