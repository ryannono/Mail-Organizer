"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Imap = require("node-imap");
const parseMsg_1 = require("./utils/functions/parseMsg");
const handleMsg_1 = require("./utils/functions/handleMsg");
// Configure IMAP client
const imap = new Imap({
    user: 'ryan_nono@hotmail.com',
    password: 'cardiologiste101',
    host: 'imap-mail.outlook.com',
    port: 993,
    tls: true,
});
/**
 * Open the inbox mailbox.
 * @param cb - Callback function to execute once the inbox is opened.
 */
function openInbox(cb) {
    imap.openBox('Banking', false, cb);
}
const parsedMsgPromises = [];
// Event handlers for the IMAP client
imap.once('ready', () => openInbox((openErr) => {
    if (openErr)
        throw openErr;
    const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
    };
    imap.search(['ALL'], (searchErr, results) => {
        if (searchErr)
            throw searchErr;
        if (results.length === 0) {
            console.log('No messages found!');
            return imap.end();
        }
        const mailFetcher = imap.fetch(results, fetchOptions);
        mailFetcher.on('message', (msg) => parsedMsgPromises.push((0, parseMsg_1.default)(msg)));
        return mailFetcher.once('end', async () => {
            console.log('Done fetching messages');
            const parsedMsgs = await Promise.all(parsedMsgPromises);
            await (0, handleMsg_1.default)(parsedMsgs);
            return imap.end();
        });
    });
}));
imap.once('error', (err) => console.log('IMAP Error:', err));
imap.once('end', () => console.log('IMAP Connection ended'));
// Initiate IMAP connection
imap.connect();
exports.default = imap;
