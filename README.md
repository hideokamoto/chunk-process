# Sequential Promise
Chunked parallel async task runner for rate limiting and resource control

> [!WARNING]
> **Breaking Changes in Major Update**
>
> This library has undergone significant implementation changes. If you're upgrading from v1.1.1 or v1.1.2, the `arrayChunk` function has been removed. Use `arrayBatch` instead. See the [Breaking Changes](#breaking-changes-in-major-update) section below for migration details.

## API Docs
https://hideokamoto.github.io/sequential-promise/

## Why Sequential Promise?

When using `Promise.all()`, all async tasks execute in parallel, which can cause issues in certain scenarios. This library focuses on **chunk-based parallel processing** - executing N items in parallel, then moving to the next batch.

**For simple sequential processing**, use native `for...of`:
```typescript
// No library needed!
const results = []
for (const item of items) {
  const result = await processItem(item)
  results.push(result)
}
```

**This library is useful when you need chunk-based rate limiting** (e.g., 5 concurrent API calls at a time).

## Use Cases

### 1. API Rate Limiting (Main Use Case)
Prevent hitting rate limits when making multiple API calls to external services by processing them in controlled batches.

```typescript
// Process 5 API calls at a time, then move to next batch
await batchProcess(userIds, async (userId) => {
  return await fetchUserDataFromAPI(userId)
}, { batchSize: 5 })
```

### 2. Resource Management
Control memory and CPU usage by limiting concurrent operations.

```typescript
// Process 10 items at a time to avoid memory issues
await batchProcess(largeDataset, async (data) => {
  return await processHeavyOperation(data)
}, { batchSize: 10 })
```

## Benefits

- **Simple API**: Easy-to-use chunk processing without writing boilerplate
- **Type-Safe**: Full TypeScript support with generics
- **Lightweight**: Zero dependencies, minimal footprint
- **Rate Limiting**: Perfect for API rate limits and resource constraints
- **Predictable**: Guaranteed chunk execution order and result order

## Common Scenarios

- External payment API calls (Stripe, PayPal, etc.)
- Bulk file uploads to cloud storage
- Database migrations with dependencies
- Web scraping with request throttling
- Resource-constrained environments (AWS Lambda, edge functions)

## API Overview

This package exports the following functions:

### `batchProcess<T, R>(targets: T[], callback: (prop: T) => Promise<R>, options?: {batchSize?: number}): Promise<Array<Array<R>>>`
Process items in batches, running items within each batch in parallel, but processing batches sequentially.

- **Type Parameters:**
  - `T`: Type of elements in the input array
  - `R`: Type of the result returned by the callback function
- **Options:**
  - `batchSize`: Number of items to process in parallel within each batch (default: 1)
- **Returns:** Nested array of results, grouped by batches

### `arrayBatch<T>(inputArray: T[], batchSize?: number): T[][]`
Utility function to split an array into batches of a specified size.

- **Type Parameters:**
  - `T`: Type of elements in the input array
- **Parameters:**
  - `batchSize`: Size of each batch (default: 1)
- **Returns:** Array of batches

## Quick Start

### TypeScript
```typescript
import batchProcess from '@hideokamoto/sequential-promise'

// Process 100 API calls, 5 at a time
const userIds = Array.from({ length: 100 }, (_, i) => i + 1)

const results = await batchProcess(userIds, async (userId) => {
  const data = await fetchUserFromAPI(userId)
  return data
}, { batchSize: 5 })

console.log(results) // [[user1-5], [user6-10], ...]
```

### JavaScript
```javascript
const batchProcess = require('@hideokamoto/sequential-promise')

// Process items in batches
const results = await batchProcess(items, async (item) => {
  return await processItem(item)
}, { batchSize: 10 })
```

## Advanced Usage

### Using `batchProcess` for Batch Processing

When you need to process items in batches (running multiple items in parallel within each batch, but processing batches sequentially), use `batchProcess`:

```typescript
import { batchProcess } from '@hideokamoto/sequential-promise'

// Process 10 items in batches of 3
// Items 1-3 run in parallel, then 4-6, then 7-9, then 10
const result = await batchProcess<number, number>(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  async (num) => {
    console.log(`Processing: ${num}`)
    await someAsyncOperation(num)
    return num * 2
  },
  { batchSize: 3 }
)

console.log(result)
// Output: [[2, 4, 6], [8, 10, 12], [14, 16, 18], [20]]
```

**Note:** The return type is `Array<Array<R>>` - results are grouped by batches.

### Using `arrayBatch` Utility

You can also use the `arrayBatch` function independently to split arrays:

```typescript
import { arrayBatch } from '@hideokamoto/sequential-promise'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const batches = arrayBatch(items, 3)

console.log(batches)
// Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

This is useful when you need to prepare chunked data for other operations.

## Breaking Changes in Major Update

This library has undergone significant implementation changes in the major version update. If you're upgrading from v1.1.1 or v1.1.2, please review the following breaking changes:

### Removed Functions

- **`arrayChunk`** has been removed. Use `arrayBatch` instead.
  - **Migration:** Replace `arrayChunk(array, size)` with `arrayBatch(array, size)`
  - The function signature and behavior are identical, only the name has changed.

### API Changes

- The core functionality remains the same, but internal implementation has been refactored for better performance and maintainability.
- All existing `batchProcess` and `arrayBatch` APIs remain backward compatible.

### Migration Guide

If you're using the deprecated `arrayChunk` function:

```typescript
// Before (v1.1.x)
import { arrayChunk } from '@hideokamoto/sequential-promise'
const batches = arrayChunk(items, 3)

// After (v2.0.0+)
import { arrayBatch } from '@hideokamoto/sequential-promise'
const batches = arrayBatch(items, 3)
```

For `batchProcess`, no changes are required - it continues to work as before.

## contribution

```bash
// clone
$ git clone git@github.com:hideokamoto/sequential-promise.git
$ cd sequential-promise

// setup
$ yarn

// Unit test
$ yarn test
or
$ yarn run test:watch

// Lint
$ yarn run lint
or
$ yarn run lint --fix

// Build
$ yarn run build

// Rebuild docs
$ yarn run doc
```