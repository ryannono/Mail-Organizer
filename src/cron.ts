import * as cron from 'node-cron';
import mailOrganizer from './MailOrganizer';

cron.schedule('*/5 * * * *', async () => {
  mailOrganizer.organize();
});
