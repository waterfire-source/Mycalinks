# functions/email-webhook/CLAUDE.md

## 🎯 目的・役割

メール配信Webhookを処理するLambda関数。外部システム（特におちゃのこネット）からのメール関連イベントを受信し、システム内部での適切な処理を実行。

## 🏗️ 技術構成
- **インフラ**: AWS Lambda
- **コンテナ**: Node.js 23.9.0
- **オーケストレーション**: API Gateway + Lambda
- **依存関係**: backend-core, AWS SES, おちゃのこAPI

## 📁 ディレクトリ構造
```
functions/email-webhook/
├── app.ts                    # Lambda関数エントリーポイント
├── package.json              # 依存関係定義
├── samconfig.toml            # SAM設定ファイル
├── template.yml              # CloudFormationテンプレート
├── tsconfig.json             # TypeScript設定
└── services/                 # ビジネスロジック
    ├── main.ts               # メイン処理ロジック
    └── ochanoko.ts           # おちゃのこネット専用処理
```

## ☁️ AWS リソース
- **サービス**: Lambda, API Gateway
- **リージョン**: 環境依存
- **環境設定**: Webhook エンドポイント、環境変数

## 🔄 デプロイメント
- **デプロイ戦略**: AWS SAM Deploy
- **パイプライン**: GitHub Actions → SAM Build → Deploy
- **環境切り替え**: sam deploy --config-env [staging|production]

## 🔧 主要機能
- **Webhook受信**: おちゃのこネットからのメール配信状況通知
- **バウンス処理**: 配信失敗メールの自動処理
- **配信状況更新**: メール配信ステータスのDB更新
- **エラーハンドリング**: 不正なWebhookの検証・拒否

## 💡 運用パターン
- API Gateway経由のHTTPS受信
- 署名検証による正当性確認
- 非同期でワーカーキューへの配信

## 📊 監視・ログ
- **監視項目**: 実行回数、エラー率、応答時間
- **ログ出力**: CloudWatch Logs、Webhook受信ログ
- **アラート設定**: エラー率 > 10%、応答時間 > 10秒

## 🔗 関連ディレクトリ
- [functions/](../) - Lambda関数統括
- [workers/notification/](../../workers/notification/) - 通知処理ワーカー
- [packages/backend-core/src/services/external/ochanoko/](../../packages/backend-core/src/services/external/ochanoko/) - おちゃのこ連携

## 📝 運用メモ
- **パフォーマンス**: コールドスタート対策、メモリ128MB最適化
- **セキュリティ**: Webhook署名検証、HTTPS必須、レート制限
- **トラブルシューティング**: 不正リクエスト分析、配信失敗調査

---
*Infrastructure-Agent作成: 2025-01-24*