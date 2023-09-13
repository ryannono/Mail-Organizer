import * as cron from 'node-cron';
import organizeMail from './organizeMail';

cron.schedule('*/5 * * * *', async () => {
  organizeMail();
});
