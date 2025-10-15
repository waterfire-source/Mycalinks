# workers/transaction/CLAUDE.md

## 🎯 目的・役割

取引処理の非同期処理を担当するワーカーサービス。決済タイムアウト・取引確定・支払い処理の信頼性保証を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, common, GMO Payment

## 📁 ディレクトリ構造
```
workers/transaction/
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
- **環境設定**: 決済API認証情報管理

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-transaction/)

## 🔧 主要機能
- **決済タイムアウト**: 決済期限切れの自動検出・処理
- **取引キャンセル**: タイムアウト時の取引自動取消
- **在庫復旧**: キャンセル時の在庫戻し処理
- **決済ステータス同期**: 外部決済システムとの状態同期

## 💡 運用パターン
- 決済状態の定期チェック
- 段階的タイムアウト処理（警告 → キャンセル）
- 決済エラー時の自動再試行

## 📊 監視・ログ
- **監視項目**: タイムアウト検出精度、処理成功率、決済同期率
- **ログ出力**: CloudWatch Logs、決済処理履歴
- **アラート設定**: 決済API障害、タイムアウト処理失敗

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/src/services/external/gmo/](../../packages/backend-core/src/services/external/gmo/) - GMO決済連携
- [copilot/worker-transaction/](../../copilot/worker-transaction/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: 決済API制限の遵守、並行処理数制御
- **セキュリティ**: PCI DSS準拠、決済情報の安全管理
- **トラブルシューティング**: 決済不整合時の調査・修正手順

---
*Infrastructure-Agent作成: 2025-01-24*