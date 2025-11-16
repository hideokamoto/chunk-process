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
})