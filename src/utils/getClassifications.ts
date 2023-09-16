import axios from 'axios';
import { ClassificationAPIResponse } from '../types/cohere';
import * as examples from '../data/examples.json';

/**
 * Asynchronously sends a batch of input strings to the Cohere API for
 * classification. Utilizes the specified API key for authorization. It
 * sends a POST request to the API's classification endpoint with the
 * necessary parameters and headers, and returns the classification
 * results obtained from the API response.
 *
 * @async
 * @function
 * @param {string[]} inputs - An array of input strings that need to be
 * classified.
 * @param {string} classifyApiKey - The API key to be used for authentication
 * with the Cohere API.
 *
 * @returns {Promise<any[]>} A promise that resolves with an array of
 * classification results corresponding to the input strings.
 *
 * @throws Will throw an error if the API call encounters any issues.
 *
 * @example
 *
 * try {
 *   const classifications = await getClassifications(inputs, 'YOUR_API_KEY');
 *   console.log('Classifications received:', classifications);
 * } catch (error) {
 *   console.error('Error getting classifications:', error);
 * }
 */
export default async function getClassifications(
  inputs: string[],
  classifyApiKey: string
) {
  const { data } = await axios.post<ClassificationAPIResponse>(
    'https://api.cohere.ai/v1/classify',
    {
      truncate: 'END',
      inputs,
      examples,
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${classifyApiKey}`,
      },
    }
  );

  return data.classifications;
}
