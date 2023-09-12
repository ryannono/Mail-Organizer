"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// External librairies
const imap_1 = require("../../imap");
/**
 * Classifies an email message based on the specified classification data.
 * It moves the email message to a folder corresponding to the classification
 * prediction. If an error occurs during the process, it rejects the promise
 * with an error message.
 *
 * This function leverages the 'imap' module to perform the email movement based
 * on the classification prediction received from the Cohere API.
 *
 * @async
 * @function
 * @param {number | null} uid - The unique identifier (UID) of the email message
 * to be classified. It should be a number representing the UID of the message,
 * or null if the UID is not available.
 * @param {Classification} classification - The classification data containing
 * the prediction information which indicates where to move the email message.
 *
 * @returns {Promise<null>} A promise that resolves to null if the message was
 * successfully moved to the target folder based on the classification. The
 * promise rejects with an error if moving the email fails.
 *
 * @throws Will throw an error if moving the email encounters any issues.
 *
 * @example
 *
 * try {
 *   await classifyMsg(12345, classificationData);
 *   console.log('Message classified successfully');
 * } catch (error) {
 *   console.error('Failed to classify message:', error);
 * }
 */
async function classifyMsg(uid, classification) {
    const { prediction } = classification;
    return new Promise((resolve, reject) => {
        imap_1.default.move(uid, prediction, (err) => {
            if (err) {
                reject(new Error(`Error moving email: ${err}`));
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.default = classifyMsg;
