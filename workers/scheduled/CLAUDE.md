# workers/scheduled/CLAUDE.md

## 🎯 目的・役割

定期実行処理を担当するワーカーサービス。時間ベースの自動処理により、システムの自動化とデータメンテナンスを実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: EventBridge + ECS タスク
- **依存関係**: backend-core, common

## 📁 ディレクトリ構造
```
workers/scheduled/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        ├── updateBundleItemStatus/
        │   └── main.ts       # バンドル商品ステータス更新
        ├── updateSaleStatus/
        │   └── main.ts       # セール状態更新
        └── updateSetDealStatus/
            └── main.ts       # セット商品取引状態更新
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, EventBridge
- **リージョン**: 環境依存
- **環境設定**: Cron式スケジュール設定

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-scheduled/)

## 🔧 主要機能
- **バンドル状態管理**: バンドル商品の期限・状態自動更新
- **セール管理**: 期間限定セールの開始・終了処理
- **取引状態管理**: セット商品取引の自動ステータス更新
- **定期メンテナンス**: データクリーンアップ・統計更新

## 💡 運用パターン
- EventBridge Cron式による定期実行
- 各処理の独立性保証（失敗時の影響局所化）
- 処理時間分散による負荷平準化

## 📊 監視・ログ
- **監視項目**: 実行成功率、処理時間、スケジュール精度
- **ログ出力**: CloudWatch Logs、実行履歴
- **アラート設定**: スケジュール実行失敗、処理時間超過

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [copilot/worker-scheduled/addons/](../../copilot/worker-scheduled/addons/) - EventBridge設定
- [copilot/worker-scheduled/](../../copilot/worker-scheduled/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 重複実行防止機構、タイムアウト設定
- **セキュリティ**: 最小権限IAM、VPC内部実行
- **トラブルシューティング**: スケジュール実行ログ確認、手動実行機能

---
*Infrastructure-Agent作成: 2025-01-24*