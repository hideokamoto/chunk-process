---
title: レート制限
description: batchSize と delayBetweenBatches で同時実行数と実行間隔を制御します。
sidebar:
  order: 1
---

## `batchSize` で同時実行数を制限する

`batchSize` は同時に実行するタスクの数です。次のバッチは、現在のバッチのタスクがすべて完了してから始まります。

```typescript
// API 呼び出しは同時に最大 5 件
await batchProcess(userIds, async (userId) => {
  return await fetchUserDataFromAPI(userId)
}, { batchSize: 5 })
```

メモリや CPU の使用量を抑えたい場合にも同じオプションが使えます。

```typescript
// メモリ問題を避けるため 10 件ずつ処理する
await batchProcess(largeDataset, async (data) => {
  return await processHeavyOperation(data)
}, { batchSize: 10 })
```

## `delayBetweenBatches` でリクエスト間隔を空ける

`delayBetweenBatches` は、最初のバッチを除く各バッチの開始前に、指定したミリ秒だけ待機します。

```typescript
// 5 件ずつ処理し、バッチ間で 1 秒待つ
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
バッチ処理は単純なチャンクモデルで、スライディングウィンドウではありません。遅いタスクが 1 つあると、次のバッチの開始が待たされます。
:::

## `arrayBatch` で配列を分割する

配列を分割するだけなら、`arrayBatch` を直接使えます。

```typescript
import { arrayBatch } from 'chunk-process'

arrayBatch([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3)
// [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
```

`batchSize` が正の整数でない場合、`arrayBatch` は例外を投げます。
