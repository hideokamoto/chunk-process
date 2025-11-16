/**
 * Comparison: sequentialPromise vs for...of
 *
 * This file investigates whether the library is really necessary
 * or if native for...of is sufficient.
 */

import sequentialPromise, { sequentialPromiseWithChunk } from '../libs/index'

// Dummy async function to simulate work
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function processItem(item: number): Promise<string> {
  await delay(100)
  return `Processed: ${item}`
}

// ====================
// Test 1: Basic sequential processing
// ====================

async function usingLibrary() {
  console.log('\n=== Using sequentialPromise ===')
  const start = Date.now()

  const results = await sequentialPromise([1, 2, 3, 4, 5], async (i) => {
    return await processItem(i)
  })

  const elapsed = Date.now() - start
  console.log('Results:', results)
  console.log(`Time: ${elapsed}ms`)
  return { results, elapsed }
}

async function usingForOf() {
  console.log('\n=== Using for...of ===')
  const start = Date.now()

  const results: string[] = []
  for (const i of [1, 2, 3, 4, 5]) {
    const result = await processItem(i)
    results.push(result)
  }

  const elapsed = Date.now() - start
  console.log('Results:', results)
  console.log(`Time: ${elapsed}ms`)
  return { results, elapsed }
}

// ====================
// Test 2: Chunk processing
// ====================

async function usingLibraryWithChunk() {
  console.log('\n=== Using sequentialPromiseWithChunk ===')
  const start = Date.now()

  const results = await sequentialPromiseWithChunk(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    async (i) => await processItem(i),
    { chunkSize: 3 }
  )

  const elapsed = Date.now() - start
  console.log('Results:', results)
  console.log(`Time: ${elapsed}ms`)
  return { results, elapsed }
}

async function usingForOfWithChunk() {
  console.log('\n=== Using for...of with chunking ===')
  const start = Date.now()

  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const chunkSize = 3
  const results: string[][] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(
      chunk.map(item => processItem(item))
    )
    results.push(chunkResults)
  }

  const elapsed = Date.now() - start
  console.log('Results:', results)
  console.log(`Time: ${elapsed}ms`)
  return { results, elapsed }
}

// ====================
// Test 3: Error handling
// ====================

async function processWithError(item: number): Promise<string> {
  await delay(50)
  if (item === 3) {
    throw new Error(`Error at item ${item}`)
  }
  return `Processed: ${item}`
}

async function errorHandlingLibrary() {
  console.log('\n=== Error handling with library ===')
  try {
    await sequentialPromise([1, 2, 3, 4, 5], async (i) => {
      return await processWithError(i)
    })
  } catch (error) {
    console.log('Caught error:', (error as Error).message)
  }
}

async function errorHandlingForOf() {
  console.log('\n=== Error handling with for...of ===')
  try {
    const results: string[] = []
    for (const i of [1, 2, 3, 4, 5]) {
      const result = await processWithError(i)
      results.push(result)
    }
  } catch (error) {
    console.log('Caught error:', (error as Error).message)
  }
}

// ====================
// Analysis Summary
// ====================

function printAnalysis() {
  console.log('\n' + '='.repeat(60))
  console.log('ANALYSIS: Does this library have value?')
  console.log('='.repeat(60))
  console.log(`
Pros of the library:
- Slightly cleaner API (callback-based)
- Type-safe with generics
- Ready-made chunk utility

Cons of the library:
- Additional dependency
- for...of is more readable and straightforward
- for...of is a native feature (no bundle size)
- for...of is easier to debug (no promise chaining)
- for...of allows more flexible control flow (break, continue)

Conclusion:
For simple sequential processing, for...of is clearly better.
For chunk processing, for...of + Promise.all is just 5 lines.

The library adds minimal value in modern JavaScript/TypeScript.
`)
}

// ====================
// Run all tests
// ====================

async function main() {
  console.log('Starting comparison tests...\n')

  // Test 1: Basic sequential
  await usingLibrary()
  await usingForOf()

  // Test 2: Chunk processing
  await usingLibraryWithChunk()
  await usingForOfWithChunk()

  // Test 3: Error handling
  await errorHandlingLibrary()
  await errorHandlingForOf()

  // Print analysis
  printAnalysis()
}

main().catch(console.error)
