/**
 * Retry options for batch processing
 *
 * @property maxAttempts - Maximum number of retry attempts for failed tasks
 * @property backoff - Backoff strategy: 'linear' (constant delay) or 'exponential' (increasing delay)
 * @property initialDelay - Initial delay in milliseconds between retries (default: 100ms)
 */
export interface RetryOptions {
  /** Maximum number of retry attempts for failed tasks */
  maxAttempts: number
  /** Backoff strategy: 'linear' (constant delay) or 'exponential' (increasing delay) */
  backoff?: 'linear' | 'exponential'
  /** Initial delay in milliseconds between retries (default: 100ms) */
  initialDelay?: number
}

/**
 * Options for batch processing
 *
 * @property batchSize - Number of items to process in parallel within each batch (default: 1)
 * @property onProgress - Callback function called after each batch completes, receives (completed, total) batches
 * @property delayBetweenBatches - Delay in milliseconds to wait between batches (useful for rate limiting)
 * @property retry - Retry configuration for failed tasks
 * @property continueOnError - If true, errors are returned in results instead of throwing (default: false)
 * @property flatten - If true, returns a flat array instead of nested arrays (default: false)
 * @property timeout - Maximum time in milliseconds for each task to complete (default: no timeout)
 */
export interface BatchProcessOptions {
  /** Number of items to process in parallel within each batch (default: 1) */
  batchSize?: number
  /** Callback function called after each batch completes, receives (completed, total) batches */
  onProgress?: (completed: number, total: number) => void
  /** Delay in milliseconds to wait between batches (useful for rate limiting) */
  delayBetweenBatches?: number
  /** Retry configuration for failed tasks */
  retry?: RetryOptions
  /** If true, errors are returned in results instead of throwing (default: false) */
  continueOnError?: boolean
  /** If true, returns a flat array instead of nested arrays (default: false) */
  flatten?: boolean
  /** Maximum time in milliseconds for each task to complete (default: no timeout) */
  timeout?: number
}

/**
 * Process items in batches, running items within each batch in parallel,
 * but processing batches sequentially.
 *
 * This is useful for rate limiting API calls or controlling resource usage.
 *
 * @example Basic usage
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
 * @example With progress tracking and rate limiting
 * ```typescript
 * await batchProcess(
 *   userIds,
 *   async (id) => await fetchUser(id),
 *   {
 *     batchSize: 5,
 *     delayBetweenBatches: 1000, // Wait 1 second between batches
 *     onProgress: (completed, total) => {
 *       console.log(`Progress: ${completed}/${total} batches`)
 *     }
 *   }
 * )
 * ```
 *
 * @example With retry and error handling
 * ```typescript
 * const results = await batchProcess(
 *   items,
 *   async (item) => await processItem(item),
 *   {
 *     retry: { maxAttempts: 3, backoff: 'exponential' },
 *     continueOnError: true,
 *     timeout: 5000
 *   }
 * )
 * ```
 *
 * @example With flattened results
 * ```typescript
 * const result = await batchProcess(
 *   [1, 2, 3, 4, 5, 6],
 *   async (num) => num * 2,
 *   { batchSize: 2, flatten: true }
 * )
 * // Output: [2, 4, 6, 8, 10, 12]
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
export async function batchProcess<T = any, R = any>(
  targets: T[],
  callback: (prop: T) => Promise<R>,
  options: BatchProcessOptions & { flatten: true }
): Promise<Array<R>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-redeclare
export async function batchProcess<T = any, R = any>(
  targets: T[],
  callback: (prop: T) => Promise<R>,
  options?: BatchProcessOptions & { flatten?: false }
): Promise<Array<Array<R>>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-redeclare
export async function batchProcess<T = any, R = any>(
  targets: T[],
  callback: (prop: T) => Promise<R>,
  options?: BatchProcessOptions
): Promise<Array<Array<R>> | Array<R>> {
  const batchSize = options?.batchSize ?? 1
  const batches = arrayBatch<T>(targets, batchSize)
  const continueOnError = options?.continueOnError ?? false

  const results: Array<Array<R>> = []
  let completed = 0
  const total = batches.length

  // Helper function to wrap a promise with timeout
  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        // eslint-disable-next-line no-undef
        setTimeout(() => reject(new Error(`Task timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ])
  }

  // Helper function to execute a single item with retry
  const executeWithRetry = async (item: T): Promise<R> => {
    const maxAttempts = options?.retry?.maxAttempts ?? 1
    const backoff = options?.retry?.backoff ?? 'linear'
    const initialDelay = options?.retry?.initialDelay ?? 100

    let lastError: unknown
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const taskPromise = callback(item)
        const result = options?.timeout
          ? await withTimeout(taskPromise, options.timeout)
          : await taskPromise
        return result
      } catch (error) {
        lastError = error

        // If we've exhausted all attempts, throw the error
        if (attempt >= maxAttempts) {
          throw error
        }

        // Calculate delay for next retry
        let delay: number
        if (backoff === 'exponential') {
          delay = initialDelay * Math.pow(2, attempt - 1)
        } else {
          delay = initialDelay
        }

        // Wait before retrying
        // eslint-disable-next-line no-undef
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError
  }

  // Helper function to handle errors based on continueOnError setting
  const executeWithErrorHandling = async (item: T): Promise<R> => {
    try {
      return await executeWithRetry(item)
    } catch (error) {
      if (continueOnError) {
        // Return the error as part of the result
        return error as R
      }
      throw error
    }
  }

  for (const batch of batches) {
    // Add delay before processing batch (except for the first batch)
    if (completed > 0 && options?.delayBetweenBatches) {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches))
    }

    const batchResults = await Promise.all(batch.map(executeWithErrorHandling))
    results.push(batchResults)
    completed++

    if (options?.onProgress) {
      options.onProgress(completed, total)
    }
  }

  // Flatten results if requested
  if (options?.flatten) {
    return results.flat() as Array<R>
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
 *
 * @throws {Error} If batchSize is not a positive integer
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const arrayBatch = <T = any>(inputArray: T[], batchSize = 1): T[][] => {
  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error('batchSize must be a positive integer')
  }

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