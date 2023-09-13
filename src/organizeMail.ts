import parseMsg, { ParsedMsg } from './utils/functions/parseMsg';
import handleParsedMsgs from './utils/functions/handleParsedMsgs';
import openInbox from './utils/functions/openInbox';
import imap from './imap';

export default function organizeMail() {
  const parsedMsgPromises: Promise<ParsedMsg>[] = [];

  // Event handlers for the IMAP client
  imap.once('ready', () =>
    openInbox((openErr) => {
      if (openErr) throw openErr;

      imap.search(['ALL'], (searchErr, results) => {
        if (searchErr) throw searchErr;

        if (results.length === 0) {
          console.log('No messages found!');
          return imap.end();
        }

        const mailFetcher = imap.fetch(results, {
          bodies: ['HEADER', 'TEXT'],
          markSeen: false,
        });

        mailFetcher.on('message', (msg) =>
          parsedMsgPromises.push(parseMsg(msg))
        );

        return mailFetcher.once('end', async () => {
          console.log('Done fetching messages');
          const parsedMsgs = await Promise.all(parsedMsgPromises);
          await handleParsedMsgs(parsedMsgs);
          return imap.end();
        });
      });
    })
  );

  imap.once('error', (err: unknown) => console.log('IMAP Error:', err));

  imap.once('end', () => console.log('IMAP Connection ended'));

  // Initiate IMAP connection
  imap.connect();
}
