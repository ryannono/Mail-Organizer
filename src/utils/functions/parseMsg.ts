// External librairies
import { ImapMessage, parseHeader } from 'node-imap';
import { htmlToText } from 'html-to-text';
import { decode } from 'quoted-printable';

/**
 * Type definition representing the structure of an IMAP header. It's an
 * object where keys are strings and values are arrays of strings.
 */
type ImapHeader = { [index: string]: string[] };

/**
 * Return type of the parseMsg function. It contains a UID, which can be a
 * number or null, and a string for classification input.
 */
export type ParsedMsg = {
  uid: number | null;
  classificationInput: string;
};

/**
 * Cleans up text by removing various HTML entities and replacing multiple
 * spaces with a single space.
 *
 * @param text - Input string with potential HTML entities.
 * @returns - Cleaned string.
 */
function cleanUpHtmlEntities(text: string): string {
  return text
    .replace(/\[3D"?.*?"?\]/g, '')
    .replace(/3D""/g, '')
    .replace(/=+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Validates if a string is a valid base64 encoded string.
 *
 * @param str - String to validate.
 * @returns - Boolean indicating validity of base64 encoding.
 */
function isValidBase64(str: string): boolean {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Cleans up a base64 encoded message. If the message is a valid base64
 * string, it decodes it to UTF-8.
 *
 * @param message - Input base64 encoded string.
 * @returns - Cleaned or decoded string.
 */
function cleanUpBase64Message(message: string): string {
  if (isValidBase64(message)) {
    return Buffer.from(message, 'base64').toString('utf8');
  }
  return message;
}

/**
 * Cleans up text content by removing unwanted characters, URLs, and
 * adjusting formatting.
 *
 * @param buffer - The input string to clean.
 * @returns - A cleaned version of the input string.
 */
function cleanTextContent(buffer: string): string {
  try {
    let cleanText = htmlToText(buffer, { wordwrap: 130 });

    cleanText = decode(cleanText);

    cleanText = cleanText
      .replace(/(\b[A-Za-z0-9+/=]+\b)/g, (match) => {
        return match.length > 50 && /[+/=]{2,}/.test(match) ? '' : match;
      })
      .replace(/(http[s]?:\/\/[^\s]*)/g, '')
      .replace(/\n+/g, ' ')
      .replace(/^Content-(Type|Transfer-Encoding):.*$/gm, '');

    return cleanUpHtmlEntities(cleanText);
  } catch (error) {
    console.error('Error parsing message body:', error);
    return buffer;
  }
}

/**
 * Asynchronously parses an IMAP message, extracting and formatting the
 * relevant information including the UID and the content required for
 * classification. The function processes the message body to clean and
 * structure the content into a format ready for classification.
 *
 * @async
 * @function
 * @param {ImapMessage} msg - The IMAP message to parse.
 *
 * @returns {Promise<ParsedMsg>} A promise that resolves with an
 * object containing the message UID and a formatted string representing
 * the classification input, which contains the sender, subject, and body
 * message.
 *
 * @throws Will log any error that occurs during the parsing process to
 * the console.
 *
 * @example
 *
 * try {
 *   const parsedMessage = await parseMsg(imapMessage);
 *   console.log('Message parsed successfully:', parsedMessage);
 * } catch (error) {
 *   console.error('Failed to parse message:', error);
 * }
 */
export default async function parseMsg(msg: ImapMessage): Promise<ParsedMsg> {
  return new Promise((resolve) => {
    let uid: number | null = null;
    let header: ImapHeader | null = null;
    let body: string = '';

    msg.on('body', (stream, info) => {
      let buffer = '';
      stream.on('data', (chunk) => {
        buffer += cleanUpBase64Message(chunk);
      });

      stream.once('end', async () => {
        if (info.which === 'HEADER') {
          header = parseHeader(buffer);
        } else {
          body += cleanTextContent(buffer);
        }
      });
    });

    msg.on('attributes', (attrs) => {
      uid = attrs.uid;
    });

    msg.once('end', () => {
      const output = {
        uid,
        classificationInput: `Sender: ${
          header?.from[0] ?? 'unknown'
        } | Subject: ${header?.subject[0] ?? 'unknown'} | Message: ${body}`,
      };

      resolve(output);
    });
  });
}
