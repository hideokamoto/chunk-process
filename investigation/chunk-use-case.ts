/**
 * Deep dive: Is chunk processing the killer feature?
 *
 * Testing the hypothesis: "Creating chunks manually is annoying,
 * so the library provides value for chunk-based parallel processing"
 */

import { batchProcess } from '../libs/index'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function processItem(item: number): Promise<string> {
  await delay(10)
  return `Item ${item}`
}

// Create 100 items
const items = Array.from({ length: 100 }, (_, i) => i + 1)

// ====================
// Method 1: Using the library
// ====================
async function usingLibrary() {
  console.log('\n=== Using batchProcess ===')
  const start = Date.now()

  const results = await batchProcess(
    items,
    async (item) => await processItem(item),
    { batchSize: 5 }
  )

  const elapsed = Date.now() - start
  console.log(`Processed ${items.length} items in chunks of 5`)
  console.log(`Time: ${elapsed}ms`)
  console.log(`Chunks: ${results.length}`)
  return { results, elapsed }
}

// ====================
// Method 2: Manual chunking (verbose)
// ====================
async function manualChunkingVerbose() {
  console.log('\n=== Manual chunking (verbose) ===')
  const start = Date.now()

  const batchSize = 5
  const results: string[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
    const chunkResults = await Promise.all(
      chunk.map(item => processItem(item))
    )
    results.push(chunkResults)
  }

  const elapsed = Date.now() - start
  console.log(`Processed ${items.length} items in chunks of 5`)
  console.log(`Time: ${elapsed}ms`)
  console.log(`Chunks: ${results.length}`)
  return { results, elapsed }
}

// ====================
// Method 3: Helper function (reusable)
// ====================
async function processInChunks<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[][]> {
  const results: R[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
    const chunkResults = await Promise.all(chunk.map(processor))
    results.push(chunkResults)
  }
  return results
}

async function usingHelperFunction() {
  console.log('\n=== Using helper function ===')
  const start = Date.now()

  const results = await processInChunks(items, 5, processItem)

  const elapsed = Date.now() - start
  console.log(`Processed ${items.length} items in chunks of 5`)
  console.log(`Time: ${elapsed}ms`)
  console.log(`Chunks: ${results.length}`)
  return { results, elapsed }
}

// ====================
// Method 4: Inline with array helper
// ====================
async function usingInlineChunk() {
  console.log('\n=== Inline with chunk helper ===')
  const start = Date.now()

  // Simple chunk utility (can be in utils)
  const chunk = <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  const results: string[][] = []
  for (const batch of chunk(items, 5)) {
    const batchResults = await Promise.all(batch.map(processItem))
    results.push(batchResults)
  }

  const elapsed = Date.now() - start
  console.log(`Processed ${items.length} items in chunks of 5`)
  console.log(`Time: ${elapsed}ms`)
  console.log(`Chunks: ${results.length}`)
  return { results, elapsed }
}

// ====================
// Code comparison
// ====================
function printCodeComparison() {
  console.log('\n' + '='.repeat(70))
  console.log('CODE COMPARISON')
  console.log('='.repeat(70))

  console.log(`
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Using Library (needs npm install)                                │
└─────────────────────────────────────────────────────────────────────┘

import { batchProcess } from '@hideokamoto/sequential-promise'

const results = await batchProcess(
  items,
  async (item) => await processItem(item),
  { batchSize: 5 }
)

Pros: Clean API, ready to use
Cons: External dependency, bundle size, nested arrays return


┌─────────────────────────────────────────────────────────────────────┐
│ 2. Manual (no dependencies)                                          │
└─────────────────────────────────────────────────────────────────────┘

const results: string[][] = []
for (let i = 0; i < items.length; i += 5) {
  const chunk = items.slice(i, i + 5)
  const chunkResults = await Promise.all(chunk.map(item => processItem(item)))
  results.push(chunkResults)
}

Pros: No dependencies, straightforward, easy to customize
Cons: Slightly more verbose (5 lines)


┌─────────────────────────────────────────────────────────────────────┐
│ 3. With reusable helper (best of both worlds)                        │
└─────────────────────────────────────────────────────────────────────┘

// utils.ts (write once, reuse forever)
async function processInChunks<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[][]> {
  const results: R[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize)
    results.push(await Promise.all(chunk.map(processor)))
  }
  return results
}

// usage.ts
const results = await processInChunks(items, 5, processItem)

Pros: Reusable, no external deps, type-safe, customizable
Cons: Need to write it once (10 lines, copy-paste ready)


┌─────────────────────────────────────────────────────────────────────┐
│ 4. Inline with chunk utility (most readable)                         │
└─────────────────────────────────────────────────────────────────────┘

const chunk = <T>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )

const results: string[][] = []
for (const batch of chunk(items, 5)) {
  results.push(await Promise.all(batch.map(processItem)))
}

Pros: Very readable, no deps, flexible
Cons: Need chunk utility (2 lines)
`)
}

// ====================
// Analysis
// ====================
function printAnalysis() {
  console.log('\n' + '='.repeat(70))
  console.log('VERDICT: Is chunk processing the killer feature?')
  console.log('='.repeat(70))
  console.log(`
🤔 The question: "Is it worth a dependency just to avoid writing chunk logic?"

📊 The reality:
- Manual chunking: 5 lines of straightforward code
- Helper function: 10 lines (write once, reuse forever)
- Library approach: Adds dependency, bundle size, maintenance burden

💡 The answer: **Probably not worth it**

Reasons:
1. Chunk logic is trivial (5-10 lines)
2. Copy-paste ready (from Stack Overflow, ChatGPT, etc.)
3. Native code is easier to debug and customize
4. No breaking changes when library updates
5. Zero bundle size impact
6. You probably already have a utils folder

⚠️  When the library MIGHT be worth it:
- You're allergic to writing any utility functions
- Your team has zero experience with chunking
- You want a battle-tested implementation (but it's so simple...)

🎯 Recommendation:
Just copy-paste the helper function into your utils.
It's 10 lines and you'll never have to think about it again.
`)
}

// ====================
// Real-world example
// ====================
async function realWorldExample() {
  console.log('\n' + '='.repeat(70))
  console.log('REAL WORLD: API rate limiting (100 API calls, 5 concurrent)')
  console.log('='.repeat(70))

  // Simulate API calls
  const userIds = Array.from({ length: 100 }, (_, i) => i + 1)

  async function fetchUserData(userId: number) {
    await delay(20) // Simulate API latency
    return { id: userId, name: `User ${userId}` }
  }

  console.log('\n📦 Library approach:')
  console.log('─'.repeat(70))
  console.log('const results = await batchProcess(')
  console.log('  userIds,')
  console.log('  async (id) => await fetchUserData(id),')
  console.log('  { batchSize: 5 }')
  console.log(')')

  console.log('\n🔧 Native approach:')
  console.log('─'.repeat(70))
  console.log('const results = []')
  console.log('for (let i = 0; i < userIds.length; i += 5) {')
  console.log('  const chunk = userIds.slice(i, i + 5)')
  console.log('  const users = await Promise.all(chunk.map(fetchUserData))')
  console.log('  results.push(...users) // or results.push(users) for nested')
  console.log('}')

  console.log('\n💬 Which would you rather maintain? 🤔')
}

// ====================
// Run all tests
// ====================
async function main() {
  console.log('Testing chunk processing with 100 items, 5 per chunk\n')

  await usingLibrary()
  await manualChunkingVerbose()
  await usingHelperFunction()
  await usingInlineChunk()

  printCodeComparison()
  printAnalysis()
  await realWorldExample()
}

main().catch(console.error)
