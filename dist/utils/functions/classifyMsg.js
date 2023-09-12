"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
async function classifyMsg(uid, classification) {
    const { prediction } = classification;
    console.log('cohere prediction:', prediction);
    return new Promise((resolve, reject) => {
        index_1.default.move(uid, prediction, (err) => {
            if (err) {
                reject(new Error(`Error moving email: ${err}`));
            }
            else {
                resolve(null);
            }
        });
    });
}
exports.default = classifyMsg;
