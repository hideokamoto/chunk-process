---
title: Results and progress
description: Choose the result shape and track progress across batches.
sidebar:
  order: 3
---

## Result order

Results keep the order of the input array, regardless of which task inside a batch finishes first.

## Nested or flat results

By default, results are grouped by batch:

```typescript
await batchProcess([1, 2, 3, 4, 5, 6], async (num) => num * 2, { batchSize: 2 })
// [[2, 4], [6, 8], [10, 12]]
```

With `flatten: true` you get a single array. The return type changes to `Array<R>` through a function overload:

```typescript
await batchProcess([1, 2, 3, 4, 5, 6], async (num) => num * 2, {
  batchSize: 2,
  flatten: true
})
// [2, 4, 6, 8, 10, 12]
```

## Progress tracking

`onProgress(completed, total)` is called after each batch completes. Both values count batches, not items.

```typescript
await batchProcess(
  userIds,
  async (userId) => await fetchUserData(userId),
  {
    batchSize: 10,
    onProgress: (completed, total) => {
      const percentage = ((completed / total) * 100).toFixed(1)
      console.log(`Progress: ${completed}/${total} batches (${percentage}%)`)
    }
  }
)
```

## Combining options

```typescript
const results = await batchProcess<Task, Result | Error>(
  tasks,
  async (task) => await processTask(task),
  {
    batchSize: 5,
    delayBetweenBatches: 1000,
    retry: { maxAttempts: 3, backoff: 'exponential' },
    continueOnError: true,
    timeout: 10000,
    flatten: true,
    onProgress: (completed, total) => {
      console.log(`Processing: ${completed}/${total} batches`)
    }
  }
)
```
