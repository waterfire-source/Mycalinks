# copilot/environments/addons/CLAUDE.md

## 🎯 目的・役割

Copilot環境全体で共有される共通AWSリソースのアドオン定義。データベース・ストレージ・ネットワーク・監視機能などの基盤インフラを管理。

## 🏗️ 技術構成
- **インフラ**: AWS CloudFormation (Copilot managed)
- **コンテナ**: N/A (インフラリソース)
- **オーケストレーション**: Copilot Environment Addons
- **依存関係**: VPC, Subnets, Security Groups

## 📁 ディレクトリ構造
```
copilot/environments/addons/
├── chatbot.yml               # AWS Chatbot設定（Slack連携）
├── cloudwatch.yml            # CloudWatch監視・ダッシュボード
├── nat-gateway.yml           # NAT Gateway（プライベートサブネット用）
├── rds.yml                   # RDS MySQL インスタンス
├── s3.yml                    # S3バケット（静的アセット・ファイル保存）
├── ses.yml                   # SES メール送信設定
└── vpn.yml                   # VPN接続設定
```

## ☁️ AWS リソース
- **サービス**: RDS, S3, SES, CloudWatch, Chatbot, NAT Gateway
- **リージョン**: 環境依存
- **環境設定**: 各環境でリソース共有

## 🔄 デプロイメント
- **デプロイ戦略**: Environment Level Deployment
- **パイプライン**: copilot env deploy --name [staging|production|customer|public]
- **環境切り替え**: 各環境で個別にプロビジョニング

## 🔧 主要機能
- **データ永続化**: RDS MySQLによるアプリケーションデータ保存
- **ファイルストレージ**: S3による画像・ドキュメント保存
- **メール送信**: SESによるトランザクションメール配信
- **監視・通知**: CloudWatch + Chatbotによるアラート通知
- **ネットワーク**: VPC・NAT Gateway・VPN接続

## 💡 運用パターン
- 環境ごとのリソース分離
- 本番環境の高可用性設定
- 開発環境のコスト最適化

## 📊 監視・ログ
- **監視項目**: RDS接続数、S3使用量、SES配信数
- **ログ出力**: CloudWatch メトリクス、VPCフローログ
- **アラート設定**: Slack通知、メール通知

## 🔗 関連ディレクトリ
- [copilot/environments/](../) - 環境設定統括
- [copilot/](../../) - Copilot全体統括
- [packages/backend-core/](../../../packages/backend-core/) - インフラ利用側

## 📝 運用メモ
- **パフォーマンス**: RDS接続プール最適化、S3 CloudFront連携
- **セキュリティ**: VPC Endpoint、暗号化設定、IAM最小権限
- **トラブルシューティング**: リソース依存関係確認、削除順序注意

---
*Infrastructure-Agent作成: 2025-01-24*