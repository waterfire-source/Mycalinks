# copilot/CLAUDE.md

## 🎯 目的・役割

AWS Copilotを使用したコンテナ化されたPOSシステムのインフラストラクチャ定義。マルチテナント対応のマイクロサービスアーキテクチャで、11のサービスと4つの環境を管理する。

## 🏗️ 技術構成

- **インフラ**: AWS Copilot CLI v1.33.0+
- **コンテナ**: Docker + Amazon ECS (Fargate)
- **オーケストレーション**: AWS Copilot (ECS上のサービス管理)
- **依存関係**: AWS (ECS, RDS, ElastiCache, SNS, SQS, S3, CloudFront)

## 📁 ディレクトリ構造

```
copilot/
├── .workspace                    # Copilotワークスペース設定
├── environments/                 # 環境別設定
│   ├── staging/                  # 開発・テスト環境
│   ├── production/              # 本番環境（Myca店舗）
│   ├── public/                  # 一般公開環境
│   ├── customer/                # 有料顧客環境
│   └── addons/                  # 環境共通アドオン
├── pipelines/                   # CI/CDパイプライン
│   ├── staging/                 # ステージングパイプライン
│   ├── production/              # 本番パイプライン
│   └── customer/                # 顧客環境パイプライン
├── pos-web-app/                 # メインWebアプリ（LB付き）
├── ec-web-app/                  # EC専用Webアプリ（LB付き）
├── backend-outbox/              # アウトボックスサービス
├── worker-ec-order/             # EC注文処理ワーカー
├── worker-external-ec/          # 外部EC連携ワーカー
├── worker-item/                 # 商品管理ワーカー
├── worker-product/              # 在庫処理ワーカー
├── worker-transaction/          # 取引処理ワーカー
├── worker-scheduled/            # スケジュール処理ワーカー
├── worker-notification/         # 通知処理ワーカー
├── job-daily-calculate/         # 日次集計ジョブ
├── job-ensure-consistency/      # データ整合性チェックジョブ
├── resources/                   # 追加リソース定義
└── utils/                      # ユーティリティスクリプト
```

## ☁️ AWS リソース

### サービス構成
- **Load Balanced Services**: 2個（pos-web-app, ec-web-app）
- **Worker Services**: 7個（イベント駆動型バックグラウンド処理）
- **Backend Services**: 1個（backend-outbox）
- **Scheduled Jobs**: 2個（日次バッチ処理）

### 環境設定
- **リージョン**: ap-northeast-1 (東京)
- **アプリケーション名**: pos
- **環境**: staging, production, public, customer

### データストア
- **RDS Aurora MySQL 8.0**: 
  - Staging: db.t4g.medium（単一インスタンス）
  - Production: db.r8g.large（Writer）+ db.r7g.large（Reader 1-3台）
- **ElastiCache**: Valkey 8（Serverless、Redis互換）

### メッセージング
- **SNS Topics**: 8個（FIFO、各ワーカー用）
- **SQS Queues**: 8個（FIFO、各ワーカー用）

## 🔄 デプロイメント

### デプロイ戦略
- **Rolling Update**: デフォルト戦略
- **Blue/Green**: 本番環境では可能（手動切り替え）
- **Canary**: 未実装（将来対応予定）

### パイプライン
1. **Source Stage**: GitHub（ブランチベース）
2. **Build Stage**: ECRへのイメージビルド・プッシュ
3. **Deploy Stage**: 
   - pos-web-app → ec-web-app → workers（並列）→ jobs → backend-services
4. **Post-Deploy**: Lambda関数（SAM）デプロイ

### 環境切り替え
```bash
# 環境を選択してデプロイ
copilot svc deploy --env staging
copilot svc deploy --env production
copilot svc deploy --env customer
copilot svc deploy --env public
```

## 🔧 主要機能

### マルチテナンシー
- 環境別に完全分離されたインフラ
- 顧客ごとの独立したデータストア
- 環境間でのリソース共有なし

### イベント駆動アーキテクチャ
- SNS/SQSによる疎結合なサービス間通信
- FIFOキューによる順序保証
- Dead Letter Queueによる障害処理

### オートスケーリング
- CPU使用率ベース（Web Services）
- キューの深さベース（Workers）
- 時間ベース（Jobs）

### 高可用性
- Multi-AZ配置
- ヘルスチェック
- 自動復旧

## 💡 運用パターン

### サービス管理
```bash
# サービス一覧
copilot svc ls

# サービスログ確認
copilot svc logs --name pos-web-app --env production

# サービス状態確認
copilot svc status --name pos-web-app --env production

# サービス再起動
copilot svc deploy --name pos-web-app --env production
```

### 環境管理
```bash
# 環境一覧
copilot env ls

# 環境詳細
copilot env show --name production

# アドオン適用
copilot env deploy --name production
```

### パイプライン管理
```bash
# パイプライン状態確認
copilot pipeline status

# パイプライン更新
copilot pipeline deploy
```

## 📊 監視・ログ

### 監視項目
- **ECSメトリクス**: CPU、メモリ、タスク数
- **RDSメトリクス**: 接続数、レプリカラグ、CPU
- **SQSメトリクス**: キューの深さ、メッセージ年齢
- **カスタムメトリクス**: ビジネスKPI

### ログ出力
- **CloudWatch Logs**: 全サービスのログ集約
- **ログ形式**: JSON構造化ログ
- **保持期間**: Staging 7日、Production 30日

### アラート設定
- **Slack通知**: SNS経由でエラー通知
- **閾値**: サービスごとにカスタマイズ
- **エスカレーション**: 重要度に応じた通知先

## 🔗 関連ディレクトリ

- [環境設定詳細](./environments/)
- [パイプライン設定](./pipelines/)
- [ワーカーサービス](../workers/)
- [ジョブ定義](../jobs/)
- [バックエンドサービス](../backend-services/)

## 📝 運用メモ

### パフォーマンス考慮事項
- Worker CPUは意図的に低め（256）でDB負荷軽減
- RDS Proxyによる接続プーリング
- Spot Instancesによるコスト最適化（Workers）

### セキュリティ設定
- WAFによる地理的制限（機密パスは日本のみ）
- プライベートサブネット配置
- Secrets Managerによる機密情報管理
- 最小権限のIAMロール

### トラブルシューティング
1. **デプロイ失敗**: CloudFormationスタックの確認
2. **サービス起動失敗**: ECSタスクログの確認
3. **DB接続エラー**: RDS Proxy状態とセキュリティグループ確認
4. **メッセージ処理遅延**: SQSメトリクスとDLQ確認

### コスト最適化
- Staging環境はContainer Insights無効化
- Workerは最小スペックで多重度で対応
- Spot Instances活用（可用性が許容される場合）
- Serverless ElastiCacheでオンデマンド課金

---
*Infrastructure-Agent作成: 2025-01-24*