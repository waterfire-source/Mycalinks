# workers/product/CLAUDE.md

## 🎯 目的・役割

在庫商品の非同期処理を担当するワーカーサービス。在庫入出庫・商品更新・在庫移動処理を効率的に実行し、データ整合性を保証。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, common, Prisma ORM

## 📁 ディレクトリ構造
```
workers/product/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        ├── productStocking/
        │   └── main.ts       # 在庫入出庫処理
        └── updateProduct/
            └── main.ts       # 商品更新処理
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate
- **リージョン**: 環境依存
- **環境設定**: RDS接続、Redis キャッシュ

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-product/)

## 🔧 主要機能
- **在庫入庫**: 新規在庫の登録・既存在庫の追加
- **在庫出庫**: 販売・移動による在庫減算
- **在庫移動**: 店舗間・倉庫間の在庫移動
- **在庫履歴**: 在庫変動の詳細記録と追跡

## 💡 運用パターン
- トランザクション保証による在庫整合性確保
- 在庫数リアルタイム更新とキャッシュ無効化
- 在庫不足時の自動アラート生成

## 📊 監視・ログ
- **監視項目**: 在庫処理時間、エラー率、在庫整合性
- **ログ出力**: CloudWatch Logs、在庫変動履歴
- **アラート設定**: 在庫数不整合、処理失敗率 > 1%

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/src/services/internal/product/](../../packages/backend-core/src/services/internal/product/) - 在庫ビジネスロジック
- [copilot/worker-product/](../../copilot/worker-product/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 大量在庫処理時のデッドロック回避
- **セキュリティ**: 在庫データの改ざん防止、操作権限管理
- **トラブルシューティング**: 在庫差異発生時の調査・修正手順

---
*Infrastructure-Agent作成: 2025-01-24*