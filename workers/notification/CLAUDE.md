# workers/notification/CLAUDE.md

## 🎯 目的・役割

各種通知の配信を担当するワーカーサービス。メール送信・プッシュ通知の非同期処理により、ユーザー体験の向上を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Node.js 23.9.0
- **オーケストレーション**: AWS SQS + ECS タスク
- **依存関係**: backend-core, AWS SES, Expo Push API

## 📁 ディレクトリ構造
```
workers/notification/
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript設定
└── src/
    ├── index.ts              # ワーカーエントリーポイント
    └── controllers/
        ├── sendEmail/
        │   └── main.ts       # メール送信処理
        └── sendPushNotification/
            └── main.ts       # プッシュ通知送信
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, SES
- **リージョン**: 環境依存
- **環境設定**: SES認証設定、Expo API キー管理

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green (Copilot managed)
- **パイプライン**: GitHub Actions → AWS Copilot
- **環境切り替え**: 自動 (copilot/worker-notification/)

## 🔧 主要機能
- **メール送信**: トランザクションメール、一括配信
- **プッシュ通知**: リアルタイム通知、在庫アラート
- **テンプレート管理**: メール・通知テンプレートの動的生成
- **配信ステータス管理**: 送信成功・失敗の追跡

## 💡 運用パターン
- 優先度別キュー処理（緊急 > 通常 > バッチ）
- 再送機能付きの信頼性保証
- テンプレートキャッシュによる高速化

## 📊 監視・ログ
- **監視項目**: 配信成功率、処理時間、バウンス率
- **ログ出力**: CloudWatch Logs、SES配信ログ
- **アラート設定**: 配信失敗率 > 5%、SES制限接近

## 🔗 関連ディレクトリ
- [workers/](../) - ワーカー全体統括
- [packages/backend-core/src/services/external/aws/](../../packages/backend-core/src/services/external/aws/) - AWS SES統合
- [copilot/worker-notification/](../../copilot/worker-notification/) - デプロイ設定

## 📝 運用メモ
- **パフォーマンス**: SES送信制限の監視（1日50,000通）
- **セキュリティ**: 個人情報の適切なマスキング、DKIM設定
- **トラブルシューティング**: バウンスメール対応、配信遅延の原因調査

---
*Infrastructure-Agent作成: 2025-01-24*