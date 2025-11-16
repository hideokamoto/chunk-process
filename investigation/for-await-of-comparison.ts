/**
 * Comparison: batchProcess vs native batch processing
 *
 * This file compares the library's batchProcess function against
 * native JavaScript approaches for batch processing.
 */

import { batchProcess } from '../libs/index'

// Dummy async function to simulate work
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function processItem(item: number): Promise<string> {
  await delay(100)
  return `Processed: ${item}`
}

// ====================
// Batch processing comparison
// ====================

async function usingBatchProcess() {
  console.log('\n=== Using batchProcess (library) ===')
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

async function usingNativeBatching() {
  console.log('\n=== Using native batch processing ===')
  const start = Date.now()

  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const batchSize = 3
  const results: string[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    )
    results.push(batchResults)
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
  console.log('Starting batch processing comparison...\n')

  // Batch processing comparison
  await usingBatchProcess()
  await usingNativeBatching()

  // Print analysis
  printAnalysis()
}

main().catch(console.error)
