# functions/CLAUDE.md

## 🎯 目的・役割

AWS Lambda関数群の統括管理ディレクトリ。サーバーレス処理により、軽量で費用効率の高いイベント駆動処理を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Lambda
- **コンテナ**: Node.js 23.9.0
- **オーケストレーション**: API Gateway + Lambda + EventBridge
- **依存関係**: backend-core, AWS SAM

## 📁 ディレクトリ構造
```
functions/
├── README.md                 # Lambda関数概要
└── email-webhook/            # メールWebhook処理
    ├── app.ts                # Lambda関数エントリーポイント
    ├── package.json          # 依存関係定義
    ├── samconfig.toml        # SAM設定
    ├── template.yml          # SAM CloudFormationテンプレート
    ├── tsconfig.json         # TypeScript設定
    └── services/             # ビジネスロジック
        ├── main.ts           # メイン処理ロジック
        └── ochanoko.ts       # おちゃのこネット連携
```

## ☁️ AWS リソース
- **サービス**: Lambda, API Gateway, SES
- **リージョン**: 環境依存
- **環境設定**: Webhook URL、API認証設定

## 🔄 デプロイメント
- **デプロイ戦略**: AWS SAM Deploy
- **パイプライン**: GitHub Actions → SAM Build → Deploy
- **環境切り替え**: sam deploy --parameter-overrides Environment=[staging|production]

## 🔧 主要機能
- **メールWebhook**: 外部システムからのメール通知受信
- **おちゃのこ連携**: おちゃのこネットからのWebhook処理
- **非同期処理**: メール受信イベントの非同期処理
- **イベント変換**: 外部形式から内部イベント形式への変換

## 💡 運用パターン
- イベント駆動による即座の応答
- 軽量処理に特化（重処理はワーカーに委任）
- コールドスタート最適化

## 📊 監視・ログ
- **監視項目**: 実行時間、エラー率、コールドスタート頻度
- **ログ出力**: CloudWatch Logs、X-Ray分散トレーシング
- **アラート設定**: エラー率 > 5%、実行時間 > 30秒

## 🔗 関連ディレクトリ
- [workers/](../workers/) - 重処理ワーカー
- [packages/backend-core/](../packages/backend-core/) - 共通ロジック
- [copilot/](../copilot/) - メインアプリケーション

## 📝 運用メモ
- **パフォーマンス**: コールドスタート対策、メモリ最適化
- **セキュリティ**: API認証、Webhook検証、VPC設定
- **トラブルシューティング**: CloudWatch Logs分析、X-Rayでのトレース

---
*Infrastructure-Agent作成: 2025-01-24*