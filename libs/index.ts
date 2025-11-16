/**
 * Process items in batches, running items within each batch in parallel,
 * but processing batches sequentially.
 *
 * This is useful for rate limiting API calls or controlling resource usage.
 *
 * @example
 * ```typescript
 * // Process 10 items in batches of 3
 * const result = await batchProcess(
 *   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
 *   async (num) => {
 *     await someAsyncOperation(num)
 *     return num * 2
 *   },
 *   { batchSize: 3 }
 * )
 * // Output: [[2, 4, 6], [8, 10, 12], [14, 16, 18], [20]]
 * ```
 *
 * @note For simple sequential processing without batching, use native for...of:
 * ```typescript
 * const results = []
 * for (const item of items) {
 *   const result = await processItem(item)
 *   results.push(result)
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const batchProcess = async <T = any, R = any>(targets: T[], callback: (prop: T) => Promise<R>, options?: {
batchSize?: number
}): Promise<Array<Array<R>>> => {
  const batchSize = options?.batchSize ?? 1
  const batches = arrayBatch<T>(targets, batchSize)

  const results: Array<Array<R>> = []
  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(async (item) => callback(item)))
    results.push(batchResults)
  }
  return results
}

/**
 * Utility function to split an array into batches of a specified size.
 *
 * @example
 * ```typescript
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * const batches = arrayBatch(items, 3)
 * // Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayBatch = <T = any>(inputArray: T[], batchSize = 1): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < inputArray.length; i += batchSize) {
    result.push(inputArray.slice(i, i + batchSize))
  }
  return result
}

// Deprecated: Use arrayBatch instead
/** @deprecated Use arrayBatch instead. Will be removed in next major version. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayChunk = <T = any>(inputArray: T[], perChunk = 1): T[][] => {
  return arrayBatch(inputArray, perChunk)
}

export default batchProcess