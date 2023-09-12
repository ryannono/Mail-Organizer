import * as Imap from 'node-imap';
import { config } from 'dotenv';

config();

const { EMAIL_PASSWORD, EMAIL_ADDRESS, EMAIL_HOST } = process.env;

// Configure IMAP client
const imap = new Imap({
  user: EMAIL_ADDRESS!,
  password: EMAIL_PASSWORD!,
  host: EMAIL_HOST!,
  port: 993,
  tls: true,
});

export default imap;
