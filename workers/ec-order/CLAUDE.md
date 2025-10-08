# workers/ec-order/CLAUDE.md

## 🎯 目的・役割

EC注文の決済タイムアウト処理を担当するワーカーサービス。注文の支払い期限切れを監視し、自動的にキャンセル処理を実行する。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, common

## 📁 ディレクトリ構造
```
workers/ec-order/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        └── paymentTimeout/
            └── main.ts       # 決済タイムアウト処理
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate
- **リージョン**: 環境依存
- **環境設定**: SQS キュー統合

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-ec-order/)

## 🔧 主要機能
- **決済タイムアウト監視**: EC注文の支払い期限監視
- **自動キャンセル処理**: 期限切れ注文の自動取消
- **在庫復旧**: キャンセル時の在庫戻し処理

## 💡 運用パターン
- SQSキューからタスクを受信
- タイムアウトチェック → 在庫復旧 → 注文ステータス更新
- エラー時はDead Letter Queueへ

## 📊 監視・ログ
- **監視項目**: 処理時間、エラー率、キュー深度
- **ログ出力**: CloudWatch Logs
- **アラート設定**: エラー率 > 5%、処理遅延 > 5分

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/](../../packages/backend-core/) - 共通ビジネスロジック
- [copilot/worker-ec-order/](../../copilot/worker-ec-order/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: タイムアウト時間は設定可能（デフォルト: 30分）
- **セキュリティ**: IAM最小権限、VPC内部通信のみ
- **トラブルシューティング**: DLQでメッセージ確認、CloudWatchでエラー追跡

---
*Infrastructure-Agent作成: 2025-01-24*