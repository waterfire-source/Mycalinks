# workers/external-ec/CLAUDE.md

## 🎯 目的・役割

外部ECプラットフォーム（おちゃのこネット）との連携処理を担当するワーカーサービス。商品情報・在庫・価格の同期を自動化。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, common, 外部EC API

## 📁 ディレクトリ構造
```
workers/external-ec/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        ├── ochanokoOrder/
        │   └── main.ts       # おちゃのこ注文処理
        ├── ochanokoUpdatePrice/
        │   └── main.ts       # 価格同期処理
        └── ochanokoUpdateStockNumber/
            └── main.ts       # 在庫同期処理
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate
- **リージョン**: 環境依存
- **環境設定**: おちゃのこ API 認証情報管理

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-external-ec/)

## 🔧 主要機能
- **注文同期**: おちゃのこネットからの注文取込
- **価格同期**: POS→外部ECの価格更新
- **在庫同期**: リアルタイム在庫数同期
- **商品マスタ同期**: 商品情報の双方向同期

## 💡 運用パターン
- 定期的なポーリング + Webhook受信
- バッチ処理とリアルタイム処理の併用
- 差分検出による効率的な同期

## 📊 監視・ログ
- **監視項目**: API応答時間、同期成功率、差分検出数
- **ログ出力**: CloudWatch Logs、外部API通信ログ
- **アラート設定**: API障害、同期失敗率 > 10%

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/src/services/external/ochanoko/](../../packages/backend-core/src/services/external/ochanoko/) - おちゃのこ連携ロジック
- [copilot/worker-external-ec/](../../copilot/worker-external-ec/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: API制限対応、レート制限遵守
- **セキュリティ**: API認証キーの安全管理、HTTPS通信必須
- **トラブルシューティング**: 外部API障害時の再試行戦略、手動同期機能

---
*Infrastructure-Agent作成: 2025-01-24*