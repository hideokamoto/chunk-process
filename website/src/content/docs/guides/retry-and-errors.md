---
title: Retry, timeout and errors
description: Retry failed tasks, cap task duration, and keep going when items fail.
sidebar:
  order: 2
---

## Retry

```typescript
const results = await batchProcess(
  unreliableOperations,
  async (operation) => await performOperation(operation),
  {
    retry: {
      maxAttempts: 3,
      backoff: 'exponential', // or 'linear' (default)
      initialDelay: 100,      // default: 100ms
      maxDelay: 30000         // default: 30000ms
    }
  }
)
```

- `maxAttempts` is the total number of attempts, including the first one. Values below 1 are treated as 1 and non-integers are floored.
- `linear` waits `initialDelay` before every retry.
- `exponential` waits `initialDelay * 2^(attempt - 1)`, capped at `maxDelay`.

## Timeout

`timeout` limits each attempt of each task. A task that exceeds it rejects with `Error('Task timed out after <timeout>ms')`, which then goes through the retry logic like any other error.

```typescript
try {
  await batchProcess(tasks, async (task) => await performTask(task), {
    timeout: 5000
  })
} catch (error) {
  console.error('Task timed out:', error.message)
}
```

:::caution
The timeout only stops waiting for the task. The underlying promise is not cancelled, so pass your own `AbortSignal` to the task if it must actually stop.
:::

## Continue on error

By default the first error that survives all retries rejects the whole `batchProcess` call. With `continueOnError: true`, the error is placed in the results at the item's position instead.

```typescript
const results = await batchProcess<Item, Result | Error>(
  items,
  async (item) => await processItem(item),
  { continueOnError: true }
)

results.flat().forEach((result, index) => {
  if (result instanceof Error) {
    console.error(`Item ${index} failed:`, result.message)
  }
})
```

Declare the result type as `Result | Error` so TypeScript reminds you to handle the error case.
