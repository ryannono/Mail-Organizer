"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Local
const imap_1 = require("../../imap");
/**
 * Open the inbox mailbox.
 * @param cb - Callback function to execute once the inbox is opened.
 */
function openInbox(cb, mailboxName = 'INBOX') {
    imap_1.default.openBox(mailboxName, false, cb);
}
exports.default = openInbox;
