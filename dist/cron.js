"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const MailOrganizer_1 = require("./MailOrganizer");
cron.schedule('*/5 * * * *', async () => {
    MailOrganizer_1.default.organize();
});
