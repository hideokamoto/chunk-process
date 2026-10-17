---
title: Getting Started
description: Install chunk-process and run your first batch.
---

## Why chunk-process?

`Promise.all()` starts every task at once. That is a problem when an external API enforces a rate limit or when each task consumes a lot of memory.

`chunk-process` splits the input into batches of `batchSize` items. Items inside a batch run in parallel, and the next batch starts only after the previous one has settled.

:::tip
If you only need strictly sequential processing, you do not need this library — use a native `for...of` loop:

```typescript
const results = []
for (const item of items) {
  results.push(await processItem(item))
}
```
:::

### Common scenarios

- External payment API calls (Stripe, PayPal, etc.)
- Bulk file uploads to cloud storage
- Database migrations with dependencies
- Web scraping with request throttling
- Resource-constrained environments (AWS Lambda, edge functions)

## Installation

```bash
npm install chunk-process
```

Node.js 18 or later is required.

## Usage

### TypeScript / ESM

```typescript
import batchProcess from 'chunk-process'
// or: import { batchProcess } from 'chunk-process'

// Process 10 items in batches of 3:
// 1-3 run in parallel, then 4-6, then 7-9, then 10
const result = await batchProcess(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  async (num) => {
    await someAsyncOperation(num)
    return num * 2
  },
  { batchSize: 3 }
)

console.log(result)
// [[2, 4, 6], [8, 10, 12], [14, 16, 18], [20]]
```

By default the result is grouped by batch (`Array<Array<R>>`). Pass `flatten: true` to get a flat array — see [Results and progress](/guides/results-and-progress/).

### CommonJS

```javascript
const { batchProcess } = require('chunk-process')

async function main() {
  const results = await batchProcess(items, async (item) => {
    return await processItem(item)
  }, { batchSize: 10 })
}
```

## Options at a glance

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `batchSize` | `number` | `1` | Number of items processed in parallel within each batch |
| `delayBetweenBatches` | `number` | — | Milliseconds to wait between batches |
| `retry` | `RetryOptions` | — | Retry configuration for failed tasks |
| `continueOnError` | `boolean` | `false` | Return errors in the results instead of throwing |
| `timeout` | `number` | — | Maximum milliseconds for each task (per attempt) |
| `flatten` | `boolean` | `false` | Return a flat array instead of nested batches |
| `onProgress` | `(completed, total) => void` | — | Called after each batch completes |

See the [API Reference](/api/) for the full type definitions.
