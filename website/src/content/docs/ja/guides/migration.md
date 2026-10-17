---
title: sequential-promise からの移行
description: "@hideokamoto/sequential-promise から chunk-process へ移行します。"
sidebar:
  order: 4
---

`chunk-process` は `@hideokamoto/sequential-promise` を改名した後継パッケージです。バージョンは `v0.1.0` から振り直しています（旧パッケージは `v2.0.0` でした）。関数のシグネチャと挙動は変わりません。

## パッケージを置き換える

```bash
npm uninstall @hideokamoto/sequential-promise
npm install chunk-process
```

## import を更新する

```typescript
// 変更前
import batchProcess from '@hideokamoto/sequential-promise'
import { batchProcess, arrayBatch } from '@hideokamoto/sequential-promise'

// 変更後
import batchProcess from 'chunk-process'
import { batchProcess, arrayBatch } from 'chunk-process'
```

## `arrayChunk` を置き換える

`arrayChunk` は非推奨で、次のメジャーバージョンで削除されます。代わりに `arrayBatch` を使ってください。

```typescript
// 変更前
import { arrayChunk } from '@hideokamoto/sequential-promise'
const batches = arrayChunk(items, 3)

// 変更後
import { arrayBatch } from 'chunk-process'
const batches = arrayBatch(items, 3)
```
