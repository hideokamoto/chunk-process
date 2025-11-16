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
 *   { chunkSize: 3 }
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
chunkSize?: number
}): Promise<Array<Array<R>>> => {
  const chunkSize = options ? options.chunkSize : 1
  const chunkedItems = arrayChunk<T>(targets, chunkSize)

  const results: Array<Array<R>> = []
  for (const items of chunkedItems) {
    const chunkResults = await Promise.all(items.map(async (item) => callback(item)))
    results.push(chunkResults)
  }
  return results
}

/**
 * Utility function to split an array into chunks of a specified size.
 *
 * @example
 * ```typescript
 * const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * const chunks = arrayChunk(items, 3)
 * // Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayChunk = <T = any>([...inputArray]: T[], perChunk = 1) => {
  return inputArray.reduce<Array<Array<T>>>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index/perChunk)

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])
}

export default batchProcess