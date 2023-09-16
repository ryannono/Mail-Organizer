"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// External librairies
const node_imap_1 = require("node-imap");
const html_to_text_1 = require("html-to-text");
const quoted_printable_1 = require("quoted-printable");
/**
 * Cleans up text by removing various HTML entities and replacing multiple
 * spaces with a single space.
 *
 * @param text - Input string with potential HTML entities.
 * @returns - Cleaned string.
 */
function cleanUpHtmlEntities(text) {
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
function isValidBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    }
    catch {
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
function cleanUpBase64Message(message) {
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
function cleanTextContent(buffer) {
    try {
        let cleanText = (0, html_to_text_1.htmlToText)(buffer, { wordwrap: 130 });
        cleanText = (0, quoted_printable_1.decode)(cleanText);
        cleanText = cleanText
            .replace(/(\b[A-Za-z0-9+/=]+\b)/g, (match) => {
            return match.length > 50 && /[+/=]{2,}/.test(match) ? '' : match;
        })
            .replace(/(http[s]?:\/\/[^\s]*)/g, '')
            .replace(/\n+/g, ' ')
            .replace(/^Content-(Type|Transfer-Encoding):.*$/gm, '');
        return cleanUpHtmlEntities(cleanText);
    }
    catch (error) {
        console.error('Error parsing message body:', error);
        return buffer;
    }
}
/**
 * Asynchronously parses an ImapMessage object to extract and clean up the email
 * content, including the sender, subject, and message body. The message body is
 * cleaned up to remove base64 encoded strings, HTML entities, and other unwanted
 * characters or strings. Once the message has been parsed, it returns a formatted
 * string with the sender, subject, and message body.
 *
 * @async
 * @function
 * @param {ImapMessage} msg - An instance of ImapMessage that needs to be parsed.
 *
 * @returns {Promise<string>} A promise that resolves with a string containing the
 * cleaned up sender information, subject, and message body.
 *
 * @example
 *
 * try {
 *   const parsedMessage = await parseMsg(imapMessageInstance);
 *   console.log('Message parsed successfully:', parsedMessage);
 * } catch (error) {
 *   console.error('Failed to parse message:', error);
 * }
 */
async function parseMsg(msg) {
    return new Promise((resolve) => {
        let header = null;
        let body = '';
        msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
                buffer += cleanUpBase64Message(chunk);
            });
            stream.once('end', async () => {
                if (info.which === 'HEADER') {
                    header = (0, node_imap_1.parseHeader)(buffer);
                }
                else {
                    body += cleanTextContent(buffer);
                }
            });
        });
        msg.once('end', () => resolve(`Sender: ${header?.from[0] ?? 'unknown'} | Subject: ${header?.subject[0] ?? 'unknown'} | Message: ${body}`));
    });
}
exports.default = parseMsg;
