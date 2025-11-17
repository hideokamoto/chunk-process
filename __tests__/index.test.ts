import {
  arrayBatch,
  batchProcess
} from '../libs/index'

const createArrayByLength = (length: number): Array<number> => {
  return [...Array(length)].fill(0).map((x,i) => x+i)
}

describe('batchProcess', () => {
  it('should return the result as batched', async() => {
    const result = await batchProcess<number, number>([1,2,3], async (number) => number + 1, {
      batchSize: 2
    })
    expect(result).toEqual([
      [2,3],
      [4]
    ])
  })
  it.each([
    [5, 3, 2],
    [5, 5, 1],
    [10, 9, 2],
    [10, 11, 1],
  ])('given %i items and the batch size is %p, should the array be %p', async(length, batchSize, expectedArrayLength) => {
    const list = createArrayByLength(length)
    const result = await batchProcess<number, number>(list, async (number) => number + 1, {
      batchSize
    })
    expect(result.length).toEqual(expectedArrayLength)
  })
})

describe('arrayBatch', () => {
  it.each([
    [5, 3, 2],
    [5, 5, 1],
    [10, 9, 2],
    [10, 11, 1],
  ])('given %i items and the batch size is %p, should the array be %p', (length, batchSize, expectedArrayLength) => {
    const list = createArrayByLength(length)
    const batchedArray = arrayBatch(list, batchSize)
    expect(batchedArray.length).toEqual(expectedArrayLength)
  })

  it('should handle empty array', () => {
    const result = arrayBatch([], 3)
    expect(result).toEqual([])
  })

  it('should handle single item with batchSize 1', () => {
    const result = arrayBatch([1], 1)
    expect(result).toEqual([[1]])
  })

  it('should handle single item with batchSize > 1', () => {
    const result = arrayBatch([1], 5)
    expect(result).toEqual([[1]])
  })

  it('should handle batchSize larger than array length', () => {
    const result = arrayBatch([1, 2, 3], 10)
    expect(result).toEqual([[1, 2, 3]])
  })

  it('should throw error for batchSize of 0', () => {
    expect(() => arrayBatch([1, 2, 3], 0)).toThrow('batchSize must be a positive integer')
  })

  it('should throw error for negative batchSize', () => {
    expect(() => arrayBatch([1, 2, 3], -1)).toThrow('batchSize must be a positive integer')
  })

  it('should throw error for non-integer batchSize', () => {
    expect(() => arrayBatch([1, 2, 3], 1.5)).toThrow('batchSize must be a positive integer')
  })

  it('should throw error for NaN batchSize', () => {
    expect(() => arrayBatch([1, 2, 3], NaN)).toThrow('batchSize must be a positive integer')
  })
})

describe('batchProcess - edge cases', () => {
  it('should handle empty array', async () => {
    const result = await batchProcess<number, number>([], async (num) => num * 2)
    expect(result).toEqual([])
  })

  it('should handle single item with batchSize 1', async () => {
    const result = await batchProcess<number, number>([5], async (num) => num * 2, {
      batchSize: 1
    })
    expect(result).toEqual([[10]])
  })

  it('should handle single item with batchSize > 1', async () => {
    const result = await batchProcess<number, number>([5], async (num) => num * 2, {
      batchSize: 10
    })
    expect(result).toEqual([[10]])
  })

  it('should handle batchSize larger than input length', async () => {
    const result = await batchProcess<number, number>([1, 2, 3], async (num) => num * 2, {
      batchSize: 10
    })
    expect(result).toEqual([[2, 4, 6]])
  })

  it('should propagate errors from callback', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3], async (num) => {
        if (num === 2) {
          throw new Error('Test error')
        }
        return num * 2
      })
    ).rejects.toThrow('Test error')
  })

  it('should propagate errors from async callback', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3, 4], async (num) => {
        if (num === 3) {
          throw new Error('Async error at item 3')
        }
        return num * 2
      }, { batchSize: 2 })
    ).rejects.toThrow('Async error at item 3')
  })

  it('should handle Promise.reject in callback', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3], async (num) => {
        if (num === 2) {
          return Promise.reject(new Error('Rejected promise'))
        }
        return num * 2
      })
    ).rejects.toThrow('Rejected promise')
  })

  it('should throw error for batchSize of 0', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3], async (num) => num * 2, { batchSize: 0 })
    ).rejects.toThrow('batchSize must be a positive integer')
  })

  it('should throw error for negative batchSize', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3], async (num) => num * 2, { batchSize: -5 })
    ).rejects.toThrow('batchSize must be a positive integer')
  })

  it('should throw error for non-integer batchSize', async () => {
    await expect(
      batchProcess<number, number>([1, 2, 3], async (num) => num * 2, { batchSize: 2.5 })
    ).rejects.toThrow('batchSize must be a positive integer')
  })
})

describe('batchProcess - progress tracking', () => {
  it('should call onProgress callback with correct values', async () => {
    const progressUpdates: Array<{ completed: number; total: number }> = []

    await batchProcess<number, number>(
      [1, 2, 3, 4, 5, 6, 7],
      async (num) => num * 2,
      {
        batchSize: 3,
        onProgress: (completed, total) => {
          progressUpdates.push({ completed, total })
        }
      }
    )

    expect(progressUpdates).toEqual([
      { completed: 1, total: 3 },
      { completed: 2, total: 3 },
      { completed: 3, total: 3 }
    ])
  })

  it('should work without onProgress callback', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => num * 2,
      { batchSize: 2 }
    )
    expect(result).toEqual([[2, 4], [6]])
  })

  it('should call onProgress for single batch', async () => {
    const progressUpdates: Array<{ completed: number; total: number }> = []

    await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => num * 2,
      {
        batchSize: 10,
        onProgress: (completed, total) => {
          progressUpdates.push({ completed, total })
        }
      }
    )

    expect(progressUpdates).toEqual([
      { completed: 1, total: 1 }
    ])
  })
})

describe('batchProcess - delay between batches', () => {
  it('should wait specified time between batches', async () => {
    const timestamps: number[] = []

    await batchProcess<number, number>(
      [1, 2, 3, 4, 5, 6],
      async (num) => {
        timestamps.push(Date.now())
        return num * 2
      },
      {
        batchSize: 2,
        delayBetweenBatches: 100
      }
    )

    // We should have 3 batches
    expect(timestamps.length).toBe(6)

    // Check that there's approximately 100ms delay between batches
    // Batch 1: items 0, 1 (no delay before)
    // Batch 2: items 2, 3 (100ms delay before)
    // Batch 3: items 4, 5 (100ms delay before)

    // Allow some margin for timing variations (50ms)
    const batch1End = Math.max(timestamps[0], timestamps[1])
    const batch2Start = Math.min(timestamps[2], timestamps[3])
    const delay1 = batch2Start - batch1End

    expect(delay1).toBeGreaterThanOrEqual(80) // At least 80ms
    expect(delay1).toBeLessThan(150) // Less than 150ms
  })

  it('should not delay before the first batch', async () => {
    const startTime = Date.now()

    await batchProcess<number, number>(
      [1, 2],
      async (num) => num * 2,
      {
        batchSize: 2,
        delayBetweenBatches: 100
      }
    )

    const duration = Date.now() - startTime

    // Should complete quickly without initial delay
    expect(duration).toBeLessThan(50)
  })

  it('should work without delay option', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3, 4],
      async (num) => num * 2,
      { batchSize: 2 }
    )

    expect(result).toEqual([[2, 4], [6, 8]])
  })

  it('should handle delay of 0', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3, 4],
      async (num) => num * 2,
      {
        batchSize: 2,
        delayBetweenBatches: 0
      }
    )

    expect(result).toEqual([[2, 4], [6, 8]])
  })
})

describe('batchProcess - retry mechanism', () => {
  it('should retry failed tasks up to maxAttempts', async () => {
    let attemptCount = 0

    const result = await batchProcess<number, number>(
      [1],
      async (num) => {
        attemptCount++
        if (attemptCount < 3) {
          throw new Error('Temporary failure')
        }
        return num * 2
      },
      {
        retry: { maxAttempts: 3 }
      }
    )

    expect(attemptCount).toBe(3)
    expect(result).toEqual([[2]])
  })

  it('should fail after exceeding maxAttempts', async () => {
    let attemptCount = 0

    await expect(
      batchProcess<number, number>(
        [1],
        async (num) => {
          attemptCount++
          throw new Error('Persistent failure')
        },
        {
          retry: { maxAttempts: 2 }
        }
      )
    ).rejects.toThrow('Persistent failure')

    expect(attemptCount).toBe(2)
  })

  it('should use exponential backoff', async () => {
    const timestamps: number[] = []
    let attemptCount = 0

    await batchProcess<number, number>(
      [1],
      async (num) => {
        timestamps.push(Date.now())
        attemptCount++
        if (attemptCount < 3) {
          throw new Error('Temporary failure')
        }
        return num * 2
      },
      {
        retry: { maxAttempts: 3, backoff: 'exponential', initialDelay: 50 }
      }
    )

    // First retry should wait ~50ms, second retry ~100ms
    const delay1 = timestamps[1] - timestamps[0]
    const delay2 = timestamps[2] - timestamps[1]

    expect(delay1).toBeGreaterThanOrEqual(40)
    expect(delay1).toBeLessThan(80)
    expect(delay2).toBeGreaterThanOrEqual(90)
    expect(delay2).toBeLessThan(150)
  })

  it('should use linear backoff', async () => {
    const timestamps: number[] = []
    let attemptCount = 0

    await batchProcess<number, number>(
      [1],
      async (num) => {
        timestamps.push(Date.now())
        attemptCount++
        if (attemptCount < 3) {
          throw new Error('Temporary failure')
        }
        return num * 2
      },
      {
        retry: { maxAttempts: 3, backoff: 'linear', initialDelay: 50 }
      }
    )

    // Both retries should wait ~50ms
    const delay1 = timestamps[1] - timestamps[0]
    const delay2 = timestamps[2] - timestamps[1]

    expect(delay1).toBeGreaterThanOrEqual(40)
    expect(delay1).toBeLessThan(80)
    expect(delay2).toBeGreaterThanOrEqual(40)
    expect(delay2).toBeLessThan(80)
  })

  it('should work without retry option', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => num * 2
    )

    expect(result).toEqual([[2], [4], [6]])
  })

  it('should retry individual items in a batch independently', async () => {
    const attempts: Record<number, number> = { 1: 0, 2: 0, 3: 0 }

    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => {
        attempts[num]++
        if (num === 2 && attempts[2] < 2) {
          throw new Error('Item 2 fails once')
        }
        return num * 2
      },
      {
        batchSize: 3,
        retry: { maxAttempts: 2 }
      }
    )

    expect(attempts[1]).toBe(1) // Succeeds on first try
    expect(attempts[2]).toBe(2) // Fails once, then succeeds
    expect(attempts[3]).toBe(1) // Succeeds on first try
    expect(result).toEqual([[2, 4, 6]])
  })

  it('should treat maxAttempts of 0 as 1 attempt', async () => {
    let attemptCount = 0

    await expect(
      batchProcess<number, number>(
        [1],
        async () => {
          attemptCount++
          throw new Error('Always fails')
        },
        {
          retry: { maxAttempts: 0 }
        }
      )
    ).rejects.toThrow('Always fails')

    expect(attemptCount).toBe(1) // Should try at least once
  })

  it('should treat negative maxAttempts as 1 attempt', async () => {
    let attemptCount = 0

    await expect(
      batchProcess<number, number>(
        [1],
        async () => {
          attemptCount++
          throw new Error('Always fails')
        },
        {
          retry: { maxAttempts: -5 }
        }
      )
    ).rejects.toThrow('Always fails')

    expect(attemptCount).toBe(1) // Should try at least once
  })

  it('should cap exponential backoff delay', async () => {
    const timestamps: number[] = []
    let attemptCount = 0

    await expect(
      batchProcess<number, number>(
        [1],
        async () => {
          timestamps.push(Date.now())
          attemptCount++
          throw new Error('Always fails')
        },
        {
          // Use 40000ms initial delay so attempt 3 would be 160000ms without cap
          retry: { maxAttempts: 3, backoff: 'exponential', initialDelay: 40000 }
        }
      )
    ).rejects.toThrow('Always fails')

    expect(attemptCount).toBe(3)

    // Check that delays are capped at MAX_BACKOFF_DELAY (60000ms)
    // With initial 40000ms and exponential backoff:
    // Attempt 1: no delay
    // Attempt 2: 40000ms delay
    // Attempt 3: 160000ms -> capped to 60000ms

    // Check delay between attempts 2 and 3 (should be capped)
    const delay2 = timestamps[2] - timestamps[1]
    expect(delay2).toBeGreaterThanOrEqual(55000) // Close to cap
    expect(delay2).toBeLessThanOrEqual(65000) // Should be capped at 60s
  }, 120000) // 2 minute timeout for this test
})

describe('batchProcess - error handling strategy', () => {
  it('should continue processing when continueOnError is true', async () => {
    const result = await batchProcess<number, number | Error>(
      [1, 2, 3, 4, 5],
      async (num) => {
        if (num === 2 || num === 4) {
          throw new Error(`Error at ${num}`)
        }
        return num * 2
      },
      {
        batchSize: 2,
        continueOnError: true
      }
    )

    // Check that we got results for all batches
    expect(result.length).toBe(3)

    // First batch: [1, 2] - 1 succeeds, 2 fails
    expect(result[0][0]).toBe(2)
    expect(result[0][1]).toBeInstanceOf(Error)
    expect((result[0][1] as Error).message).toBe('Error at 2')

    // Second batch: [3, 4] - 3 succeeds, 4 fails
    expect(result[1][0]).toBe(6)
    expect(result[1][1]).toBeInstanceOf(Error)
    expect((result[1][1] as Error).message).toBe('Error at 4')

    // Third batch: [5] - 5 succeeds
    expect(result[2][0]).toBe(10)
  })

  it('should stop on first error when continueOnError is false (default)', async () => {
    await expect(
      batchProcess<number, number>(
        [1, 2, 3, 4],
        async (num) => {
          if (num === 2) {
            throw new Error('Error at 2')
          }
          return num * 2
        },
        { batchSize: 2 }
      )
    ).rejects.toThrow('Error at 2')
  })

  it('should provide error metadata with continueOnError', async () => {
    const result = await batchProcess<number, number | Error>(
      [1, 2, 3],
      async (num) => {
        if (num === 2) {
          throw new Error('Failed item')
        }
        return num * 2
      },
      {
        continueOnError: true
      }
    )

    expect(result).toEqual([
      [2],
      [expect.any(Error)],
      [6]
    ])

    const error = result[1][0] as Error
    expect(error.message).toBe('Failed item')
  })

  it('should work with retry and continueOnError together', async () => {
    let attempt2 = 0

    const result = await batchProcess<number, number | Error>(
      [1, 2, 3],
      async (num) => {
        if (num === 2) {
          attempt2++
          throw new Error('Always fails')
        }
        return num * 2
      },
      {
        continueOnError: true,
        retry: { maxAttempts: 3 }
      }
    )

    expect(attempt2).toBe(3) // Should retry 3 times
    expect(result[0][0]).toBe(2) // Item 1 succeeds
    expect(result[1][0]).toBeInstanceOf(Error) // Item 2 fails after retries
    expect(result[2][0]).toBe(6) // Item 3 succeeds
  })

  it('should collect all errors when all items fail with continueOnError', async () => {
    const result = await batchProcess<number, number | Error>(
      [1, 2, 3],
      async (num) => {
        throw new Error(`Error ${num}`)
      },
      {
        continueOnError: true
      }
    )

    expect(result.length).toBe(3)
    expect(result[0][0]).toBeInstanceOf(Error)
    expect(result[1][0]).toBeInstanceOf(Error)
    expect(result[2][0]).toBeInstanceOf(Error)
    expect((result[0][0] as Error).message).toBe('Error 1')
    expect((result[1][0] as Error).message).toBe('Error 2')
    expect((result[2][0] as Error).message).toBe('Error 3')
  })
})

describe('batchProcess - flatten results', () => {
  it('should return flat array when flatten is true', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3, 4, 5, 6],
      async (num) => num * 2,
      {
        batchSize: 2,
        flatten: true
      }
    )

    expect(result).toEqual([2, 4, 6, 8, 10, 12])
  })

  it('should return nested array when flatten is false (default)', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3, 4, 5, 6],
      async (num) => num * 2,
      {
        batchSize: 2
      }
    )

    expect(result).toEqual([[2, 4], [6, 8], [10, 12]])
  })

  it('should work with flatten and single item batches', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => num * 2,
      {
        batchSize: 1,
        flatten: true
      }
    )

    expect(result).toEqual([2, 4, 6])
  })

  it('should work with flatten and all items in one batch', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => num * 2,
      {
        batchSize: 10,
        flatten: true
      }
    )

    expect(result).toEqual([2, 4, 6])
  })

  it('should work with flatten and continueOnError', async () => {
    const result = await batchProcess<number, number | Error>(
      [1, 2, 3, 4],
      async (num) => {
        if (num === 2) {
          throw new Error('Error at 2')
        }
        return num * 2
      },
      {
        batchSize: 2,
        flatten: true,
        continueOnError: true
      }
    )

    expect(result.length).toBe(4)
    expect(result[0]).toBe(2)
    expect(result[1]).toBeInstanceOf(Error)
    expect(result[2]).toBe(6)
    expect(result[3]).toBe(8)
  })

  it('should return empty array when input is empty with flatten', async () => {
    const result = await batchProcess<number, number>(
      [],
      async (num) => num * 2,
      {
        flatten: true
      }
    )

    expect(result).toEqual([])
  })
})

describe('batchProcess - timeout', () => {
  it('should timeout tasks that exceed the timeout limit', async () => {
    await expect(
      batchProcess<number, number>(
        [1, 2, 3],
        async (num) => {
          if (num === 2) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          return num * 2
        },
        {
          timeout: 100
        }
      )
    ).rejects.toThrow('Task timed out after 100ms')
  })

  it('should complete successfully when all tasks finish within timeout', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return num * 2
      },
      {
        timeout: 100
      }
    )

    expect(result).toEqual([[2], [4], [6]])
  })

  it('should work without timeout option', async () => {
    const result = await batchProcess<number, number>(
      [1, 2, 3],
      async (num) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return num * 2
      }
    )

    expect(result).toEqual([[2], [4], [6]])
  })

  it('should work with timeout and continueOnError', async () => {
    const result = await batchProcess<number, number | Error>(
      [1, 2, 3],
      async (num) => {
        if (num === 2) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        return num * 2
      },
      {
        timeout: 100,
        continueOnError: true
      }
    )

    expect(result.length).toBe(3)
    expect(result[0][0]).toBe(2)
    expect(result[1][0]).toBeInstanceOf(Error)
    expect((result[1][0] as Error).message).toContain('timed out')
    expect(result[2][0]).toBe(6)
  })

  it('should work with timeout and retry', async () => {
    let attempt = 0

    const result = await batchProcess<number, number>(
      [1],
      async (num) => {
        attempt++
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        return num * 2
      },
      {
        timeout: 100,
        retry: { maxAttempts: 2 }
      }
    )

    expect(attempt).toBe(2) // First attempt times out, second succeeds
    expect(result).toEqual([[2]])
  })

  it('should timeout each task independently in a batch', async () => {
    await expect(
      batchProcess<number, number>(
        [1, 2, 3],
        async (num) => {
          const delay = num === 2 ? 200 : 50
          await new Promise(resolve => setTimeout(resolve, delay))
          return num * 2
        },
        {
          batchSize: 3,
          timeout: 100
        }
      )
    ).rejects.toThrow('Task timed out after 100ms')
  })
})