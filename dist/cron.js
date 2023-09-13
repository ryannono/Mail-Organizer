"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron = require("node-cron");
const organizeMail_1 = require("./organizeMail");
cron.schedule('*/5 * * * *', async () => {
    (0, organizeMail_1.default)();
});
