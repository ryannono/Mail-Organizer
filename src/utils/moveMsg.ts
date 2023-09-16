// External librairies
import * as Imap from 'node-imap';

// Types
import { Classification } from '../types/cohere';

/**
 * Moves an email message to a specified folder within the email client based
 * on the classification prediction obtained from the Cohere API. It uses the
 * IMAP protocol to perform this action, and will either resolve or reject the
 * promise based on the success of the move operation.
 *
 * @async
 * @function
 * @param {Imap} imapClient - The IMAP client instance to interact with the
 * email server.
 * @param {number|null} uid - The unique identifier of the email message that
 * needs to be moved.
 * @param {Classification} classification - The classification object which
 * contains the prediction indicating the folder to move the email to.
 *
 * @returns {Promise<null>} A promise that resolves with null if the email
 * was successfully moved, or rejects with an error if the move operation
 * fails.
 *
 * @throws Will throw an error if the email movement operation encounters any
 * issues.
 *
 * @example
 *
 * try {
 *   await moveMsg(imapClient, uid, classification);
 *   console.log('Message moved successfully');
 * } catch (error) {
 *   console.error('Error moving message:', error);
 * }
 */
export default async function moveMsg(
  imapClient: Imap,
  uid: number | null,
  classification: Classification
) {
  const { prediction } = classification;

  return new Promise((resolve, reject) => {
    imapClient.move(uid, prediction, (err) => {
      if (err) {
        reject(new Error(`Error moving email: ${err}`));
      } else {
        resolve(null);
      }
    });
  });
}
