// External librairies
import * as Imap from 'node-imap';

// Local
import imap from '../../imap';

/**
 * Open the inbox mailbox.
 * @param cb - Callback function to execute once the inbox is opened.
 */
export default function openInbox(
  cb: (error: Error, mailbox: Imap.Box) => void,
  mailboxName = 'INBOX'
) {
  imap.openBox(mailboxName, false, cb);
}
