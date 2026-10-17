---
title: Rate limiting
description: Control concurrency and pacing with batchSize and delayBetweenBatches.
sidebar:
  order: 1
---

## Limit concurrency with `batchSize`

`batchSize` is the number of tasks that run at the same time. The next batch starts only after every task in the current batch has settled.

```typescript
// At most 5 concurrent API calls
await batchProcess(userIds, async (userId) => {
  return await fetchUserDataFromAPI(userId)
}, { batchSize: 5 })
```

The same option is useful for keeping memory and CPU usage under control:

```typescript
// Process 10 items at a time to avoid memory issues
await batchProcess(largeDataset, async (data) => {
  return await processHeavyOperation(data)
}, { batchSize: 10 })
```

## Pace requests with `delayBetweenBatches`

`delayBetweenBatches` waits the given number of milliseconds before each batch except the first one.

```typescript
// 5 requests at a time, 1 second pause between batches
await batchProcess(
  apiRequests,
  async (request) => await fetch(request.url),
  {
    batchSize: 5,
    delayBetweenBatches: 1000
  }
)
```

:::note
Batching is a simple chunked model, not a sliding window: a slow task holds back the start of the next batch.
:::

## Splitting arrays with `arrayBatch`

If you only need to split an array, use `arrayBatch` directly:

```typescript
import { arrayBatch } from 'chunk-process'

arrayBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3)
// [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

`arrayBatch` throws if `batchSize` is not a positive integer.
