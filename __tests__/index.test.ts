import {
  arrayChunk,
  batchProcess
} from '../libs/index'

const createArrayByLength = (length: number): Array<number> => {
  return [...Array(length)].fill(0).map((x,i) => x+i)
}

describe('batchProcess', () => {
  it('should return the result as chunked', async() => {
    const result = await batchProcess<number, number>([1,2,3], async (number) => number + 1, {
      chunkSize: 2
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
  ])('given %i items and the chunk size is %p, should the array be %p', async(length, chunkSize, expectedArrayLength) => {
    const list = createArrayByLength(length)
    const result = await batchProcess<number, number>(list, async (number) => number + 1, {
      chunkSize
    })
    expect(result.length).toEqual(expectedArrayLength)
  })
})

describe('arrayChunk', () => {
  it.each([
    [5, 3, 2],
    [5, 5, 1],
    [10, 9, 2],
    [10, 11, 1],
  ])('given %i items and the chunk size is %p, should the array be %p', (length, chunkSize, expectedArrayLength) => {
    const list = createArrayByLength(length)
    const chunkedArray = arrayChunk(list, chunkSize)
    expect(chunkedArray.length).toEqual(expectedArrayLength)
  })
})