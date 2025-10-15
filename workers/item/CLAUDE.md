# workers/item/CLAUDE.md

## 🎯 目的・役割

商品アイテム管理の非同期処理を担当するワーカーサービス。商品マスタの作成・更新・コンディション管理を効率的に処理。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, common, Prisma ORM

## 📁 ディレクトリ構造
```
workers/item/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        ├── addConditionOption/
        │   └── main.ts       # コンディション選択肢追加
        ├── createItem/
        │   └── main.ts       # 新規商品アイテム作成
        ├── updateItem/
        │   └── main.ts       # 商品アイテム更新
        └── updateMycaItem/
            └── main.ts       # Mycaアプリ商品更新
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate
- **リージョン**: 環境依存
- **環境設定**: RDS接続、S3画像ストレージ

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-item/)

## 🔧 主要機能
- **商品作成**: 新規商品マスタの非同期作成
- **商品更新**: 商品情報の一括・個別更新
- **コンディション管理**: 商品状態（新品・中古等）の動的管理
- **Mycaアプリ連携**: モバイルアプリ向け商品情報同期

## 💡 運用パターン
- 大量データ処理はバッチ化
- 商品画像の非同期アップロード
- バリデーション → DB更新 → 外部システム通知

## 📊 監視・ログ
- **監視項目**: 処理時間、エラー率、画像アップロード成功率
- **ログ出力**: CloudWatch Logs、商品操作履歴
- **アラート設定**: バッチ処理失敗、DB接続エラー

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/src/services/internal/item/](../../packages/backend-core/src/services/internal/item/) - 商品ビジネスロジック
- [copilot/worker-item/](../../copilot/worker-item/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 大量商品処理時のメモリ使用量監視
- **セキュリティ**: 商品画像のウイルススキャン、入力データ検証
- **トラブルシューティング**: 商品データ不整合時の修復手順

---
*Infrastructure-Agent作成: 2025-01-24*