# workers/CLAUDE.md

## 🎯 目的・役割

イベント駆動型の非同期処理を担当するワーカーサービス群。AWS SQS FIFOキューを通じてメッセージを受信し、各ドメインに特化したバックグラウンド処理を実行する。軽量・高頻度な処理に最適化され、システムの応答性と拡張性を向上させる。

## 🏗️ 技術構成

- **インフラ**: AWS ECS (Fargate) + SQS FIFO
- **コンテナ**: Docker (Alpine Linux) + PM2
- **オーケストレーション**: AWS Copilot Worker Service
- **依存関係**: backend-core (TaskManager), Prisma, AWS SDK

## 📁 ディレクトリ構造

```
workers/
├── README.md                    # ワーカー概要説明
├── transaction/                 # 取引処理ワーカー
│   ├── package.json
│   ├── src/
│   │   ├── index.ts            # エントリーポイント
│   │   └── controllers/        # タスク処理ロジック
│   └── Dockerfile
├── scheduled/                   # スケジュール処理ワーカー
│   ├── src/
│   │   └── controllers/
│   │       ├── updateBundleItemStatus.ts
│   │       ├── updateSaleStatus.ts
│   │       └── updateSetDealStatus.ts
│   └── ...
├── product/                     # 在庫処理ワーカー
│   ├── src/
│   │   └── controllers/
│   │       ├── csvStock.ts
│   │       ├── stockProduct.ts
│   │       └── updateStock.ts
│   └── ...
├── item/                       # 商品管理ワーカー
│   ├── src/
│   │   └── controllers/
│   │       ├── createItem.ts
│   │       ├── updateItem.ts
│   │       └── updateMycaItem.ts
│   └── ...
├── notification/               # 通知処理ワーカー
│   ├── src/
│   │   └── controllers/
│   │       ├── sendEmail.ts
│   │       └── sendNotification.ts
│   └── ...
├── external-ec/                # 外部EC連携ワーカー
│   ├── src/
│   │   └── controllers/
│   │       ├── importOchanokoOrder.ts
│   │       └── ochanokoUpdateStock.ts
│   └── ...
└── ec-order/                   # EC注文処理ワーカー
    ├── src/
    │   └── controllers/
    │       └── paymentTimeout.ts
    └── ...
```

## ☁️ AWS リソース

### サービス構成
- **Worker Services**: 7個（各ドメイン専用）
- **リージョン**: ap-northeast-1 (東京)
- **環境**: staging, production, public, customer

### メッセージング
- **SQS FIFO Queues**: 各ワーカー専用キュー
- **Dead Letter Queue**: 3回リトライ後に移動
- **Message Group ID**: 関連メッセージの順序保証
- **Deduplication**: MD5ハッシュベース

### スケーリング
- **Staging**: 固定1インスタンス（Spot）
- **Production**: 1-3インスタンス（キュー深度ベース）
- **CPU/Memory**: 256 CPU / 512 MB（DB負荷軽減）

## 🔄 デプロイメント

### デプロイ戦略
- **Rolling Update**: 新旧バージョンの段階的切り替え
- **Health Check**: タスク起動確認
- **Rollback**: 失敗時の自動ロールバック

### パイプライン
```bash
# 個別ワーカーデプロイ
copilot svc deploy --name worker-transaction --env production

# 全ワーカー一括デプロイ
for worker in transaction scheduled product item notification external-ec ec-order; do
  copilot svc deploy --name worker-$worker --env production
done
```

### 環境切り替え
- 環境変数によるキューURL自動切り替え
- Secrets Managerによる認証情報管理

## 🔧 主要機能

### TaskManager統合
```typescript
// 標準的なワーカー実装パターン
import { TaskManager, TaskCallback } from '@pos/backend-core';

const taskManager = new TaskManager({
  targetWorker: 'transaction',
});

// タスクタイプごとにコントローラーを登録
taskManager.subscribe({
  createTransaction: createTransactionController,
  updateTransaction: updateTransactionController,
  // ...
});
```

### タスク処理パターン
```typescript
export const controllerName: TaskCallback<TaskBodyType> = async (task) => {
  // 1. タスクボディからデータ抽出
  const { items, options } = task.body;
  
  // 2. 必要なサービスを初期化
  const service = task.give(ServiceClass);
  
  // 3. チャンク処理（大量データ対応）
  await task.processItems({
    items,
    chunkSize: 100,
    processor: async (chunk) => {
      // ビジネスロジック実行
    },
  });
  
  // 4. トランザクション処理
  await task.transaction(async (tx) => {
    // データベース更新
  });
};
```

### エラーハンドリング
- 自動リトライ（3回）
- エラーログのDB記録
- Dead Letter Queueへの移動
- Slack通知（重要エラー）

## 💡 運用パターン

### ワーカー管理
```bash
# ログ確認
copilot svc logs --name worker-transaction --env production --follow

# タスク状態確認
copilot svc status --name worker-transaction --env production

# スケーリング設定変更
copilot svc deploy --name worker-transaction --env production
```

### キュー監視
```bash
# SQSメトリクス確認（CloudWatch）
- ApproximateNumberOfMessages（待機メッセージ数）
- ApproximateAgeOfOldestMessage（最古メッセージ経過時間）
- NumberOfMessagesReceived（受信メッセージ数）
```

### タスクチャンキング設定
```typescript
// タスクタイプごとのチャンクサイズ
const CHUNK_SIZES = {
  ochanokoUpdatePrice: 800,      // API制限対応
  updateStock: 100,              // DB負荷分散
  sendEmail: 1,                  // 個別処理
  createTransaction: 50,         // 中規模バッチ
};
```

## 📊 監視・ログ

### 監視項目
- **タスク処理時間**: 各タスクの実行時間
- **キュー深度**: 未処理メッセージ数
- **エラー率**: 失敗タスクの割合
- **DLQメッセージ数**: 処理失敗メッセージ

### ログ出力
- **構造化ログ**: JSON形式
- **トレースID**: タスク追跡用
- **処理詳細**: 成功/失敗の詳細情報
- **保持期間**: 7日（staging）、30日（production）

### アラート設定
- **キュー遅延**: 5分以上の処理遅延
- **エラー率**: 10%以上のエラー発生
- **DLQ**: メッセージ到達時
- **ワーカー停止**: ヘルスチェック失敗

## 🔗 関連ディレクトリ

- [Copilotインフラ定義](../copilot/)
- [バックエンドコア](../packages/backend-core/)
- [ジョブ（重処理）](../jobs/)
- [バックエンドサービス](../backend-services/)
- [APIジェネレーター](../packages/api-generator/)

## 📝 運用メモ

### パフォーマンス考慮事項
- **低CPU設定**: DB接続数制限のため意図的に低スペック
- **チャンクサイズ**: 外部API制限とDB負荷のバランス
- **クールダウン**: APIレート制限対応（0-3000ms）
- **並列度**: タスクタイプごとに最適化

### セキュリティ設定
- **IAMロール**: 最小権限原則
- **ネットワーク**: プライベートサブネット配置
- **シークレット**: Secrets Manager管理
- **暗号化**: SQSメッセージ暗号化

### トラブルシューティング
1. **タスク処理遅延**
   - キュー深度確認 → ワーカー数増加
   - チャンクサイズ調整
   - クールダウン時間見直し

2. **メモリ不足エラー**
   - チャンクサイズ削減
   - メモリリーク調査
   - コンテナスペック見直し

3. **DB接続エラー**
   - RDS Proxy状態確認
   - 接続プール設定確認
   - ワーカー数調整

4. **外部API連携エラー**
   - レート制限確認
   - タイムアウト設定調整
   - リトライ戦略見直し

### ベストプラクティス
- **冪等性**: 同じタスクを複数回実行しても安全
- **タイムアウト**: 適切なタイムアウト設定（デフォルト30秒）
- **ログ**: 処理の開始・終了・エラーを必ず記録
- **メトリクス**: ビジネスKPIも含めて計測

---
*Infrastructure-Agent作成: 2025-01-24*