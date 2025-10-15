# backend-services/outbox/CLAUDE.md

## 🎯 目的・役割

アウトボックスパターンを実装するマイクロサービス。データベーストランザクションとイベント配信の一貫性を保証し、システム間の信頼性の高い連携を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: SQS + SNS + イベントブリッジ
- **依存関係**: backend-core, Prisma ORM, AWS SDK

## 📁 ディレクトリ構造
```
backend-services/outbox/
├── README.md                 # アウトボックス概要
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # アウトボックスサービスメイン
    └── publishers/           # イベント配信ロジック
        ├── productStockHistory/
        │   └── main.ts       # 在庫履歴イベント配信
        └── productUpdate/
            └── main.ts       # 商品更新イベント配信
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, SQS, SNS, EventBridge
- **リージョン**: 環境依存
- **環境設定**: アウトボックステーブル、配信キュー設定

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/backend-outbox/)

## 🔧 主要機能
- **在庫履歴配信**: 在庫変動イベントの信頼性配信
- **商品更新配信**: 商品マスタ変更イベントの配信
- **トランザクション保証**: DBトランザクションとイベント配信の一貫性
- **配信失敗処理**: 再送・Dead Letter Queue・アラート

## 💡 運用パターン
- アウトボックステーブル → ポーリング → イベント配信
- 冪等性保証（重複配信対応）
- 順序保証（パーティション単位）

## 📊 監視・ログ
- **監視項目**: 配信遅延、失敗率、アウトボックス滞留数
- **ログ出力**: CloudWatch Logs、配信成功/失敗ログ
- **アラート設定**: 配信遅延 > 10分、失敗率 > 3%

## 🔗 関連ディレクトリ
- [backend-services/](../) - マイクロサービス統括
- [packages/backend-core/src/event/](../../packages/backend-core/src/event/) - イベント定義
- [copilot/backend-outbox/](../../copilot/backend-outbox/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: ポーリング間隔調整、バッチサイズ最適化
- **セキュリティ**: イベントペイロード暗号化、IAM最小権限
- **トラブルシューティング**: アウトボックス滞留時の手動処理手順

---
*Infrastructure-Agent作成: 2025-01-24*