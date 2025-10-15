# copilot/backend-outbox/CLAUDE.md

## 🎯 目的・役割

アウトボックスパターンサービスのAWS Copilotデプロイ設定。マイクロサービス間のイベント配信を担当し、システム全体のデータ一貫性を保証。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: ECS Fargate + SQS + SNS
- **依存関係**: RDS, SQS, SNS, EventBridge

## 📁 ディレクトリ構造
```
copilot/backend-outbox/
├── Dockerfile                # アウトボックスサービスコンテナ
├── README.md                 # サービス概要
└── manifest.yml              # Copilotサービス定義
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, SQS, SNS
- **リージョン**: 環境依存
- **環境設定**: メッセージキュー、トピック設定

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green Deployment
- **パイプライン**: GitHub Actions → Copilot Deploy
- **環境切り替え**: copilot app deploy --env [staging|production|customer]

## 🔧 主要機能
- **イベント配信**: ドメインイベントの信頼性保証配信
- **アウトボックス処理**: DBトランザクションとイベント配信の一貫性
- **メッセージルーティング**: 適切な宛先への自動ルーティング
- **配信監視**: イベント配信状況の追跡・エラーハンドリング

## 💡 運用パターン
- Scheduled service for outbox polling
- Message deduplication and ordering
- Dead letter queue for failed messages

## 📊 監視・ログ
- **監視項目**: 配信遅延、失敗率、メッセージ滞留数
- **ログ出力**: CloudWatch Logs、SQS/SNSメトリクス
- **アラート設定**: 配信遅延 > 5分、失敗率 > 3%

## 🔗 関連ディレクトリ
- [copilot/](../) - Copilot全体統括
- [backend-services/outbox/](../../backend-services/outbox/) - アウトボックスサービス実装
- [copilot/environments/addons/](../environments/addons/) - 共通リソース設定

## 📝 運用メモ
- **パフォーマンス**: ポーリング間隔調整、バッチ処理最適化
- **セキュリティ**: メッセージ暗号化、IAM最小権限
- **トラブルシューティング**: DLQ確認、手動再配信機能

---
*Infrastructure-Agent作成: 2025-01-24*