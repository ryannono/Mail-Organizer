"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseMsg_1 = require("./utils/functions/parseMsg");
const handleParsedMsgs_1 = require("./utils/functions/handleParsedMsgs");
const openInbox_1 = require("./utils/functions/openInbox");
const imap_1 = require("./imap");
const parsedMsgPromises = [];
// Event handlers for the IMAP client
imap_1.default.once('ready', () => (0, openInbox_1.default)((openErr) => {
    if (openErr)
        throw openErr;
    imap_1.default.search(['ALL'], (searchErr, results) => {
        if (searchErr)
            throw searchErr;
        if (results.length === 0) {
            console.log('No messages found!');
            return imap_1.default.end();
        }
        const mailFetcher = imap_1.default.fetch(results, {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false,
        });
        mailFetcher.on('message', (msg) => parsedMsgPromises.push((0, parseMsg_1.default)(msg)));
        return mailFetcher.once('end', async () => {
            console.log('Done fetching messages');
            const parsedMsgs = await Promise.all(parsedMsgPromises);
            await (0, handleParsedMsgs_1.default)(parsedMsgs);
            return imap_1.default.end();
        });
    });
}));
imap_1.default.once('error', (err) => console.log('IMAP Error:', err));
imap_1.default.once('end', () => console.log('IMAP Connection ended'));
// Initiate IMAP connection
imap_1.default.connect();
exports.default = imap_1.default;
