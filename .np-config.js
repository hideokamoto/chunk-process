module.exports = {
  // yarnを使わずnpmを使用
  yarn: false,

  // 2要素認証を有効化
  '2fa': true,

  // テストは既にprepublishOnlyで実行されるのでスキップ
  tests: false,

  // リリースドラフトを作成（GitHub Actions等で自動リリースする場合はfalse）
  releaseDraft: false,

  // タグのバージョンプレフィックス
  tag: 'latest',

  // リリース前にリモートの変更を確認
  anyBranch: false,
}
