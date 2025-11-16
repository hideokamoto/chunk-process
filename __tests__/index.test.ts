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