---
title: リトライ・タイムアウト・エラー
description: 失敗したタスクのリトライ、実行時間の上限、要素が失敗しても処理を続ける方法を説明します。
sidebar:
  order: 2
---

## リトライ

```typescript
const results = await batchProcess(
  unreliableOperations,
  async (operation) => await performOperation(operation),
  {
    retry: {
      maxAttempts: 3,
      backoff: 'exponential', // または 'linear'（既定）
      initialDelay: 100,      // 既定: 100ms
      maxDelay: 30000         // 既定: 30000ms
    }
  }
)
```

- `maxAttempts` は最初の 1 回を含む総試行回数です。1 未満の値は 1 として扱い、整数でない値は切り捨てます。
- `linear` は、リトライのたびに `initialDelay` だけ待機します。
- `exponential` は `initialDelay * 2^(attempt - 1)` だけ待機し、`maxDelay` で頭打ちになります。

## タイムアウト

`timeout` は、各タスクの試行ごとに適用されます。超過したタスクは `Error('Task timed out after <timeout>ms')` で reject され、他のエラーと同様にリトライ処理へ渡ります。

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
タイムアウトはタスクの完了を待つのをやめるだけです。元の Promise はキャンセルされません。タスクを実際に止める必要がある場合は、タスク側に独自の `AbortSignal` を渡してください。
:::

## エラーが出ても続ける

既定では、リトライを使い切った最初のエラーが `batchProcess` 呼び出し全体を reject します。`continueOnError: true` を指定すると、そのエラーは該当要素の位置で結果に格納されます。

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

結果の型を `Result | Error` と宣言しておくと、TypeScript がエラーの扱いを忘れないよう教えてくれます。
