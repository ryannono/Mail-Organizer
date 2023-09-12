"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const axios_1 = require("axios");
const examples = require("../../data/examples.json");
const classifyMsg_1 = require("./classifyMsg");
(0, dotenv_1.config)();
async function handleParsedMsgs(parsedMsgs) {
    // partition input for API
    // max allowable input size
    const MAX_INPUT_ARRAY_SIZE = 96;
    const inputArrays = Array.from({ length: Math.ceil(parsedMsgs.length / MAX_INPUT_ARRAY_SIZE) }, (chunk, index) => parsedMsgs.slice(index * MAX_INPUT_ARRAY_SIZE, index * MAX_INPUT_ARRAY_SIZE + MAX_INPUT_ARRAY_SIZE));
    const { COHERE_API_KEY } = process.env;
    try {
        // Classify each chunk
        return Promise.all(inputArrays.map(async (inputArray) => {
            const { data } = await axios_1.default.post('https://api.cohere.ai/v1/classify', {
                truncate: 'END',
                inputs: inputArray.map((obj) => obj.classificationInput),
                examples,
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                },
            });
            return Promise.all(data.classifications.map((classification, classificationIndex) => (0, classifyMsg_1.default)(inputArray[classificationIndex].uid, classification)));
        }));
    }
    catch (error) {
        return console.log(error);
    }
}
exports.default = handleParsedMsgs;
