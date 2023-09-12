"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Imap = require("node-imap");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { EMAIL_PASSWORD, EMAIL_ADDRESS, EMAIL_HOST } = process.env;
// Configure IMAP client
const imap = new Imap({
    user: EMAIL_ADDRESS,
    password: EMAIL_PASSWORD,
    host: EMAIL_HOST,
    port: 993,
    tls: true,
});
exports.default = imap;
