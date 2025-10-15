# jobs/daily/CLAUDE.md

## 🎯 目的・役割

日次バッチ処理ジョブ。毎日深夜に実行され、売上集計・在庫サマリー・顧客分析など重要な業務指標を自動計算・更新する。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: EventBridge Schedule (Cron: 0 2 * * *)
- **依存関係**: backend-core, Prisma ORM, Redis

## 📁 ディレクトリ構造
```
jobs/daily/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # 日次処理メイン制御
    └── calculators/
        ├── product.ts        # 商品・在庫集計ロジック
        └── transaction.ts    # 取引・売上集計ロジック
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate (高メモリ設定)
- **リージョン**: 環境依存
- **環境設定**: EventBridge毎日AM2:00実行

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/job-daily/)

## 🔧 主要機能
- **売上集計**: 日次・週次・月次売上サマリー
- **在庫分析**: 在庫回転率・デッドストック検出
- **顧客分析**: 購買パターン・ロイヤルティ分析
- **レポート作成**: 経営ダッシュボード用データ準備

## 💡 運用パターン
- 深夜2:00自動実行（営業時間外）
- 段階実行: 商品集計 → 取引集計 → レポート生成
- 失敗時自動再試行（最大3回）

## 📊 監視・ログ
- **監視項目**: 実行時間、処理レコード数、メモリ使用量
- **ログ出力**: CloudWatch Logs、集計結果サマリー
- **アラート設定**: 実行失敗、処理時間 > 3時間

## 🔗 関連ディレクトリ
- [jobs/](../) - ジョブ全体統括
- [jobs/ensure-consistency/](../ensure-consistency/) - データ整合性チェック
- [copilot/job-daily/](../../copilot/job-daily/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 大量データ処理、並列実行最適化
- **セキュリティ**: 集計データの暗号化、アクセスログ記録
- **トラブルシューティング**: 部分再実行機能、手動集計コマンド

---
*Infrastructure-Agent作成: 2025-01-24*