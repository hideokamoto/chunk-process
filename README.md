# Chunk Process
Chunked parallel async task runner for rate limiting and resource control

## API Docs
https://hideokamoto.github.io/chunk-process/

## Why Chunk Process?

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
- **Rate Limiting**: Perfect for API rate limits and resource constraints with built-in delay controls
- **Predictable**: Guaranteed chunk execution order and result order
- **Resilient**: Built-in retry mechanisms with exponential/linear backoff strategies
- **Robust Error Handling**: Continue processing on errors with detailed error tracking
- **Progress Tracking**: Monitor batch processing progress in real-time
- **Flexible Output**: Choose between nested or flattened result arrays
- **Timeout Control**: Prevent hanging tasks with configurable timeouts

## Common Scenarios

- External payment API calls (Stripe, PayPal, etc.)
- Bulk file uploads to cloud storage
- Database migrations with dependencies
- Web scraping with request throttling
- Resource-constrained environments (AWS Lambda, edge functions)

## API Overview

This package exports the following functions:

### `batchProcess<T, R>(targets: T[], callback: (prop: T) => Promise<R>, options?: BatchProcessOptions): Promise<Array<Array<R>> | Array<R>>`
Process items in batches, running items within each batch in parallel, but processing batches sequentially.

- **Type Parameters:**
  - `T`: Type of elements in the input array
  - `R`: Type of the result returned by the callback function
- **Options:**
  - `batchSize`: Number of items to process in parallel within each batch (default: 1)
  - `onProgress`: Callback function called after each batch completes, receives (completed, total) batches
  - `delayBetweenBatches`: Delay in milliseconds to wait between batches (useful for rate limiting)
  - `retry`: Retry configuration for failed tasks
    - `maxAttempts`: Maximum number of retry attempts
    - `backoff`: 'linear' or 'exponential' backoff strategy
    - `initialDelay`: Initial delay in milliseconds between retries (default: 100ms)
    - `maxDelay`: Maximum delay in milliseconds for exponential backoff (default: 30000ms)
  - `continueOnError`: If true, errors are returned in results instead of throwing (default: false)
  - `flatten`: If true, returns a flat array instead of nested arrays (default: false)
  - `timeout`: Maximum time in milliseconds for each task to complete (default: no timeout)
- **Returns:** Nested array of results (or flat array if `flatten: true`)

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
import batchProcess from 'chunk-process'

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
const batchProcess = require('chunk-process')

// Process items in batches
const results = await batchProcess(items, async (item) => {
  return await processItem(item)
}, { batchSize: 10 })
```

## Advanced Usage

### Using `batchProcess` for Batch Processing

When you need to process items in batches (running multiple items in parallel within each batch, but processing batches sequentially), use `batchProcess`:

```typescript
import { batchProcess } from 'chunk-process'

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

### Progress Tracking

Track the progress of batch processing with the `onProgress` callback:

```typescript
await batchProcess(
  userIds,
  async (userId) => await fetchUserData(userId),
  {
    batchSize: 10,
    onProgress: (completed, total) => {
      const percentage = (completed / total * 100).toFixed(1)
      console.log(`Progress: ${completed}/${total} batches (${percentage}%)`)
    }
  }
)
```

### Rate Limiting with Delays

Add delays between batches to comply with API rate limits:

```typescript
// Process 5 items at a time, waiting 1 second between batches
await batchProcess(
  apiRequests,
  async (request) => await fetch(request.url),
  {
    batchSize: 5,
    delayBetweenBatches: 1000 // 1 second delay
  }
)
```

### Retry Failed Tasks

Automatically retry failed tasks with configurable backoff strategies:

```typescript
// Retry up to 3 times with exponential backoff
const results = await batchProcess(
  unreliableOperations,
  async (operation) => await performOperation(operation),
  {
    retry: {
      maxAttempts: 3,
      backoff: 'exponential', // or 'linear'
      initialDelay: 100, // Start with 100ms delay
      maxDelay: 30000 // Cap exponential backoff at 30 seconds (default: 30000ms)
    }
  }
)
```

### Error Handling

Continue processing even when some items fail:

```typescript
const results = await batchProcess<Item, Result | Error>(
  items,
  async (item) => await processItem(item),
  {
    continueOnError: true
  }
)

// Check results for errors
results.flat().forEach((result, index) => {
  if (result instanceof Error) {
    console.error(`Item ${index} failed:`, result.message)
  }
})
```

### Flatten Results

Get a flat array instead of nested batches:

```typescript
const flatResults = await batchProcess(
  [1, 2, 3, 4, 5, 6],
  async (num) => num * 2,
  {
    batchSize: 2,
    flatten: true
  }
)

console.log(flatResults)
// Output: [2, 4, 6, 8, 10, 12]
```

### Timeout Control

Set a maximum execution time for each task:

```typescript
try {
  await batchProcess(
    tasks,
    async (task) => await performTask(task),
    {
      timeout: 5000 // 5 seconds per task
    }
  )
} catch (error) {
  console.error('Task timed out:', error.message)
}
```

### Combining Features

Combine multiple features for robust batch processing:

```typescript
const results = await batchProcess<Task, Result | Error>(
  tasks,
  async (task) => await processTask(task),
  {
    batchSize: 5,
    delayBetweenBatches: 1000,
    retry: {
      maxAttempts: 3,
      backoff: 'exponential'
    },
    continueOnError: true,
    timeout: 10000,
    flatten: true,
    onProgress: (completed, total) => {
      console.log(`Processing: ${completed}/${total} batches`)
    }
  }
)
```

### Using `arrayBatch` Utility

You can also use the `arrayBatch` function independently to split arrays:

```typescript
import { arrayBatch } from 'chunk-process'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const batches = arrayBatch(items, 3)

console.log(batches)
// Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

This is useful when you need to prepare chunked data for other operations.

## Migration from @hideokamoto/sequential-promise

This library (`chunk-process`) is a renamed and refocused version of `@hideokamoto/sequential-promise`. If you're currently using `@hideokamoto/sequential-promise`, here's how to migrate:

### Package Installation

```bash
# Uninstall old package
npm uninstall @hideokamoto/sequential-promise

# Install new package
npm install chunk-process
```

### Import Statements

Update all import statements in your code:

```typescript
// Before
import batchProcess from '@hideokamoto/sequential-promise'
import { batchProcess, arrayBatch } from '@hideokamoto/sequential-promise'

// After
import batchProcess from 'chunk-process'
import { batchProcess, arrayBatch } from 'chunk-process'
```

### API Compatibility

- **`batchProcess`**: Function signature and behavior remain identical. No code changes required.
- **`arrayBatch`**: Function signature and behavior remain identical. No code changes required.
- **`arrayChunk`** (deprecated): If you're still using the deprecated `arrayChunk` function, replace it with `arrayBatch`:
  ```typescript
  // Before
  import { arrayChunk } from '@hideokamoto/sequential-promise'
  const batches = arrayChunk(items, 3)
  
  // After
  import { arrayBatch } from 'chunk-process'
  const batches = arrayBatch(items, 3)
  ```

### What Changed?

- **Package name**: `@hideokamoto/sequential-promise` → `chunk-process`
- **Version**: Starting fresh at `v0.1.0` (was `v2.0.0`)
- **Focus**: Library name now better reflects its purpose (chunk-based processing)
- **API**: All APIs remain backward compatible - no breaking changes to function signatures or behavior

### Why the Change?

The library has been renamed to better reflect its core purpose: **chunk-based parallel processing** for rate limiting and resource control. The new name `chunk-process` is shorter, more descriptive, and easier to discover.

## contribution

```bash
// clone
$ git clone git@github.com:hideokamoto/chunk-process.git
$ cd chunk-process

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