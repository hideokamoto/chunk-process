# Sequential Promise
Chunked parallel async task runner for rate limiting and resource control

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
await sequentialPromiseWithChunk(userIds, async (userId) => {
  return await fetchUserDataFromAPI(userId)
}, { chunkSize: 5 })
```

### 2. Resource Management
Control memory and CPU usage by limiting concurrent operations.

```typescript
// Process 10 items at a time to avoid memory issues
await sequentialPromiseWithChunk(largeDataset, async (data) => {
  return await processHeavyOperation(data)
}, { chunkSize: 10 })
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

### `sequentialPromiseWithChunk<T, R>(targets: T[], callback: (prop: T) => Promise<R>, options?: {chunkSize?: number}): Promise<Array<Array<R>>>`
Executes async functions in chunks, running items within each chunk in parallel, but processing chunks sequentially.

- **Type Parameters:**
  - `T`: Type of elements in the input array
  - `R`: Type of the result returned by the callback function
- **Options:**
  - `chunkSize`: Number of items to process in parallel within each chunk (default: 1)
- **Returns:** Nested array of results, grouped by chunks

### `arrayChunk<T>(inputArray: T[], perChunk?: number): Array<Array<T>>`
Utility function to split an array into chunks of a specified size.

- **Type Parameters:**
  - `T`: Type of elements in the input array
- **Parameters:**
  - `perChunk`: Size of each chunk (default: 1)
- **Returns:** Array of chunks

## Before the package (Async style)
We have to run the task as asynchronous

```typescript
import * as moment from 'moment'

const dummy = async () => {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

const asyncFunc = async () => {

  const arr = [1,2,3,4,5]
  const result = await Promise.all(arr.map(async i => {
    const start = moment()
    console.log(`Number: ${i}`)
    console.log(`Start: ${start.toISOString()}`)
    await dummy()
    console.log(`End ${moment().toISOString()}`)
    console.log(`${moment().diff(start, 'seconds')} sec`)
    console.log(' ')
    return i + 1
  }))
  return result
})

asyncFunc().then(result => console.log(result))
```

The function will run async.

```bash
Number: 1
Start: 2019-08-30T07:52:43.862Z
Number: 2
Start: 2019-08-30T07:52:43.862Z
Number: 3
Start: 2019-08-30T07:52:43.863Z
Number: 4
Start: 2019-08-30T07:52:43.863Z
Number: 5
Start: 2019-08-30T07:52:43.863Z
End 2019-08-30T07:52:44.866Z
1 sec
 
End 2019-08-30T07:52:44.866Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
End 2019-08-30T07:52:44.867Z
1 sec
 
[ 2, 3, 4, 5, 6 ]
```

## Use the package
To use the package, we can run sequential

### Typescript
```typescript
import * as moment from 'moment'
import sequentialPromise from '@hideokamoto/sequential-promise'

sequentialPromise<number, string>([1,2,3,4,5], async (i) => {
  const start = moment()
  console.log(`Number: ${i}`)
  console.log(`Start: ${start.toISOString()}`)
  await dummy()
  console.log(`End ${moment().toISOString()}`)
  console.log(`${moment().diff(start, 'seconds')} sec`)
  console.log(' ')
  return `${i} + 2 = ${i + 2}`
}).then(r => console.log(r))
```

### JavaScript
```javascript
const moment = require('moment')
const sequentialPromise = require('@hideokamoto/sequential-promise')

sequentialPromise([1,2,3,4,5], async (i) => {
  const start = moment()
  console.log(`Number: ${i}`)
  console.log(`Start: ${start.toISOString()}`)
  await dummy()
  console.log(`End ${moment().toISOString()}`)
  console.log(`${moment().diff(start, 'seconds')} sec`)
  console.log(' ')
  return `${i} + 2 = ${i + 2}`
}).then(r => console.log(r))
```

### Result

This is the result.

```bash
 Number: 1
 Start: 2019-08-30T07:35:00.175Z
 End 2019-08-30T07:35:01.182Z
 1 sec

 Number: 2
 Start: 2019-08-30T07:35:01.184Z
 End 2019-08-30T07:35:02.188Z
 1 sec

 Number: 3
 Start: 2019-08-30T07:35:02.188Z
 End 2019-08-30T07:35:03.194Z
 1 sec

 Number: 4
 Start: 2019-08-30T07:35:03.194Z
 End 2019-08-30T07:35:04.200Z
 1 sec

 Number: 5
 Start: 2019-08-30T07:35:04.200Z
 End 2019-08-30T07:35:05.206Z
 1 sec

 [ '1 + 2 = 3', '2 + 2 = 4', '3 + 2 = 5', '4 + 2 = 6', '5 + 2 = 7' ]
```

## Advanced Usage

### Using `sequentialPromiseWithChunk` for Batch Processing

When you need to process items in batches (running multiple items in parallel within each batch, but processing batches sequentially), use `sequentialPromiseWithChunk`:

```typescript
import { sequentialPromiseWithChunk } from '@hideokamoto/sequential-promise'

// Process 10 items in chunks of 3
// Items 1-3 run in parallel, then 4-6, then 7-9, then 10
const result = await sequentialPromiseWithChunk<number, number>(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  async (num) => {
    console.log(`Processing: ${num}`)
    await someAsyncOperation(num)
    return num * 2
  },
  { chunkSize: 3 }
)

console.log(result)
// Output: [[2, 4, 6], [8, 10, 12], [14, 16, 18], [20]]
```

**Note:** The return type is `Array<Array<R>>` - results are grouped by chunks.

### Using `arrayChunk` Utility

You can also use the `arrayChunk` function independently to split arrays:

```typescript
import { arrayChunk } from '@hideokamoto/sequential-promise'

const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const chunks = arrayChunk(items, 3)

console.log(chunks)
// Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

This is useful when you need to prepare chunked data for other operations.

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