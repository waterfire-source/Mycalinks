# jobs/ensure-consistency/CLAUDE.md

## 🎯 目的・役割

データ整合性チェック・修復ジョブ。システム全体のデータ一貫性を定期的に検証し、不整合を検出・修復してデータ品質を保証する。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: EventBridge Schedule (Cron: 0 4 * * *)
- **依存関係**: backend-core, Prisma ORM, Redis

## 📁 ディレクトリ構造
```
jobs/ensure-consistency/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # 整合性チェックメイン制御
    └── calculators/
        ├── product.ts        # 商品・在庫整合性チェック
        └── transaction.ts    # 取引・決済整合性チェック
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate (高メモリ設定)
- **リージョン**: 環境依存
- **環境設定**: EventBridge毎日AM4:00実行

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/job-ensure-consistency/)

## 🔧 主要機能
- **在庫整合性**: 在庫数と取引履歴の突合検証
- **決済整合性**: 注文と決済状況の一致確認
- **データ修復**: 検出された不整合の自動修正
- **レポート生成**: 整合性チェック結果の詳細レポート

## 💡 運用パターン
- 深夜4:00自動実行（日次バッチ後）
- 段階チェック: 商品整合性 → 取引整合性 → 修復処理
- 重要度別アラート（Critical/Warning/Info）

## 📊 監視・ログ
- **監視項目**: 不整合検出数、修復成功率、処理時間
- **ログ出力**: CloudWatch Logs、不整合詳細ログ
- **アラート設定**: Critical不整合検出、修復失敗

## 🔗 関連ディレクトリ
- [jobs/](../) - ジョブ全体統括
- [jobs/daily/](../daily/) - 日次バッチ処理
- [copilot/job-ensure-consistency/](../../copilot/job-ensure-consistency/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 大量データスキャン、効率的なクエリ設計
- **セキュリティ**: データ修復時の監査ログ、変更履歴保存
- **トラブルシューティング**: 手動チェック機能、修復ロールバック

---
*Infrastructure-Agent作成: 2025-01-24*