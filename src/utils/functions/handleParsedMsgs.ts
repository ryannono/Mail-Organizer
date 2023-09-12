// External librairies
import { config } from 'dotenv';
import axios from 'axios';

// Data
import * as examples from '../../data/examples.json';

// Utils
import classifyMsg from './classifyMsg';
import { ParsedMsg } from './parseMsg';

// Types
import { ClassificationAPIResponse } from '../types/cohere';

// env config
config();

/**
 * Handles parsed email messages by classifying them in batches. It divides
 * the parsed messages into chunks, and sends each chunk to the Cohere API
 * for classification. Once classified, it utilizes the classifyMsg function
 * to move each email message to the appropriate folder based on its
 * classification.
 *
 * @async
 * @function
 * @param {ParsedMsg[]} parsedMsgs - An array of parsed email messages.
 *
 * @returns {Promise<any[]>} A promise that resolves with an array of results
 * from the classifyMsg function. If an error occurs during classification or
 * message handling, it logs the error to the console.
 *
 * @throws Will log any error that occurs during the process to the console.
 *
 * @example
 *
 * try {
 *   const results = await handleParsedMsgs(parsedMessages);
 *   console.log('Messages handled successfully:', results);
 * } catch (error) {
 *   console.error('Failed to handle messages:', error);
 * }
 */
export default async function handleParsedMsgs(parsedMsgs: ParsedMsg[]) {
  // partition input for API
  // max allowable input size
  const MAX_INPUT_ARRAY_SIZE = 96;
  const inputArrays = Array.from(
    { length: Math.ceil(parsedMsgs.length / MAX_INPUT_ARRAY_SIZE) },
    (chunk, index) =>
      parsedMsgs.slice(
        index * MAX_INPUT_ARRAY_SIZE,
        index * MAX_INPUT_ARRAY_SIZE + MAX_INPUT_ARRAY_SIZE
      )
  );

  const { COHERE_API_KEY } = process.env;

  try {
    // Classify each chunk
    return Promise.all(
      inputArrays.map(async (inputArray) => {
        const { data } = await axios.post<ClassificationAPIResponse>(
          'https://api.cohere.ai/v1/classify',
          {
            truncate: 'END',
            inputs: inputArray.map((obj) => obj.classificationInput),
            examples,
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${COHERE_API_KEY}`,
            },
          }
        );

        return Promise.all(
          data.classifications.map((classification, classificationIndex) =>
            classifyMsg(inputArray[classificationIndex].uid, classification)
          )
        );
      })
    );
  } catch (error) {
    return console.log(error);
  }
}