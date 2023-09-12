"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const dotenv_1 = require("dotenv");
const examples_json_1 = require("../../data/examples.json");
(0, dotenv_1.config)();
async function getClassification(input) {
    // Cohere API key
    const { COHERE_API_KEY } = process.env;
    try {
        const { data } = await axios_1.default.post('https://api.cohere.ai/v1/classify', { truncate: 'END', inputs: input, examples: examples_json_1.default }, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${COHERE_API_KEY}`,
            },
        });
        return data.classifications[0];
    }
    catch (error) {
        throw new Error(`Error while getting classifications: ${error}`);
    }
}
exports.default = getClassification;
