# backend-services/CLAUDE.md

## 🎯 目的・役割

マイクロサービスアーキテクチャの統括管理ディレクトリ。イベント駆動型のバックエンドサービス群により、システム間の疎結合と高可用性を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: イベント駆動 + SQS/SNS
- **依存関係**: backend-core, common

## 📁 ディレクトリ構造
```
backend-services/
├── README.md                 # マイクロサービス概要
└── outbox/                   # アウトボックスパターンサービス
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts          # サービスエントリーポイント
        └── publishers/       # イベント配信ロジック
            ├── productStockHistory/
            │   └── main.ts   # 在庫履歴イベント配信
            └── productUpdate/
                └── main.ts   # 商品更新イベント配信
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, SQS, SNS
- **リージョン**: 環境依存
- **環境設定**: イベント配信設定、メッセージキュー管理

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/backend-outbox/)

## 🔧 主要機能
- **イベント配信**: ドメインイベントの信頼性保証配信
- **アウトボックスパターン**: トランザクション保証とイベント一貫性
- **メッセージ変換**: 内部イベントから外部システム形式への変換
- **配信監視**: イベント配信状況の追跡・再送制御

## 💡 運用パターン
- トランザクションアウトボックスによる確実配信
- Dead Letter Queueによる障害時の配信保証
- 順序保証とべき等性の実装

## 📊 監視・ログ
- **監視項目**: 配信成功率、処理時間、キュー深度
- **ログ出力**: CloudWatch Logs、イベント配信ログ
- **アラート設定**: 配信失敗率 > 5%、キュー滞留

## 🔗 関連ディレクトリ
- [workers/](../workers/) - イベント処理ワーカー
- [packages/backend-core/](../packages/backend-core/) - ドメインロジック
- [copilot/backend-outbox/](../copilot/backend-outbox/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: イベント配信の並列度調整、バッチ配信最適化
- **セキュリティ**: イベントペイロードの暗号化、アクセス制御
- **トラブルシューティング**: 配信失敗時の調査・再送手順

---
*Infrastructure-Agent作成: 2025-01-24*