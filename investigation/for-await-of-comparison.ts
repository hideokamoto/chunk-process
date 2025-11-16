/**
 * Comparison: batchProcess vs for...of
 *
 * This file investigates whether the library is really necessary
 * or if native for...of is sufficient.
 */

import { batchProcess } from '../libs/index'

// Dummy async function to simulate work
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function processItem(item: number): Promise<string> {
  await delay(100)
  return `Processed: ${item}`
}

// ====================
// Test 1: Chunk processing comparison
// ====================

async function usingLibraryWithChunk() {
  console.log('\n=== Using batchProcess ===')
  const start = Date.now()

  const results = await batchProcess(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    async (i) => await processItem(i),
    { batchSize: 3 }
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
  const batchSize = 3
  const results: string[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
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
// Analysis Summary
// ====================

function printAnalysis() {
  console.log('\n' + '='.repeat(60))
  console.log('ANALYSIS: Does batchProcess add value?')
  console.log('='.repeat(60))
  console.log(`
Pros of batchProcess:
- Clean API for batch processing
- Type-safe with generics
- Saves writing chunk logic repeatedly

Cons of batchProcess:
- Additional dependency
- Manual chunking is only 5 lines of code
- Native approach is easier to customize

Conclusion:
For chunk processing, batchProcess provides convenience
but manual implementation is straightforward.

Value depends on how often you need chunk processing.
`)
}

// ====================
// Run all tests
// ====================

async function main() {
  console.log('Starting comparison tests...\n')

  // Chunk processing comparison
  await usingLibraryWithChunk()
  await usingForOfWithChunk()

  // Print analysis
  printAnalysis()
}

main().catch(console.error)
