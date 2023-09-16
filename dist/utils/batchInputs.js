"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Divides an array of raw input strings into smaller batches or chunks, where
 * each batch contains a specified maximum number of input strings. This
 * function is particularly useful for processing large datasets in smaller,
 * manageable batches, to prevent potential overload when sending data to an
 * API or processing it in memory.
 *
 * @function
 * @param {number} maxInputArraySize - The maximum number of elements that each
 * batch should contain.
 * @param {string[]} rawInputArray - The original array of strings that needs
 * to be divided into batches.
 *
 * @returns {string[][]} An array of string arrays, where each inner array is
 * a batch containing up to maxInputArraySize number of elements.
 *
 * @example
 *
 * const rawInputs = ['message1', 'message2', ..., 'messageN'];
 * const maxBatchSize = 100;
 * const batches = batchInputs(maxBatchSize, rawInputs);
 *
 * batches.forEach((batch, index) => {
 *   console.log(`Batch ${index + 1}:`, batch);
 * });
 */
function batchInputs(maxInputArraySize, rawInputArray) {
    return Array.from({ length: Math.ceil(rawInputArray.length / maxInputArraySize) }, (chunk, index) => rawInputArray.slice(index * maxInputArraySize, index * maxInputArraySize + maxInputArraySize));
}
exports.default = batchInputs;
