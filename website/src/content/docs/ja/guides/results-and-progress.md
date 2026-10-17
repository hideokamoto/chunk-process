---
title: 結果と進捗
description: 結果の形を選び、バッチ全体の進捗を追跡します。
sidebar:
  order: 3
---

## 結果の順序

バッチ内でどのタスクが先に終わっても、結果は入力配列の順序を保ちます。

## ネストした結果とフラットな結果

既定では、結果はバッチごとにグループ化されます。

```typescript
await batchProcess([1, 2, 3, 4, 5, 6], async (num) => num * 2, { batchSize: 2 })
// [[2, 4], [6, 8], [10, 12]]
```

`flatten: true` を指定すると 1 つの配列になります。戻り値の型は関数オーバーロードにより `Array<R>` に変わります。

```typescript
await batchProcess([1, 2, 3, 4, 5, 6], async (num) => num * 2, {
  batchSize: 2,
  flatten: true
})
// [2, 4, 6, 8, 10, 12]
```

## 進捗の追跡

`onProgress(completed, total)` は各バッチの完了後に呼ばれます。どちらの値も要素数ではなくバッチ数です。

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

## オプションの組み合わせ

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
