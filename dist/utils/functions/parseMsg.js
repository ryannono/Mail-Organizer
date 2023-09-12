"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_imap_1 = require("node-imap");
const html_to_text_1 = require("html-to-text");
const quoted_printable_1 = require("quoted-printable");
function cleanUpHtmlEntities(text) {
    return text
        .replace(/\[3D"?.*?"?\]/g, '')
        .replace(/3D""/g, '')
        .replace(/=+/g, ' ')
        .replace(/\s+/g, ' ');
}
function isValidBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    }
    catch {
        return false;
    }
}
function cleanUpBase64Message(message) {
    if (isValidBase64(message)) {
        return Buffer.from(message, 'base64').toString('utf8');
    }
    return message;
}
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
async function parseMsg(msg) {
    return new Promise((resolve) => {
        let uid = null;
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
        msg.on('attributes', (attrs) => {
            uid = attrs.uid;
        });
        msg.once('end', () => {
            const output = {
                uid,
                classificationInput: `Sender: ${header?.from[0] ?? 'unknown'} | Subject: ${header?.subject[0] ?? 'unknown'} | Message: ${body}`,
            };
            resolve(output);
        });
    });
}
exports.default = parseMsg;
