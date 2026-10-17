---
title: Migrating from sequential-promise
description: Move from @hideokamoto/sequential-promise to chunk-process.
sidebar:
  order: 4
---

`chunk-process` is the renamed successor of `@hideokamoto/sequential-promise`. Versioning restarted at `v0.1.0` (the old package was at `v2.0.0`). Function signatures and behavior are unchanged.

## Replace the package

```bash
npm uninstall @hideokamoto/sequential-promise
npm install chunk-process
```

## Update imports

```typescript
// Before
import batchProcess from '@hideokamoto/sequential-promise'
import { batchProcess, arrayBatch } from '@hideokamoto/sequential-promise'

// After
import batchProcess from 'chunk-process'
import { batchProcess, arrayBatch } from 'chunk-process'
```

## Replace `arrayChunk`

`arrayChunk` is deprecated and will be removed in the next major version. Use `arrayBatch` instead:

```typescript
// Before
import { arrayChunk } from '@hideokamoto/sequential-promise'
const batches = arrayChunk(items, 3)

// After
import { arrayBatch } from 'chunk-process'
const batches = arrayBatch(items, 3)
```
