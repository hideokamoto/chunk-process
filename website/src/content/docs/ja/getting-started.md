---
title: はじめに
description: chunk-process をインストールして、最初のバッチを実行します。
---

## なぜ chunk-process なのか

`Promise.all()` はすべてのタスクを一度に開始します。外部 API にレート制限がある場合や、各タスクが大量のメモリを使う場合には問題になります。

`chunk-process` は入力を `batchSize` 件ずつのバッチに分割します。バッチ内の要素は並列に実行され、次のバッチは前のバッチがすべて完了してから始まります。

:::tip
厳密に逐次処理したいだけなら、このライブラリは不要です。標準の `for...of` ループを使ってください。

```typescript
const results = []
for (const item of items) {
  results.push(await processItem(item))
}
```
:::

### 主な利用場面

- 外部の決済 API 呼び出し（Stripe、PayPal など）
- クラウドストレージへのファイル一括アップロード
- 依存関係のあるデータベースマイグレーション
- リクエストを間引くスクレイピング
- リソースが限られた環境（AWS Lambda、エッジ関数）

## インストール

```bash
npm install chunk-process
```

Node.js 18 以降が必要です。

## 使い方

### TypeScript / ESM

```typescript
import batchProcess from 'chunk-process'
// または: import { batchProcess } from 'chunk-process'

// 10 件を 3 件ずつのバッチで処理する:
// 1〜3 を並列、次に 4〜6、次に 7〜9、最後に 10
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

既定では、結果はバッチごとにグループ化されます（`Array<Array<R>>`）。フラットな配列が欲しい場合は `flatten: true` を指定します。詳しくは[結果と進捗](/ja/guides/results-and-progress/)を参照してください。

### CommonJS

```javascript
const { batchProcess } = require('chunk-process')

async function main() {
  const results = await batchProcess(items, async (item) => {
    return await processItem(item)
  }, { batchSize: 10 })
}
```

## オプション一覧

| オプション | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `batchSize` | `number` | `1` | 各バッチ内で並列に処理する件数 |
| `delayBetweenBatches` | `number` | — | バッチ間で待機するミリ秒 |
| `retry` | `RetryOptions` | — | 失敗したタスクのリトライ設定 |
| `continueOnError` | `boolean` | `false` | エラーを throw せず結果に含めて返す |
| `timeout` | `number` | — | タスク 1 回あたりの最大ミリ秒（試行ごと） |
| `flatten` | `boolean` | `false` | ネストしたバッチではなくフラットな配列を返す |
| `onProgress` | `(completed, total) => void` | — | 各バッチの完了後に呼ばれる |

型定義の詳細は [API リファレンス](/api/)（英語）を参照してください。
