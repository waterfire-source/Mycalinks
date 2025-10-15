# jobs/CLAUDE.md

## 🎯 目的・役割

重処理バックグラウンドジョブの統括管理ディレクトリ。日次集計・データ整合性チェックなど、システム全体の安定性とデータ品質を保証する重要処理を実行。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: EventBridge Schedule + ECS タスク
- **依存関係**: backend-core, common, Prisma ORM

## 📁 ディレクトリ構造
```
jobs/
├── README.md                 # ジョブ概要説明
├── daily/                    # 日次バッチ処理
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          # 日次処理エントリーポイント
│       └── calculators/
│           ├── product.ts    # 商品集計処理
│           └── transaction.ts # 取引集計処理
└── ensure-consistency/       # データ整合性チェック
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts          # 整合性チェックエントリーポイント
        └── calculators/
            ├── product.ts    # 商品データ整合性
            └── transaction.ts # 取引データ整合性
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, EventBridge
- **リージョン**: 環境依存
- **環境設定**: 定期実行スケジュール、大容量メモリ設定

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/job-daily/, copilot/job-ensure-consistency/)

## 🔧 主要機能
- **日次集計**: 売上・在庫・顧客データの日次サマリー作成
- **データ整合性**: システム全体のデータ一貫性チェック・修復
- **パフォーマンス監視**: システム性能指標の収集・分析
- **レポート生成**: 経営管理用レポートの自動生成

## 💡 運用パターン
- 夜間バッチ実行（負荷分散）
- 段階的処理（失敗時の部分復旧可能）
- 処理結果の自動通知・レポート

## 📊 監視・ログ
- **監視項目**: 実行時間、メモリ使用量、処理成功率
- **ログ出力**: CloudWatch Logs、処理結果サマリー
- **アラート設定**: 実行失敗、処理時間超過（>3時間）

## 🔗 関連ディレクトリ
- [workers/](../workers/) - リアルタイム処理ワーカー
- [packages/backend-core/](../packages/backend-core/) - 共通ビジネスロジック
- [copilot/job-daily/](../copilot/job-daily/) - 日次ジョブデプロイ設定
- [copilot/job-ensure-consistency/](../copilot/job-ensure-consistency/) - 整合性ジョブデプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 大容量データ処理、インデックス最適化必須
- **セキュリティ**: 機密データ処理時のアクセス制御
- **トラブルシューティング**: 部分実行・手動復旧機能完備

---
*Infrastructure-Agent作成: 2025-01-24*