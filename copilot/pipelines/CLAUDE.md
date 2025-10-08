# copilot/pipelines/CLAUDE.md

## 🎯 目的・役割

GitHub連携によるCI/CDパイプラインを管理し、各環境への自動デプロイメントを実現する。ブランチベースの環境分離により、安全で効率的な継続的デリバリーを提供する。

## 🏗️ 技術構成

- **インフラ**: AWS CodePipeline + CodeBuild
- **コンテナ**: ECR (Elastic Container Registry)
- **オーケストレーション**: AWS Copilot Pipeline
- **依存関係**: GitHub, SAM (Serverless Application Model)

## 📁 ディレクトリ構造

```
copilot/pipelines/
├── staging/                     # ステージングパイプライン
│   ├── manifest.yml            # パイプライン定義
│   ├── buildspec.yml           # ビルド仕様
│   ├── overrides/              # CloudFormationオーバーライド
│   │   ├── README.md
│   │   └── cfn.patches.yml
│   └── sam/                    # Lambda関数デプロイ
│       └── buildspec.yml
├── production/                 # 本番パイプライン
│   ├── manifest.yml
│   ├── buildspec.yml
│   ├── overrides/
│   └── sam/
└── customer/                   # 顧客環境パイプライン
    ├── manifest.yml
    ├── buildspec.yml
    └── overrides/
```

## ☁️ AWS リソース

### パイプライン構成
- **Source**: GitHub (ブランチトリガー)
- **Build**: CodeBuild (ビルド・パッケージング)
- **Deploy**: CodePipeline (順次デプロイ)
- **リージョン**: ap-northeast-1 (東京)

### ブランチマッピング
| パイプライン | ブランチ | 環境 | デプロイサービス数 |
|------------|---------|------|-------------------|
| staging | develop | staging | 12 (全サービス) |
| production | production | production | 12 (全サービス) |
| customer | customer | customer | 1 (pos-web-appのみ) |

### ビルド環境
- **Copilot CLI**: v1.34.0
- **ビルドイメージ**: aws/codebuild/amazonlinux2-aarch64-standard:3.0
- **コンピュートタイプ**: BUILD_GENERAL1_MEDIUM
- **ランタイム**: Node.js 22, Python 3.11 (SAM用)

## 🔄 デプロイメント

### デプロイ戦略
```yaml
# デプロイ順序
1. pos-web-app          # メインWebアプリ
2. ec-web-app           # EC Webアプリ (pos-web-app依存)
3. workers (並列)       # 全ワーカーサービス
4. jobs                 # バッチジョブ
5. backend-outbox       # バックエンドサービス
6. Lambda functions     # SAMデプロイ (後処理)
```

### パイプライン管理
```bash
# パイプライン作成
copilot pipeline init

# パイプラインデプロイ
copilot pipeline deploy

# パイプライン状態確認
copilot pipeline status

# パイプライン削除
copilot pipeline delete
```

### 手動実行
```bash
# AWS ConsoleまたはCLIから手動トリガー
aws codepipeline start-pipeline-execution --name pos-staging-pipeline
```

## 🔧 主要機能

### イメージ再利用最適化
```yaml
# ec-web-appはpos-web-appのイメージを再利用
ec-web-app:
  image_uri: 502078855105.dkr.ecr.ap-northeast-1.amazonaws.com/pos/pos-web-app
```
- ビルド時間の短縮
- ECRストレージの節約
- デプロイの高速化

### マルチサービスデプロイ
```bash
# ビルドフェーズでの自動検出
for svc in $COPILOT_APPLICATION_NAME/*; do
  if [ -f $svc/manifest.yml ]; then
    # サービスごとにCloudFormationテンプレート生成
    copilot svc package --name $svc --env $env
  fi
done
```

### SAM統合
```yaml
# Lambda関数の後処理デプロイ
post_deployments:
  commands:
    - make sam:build
    - make deploy:${COPILOT_ENVIRONMENT_NAME}
```

### エラーハンドリング
- ビルド失敗時の明確なエラーメッセージ
- デプロイ失敗時の自動ロールバック
- CloudWatch Logsへの詳細ログ出力

## 💡 運用パターン

### ブランチ運用
```bash
# 開発フロー
git checkout develop
git push origin develop  # → staging自動デプロイ

# 本番リリース
git checkout production
git merge develop
git push origin production  # → production自動デプロイ
```

### ビルドキャッシュ活用
```yaml
# DockerレイヤーキャッシュによるS高速化
cache:
  paths:
    - /root/.cache
    - node_modules/
```

### 環境変数管理
```bash
# パイプライン実行時の環境変数
COPILOT_APPLICATION_NAME: pos
COPILOT_ENVIRONMENT_NAME: staging/production/customer
COPILOT_PIPELINE_NAME: pos-{env}-pipeline
```

## 📊 監視・ログ

### 監視項目
- **パイプライン実行時間**: 各ステージの所要時間
- **成功率**: デプロイ成功/失敗の割合
- **ビルド時間**: イメージビルドの効率性
- **デプロイ頻度**: 環境別のリリース頻度

### ログ出力
- **CodeBuild Logs**: ビルド詳細ログ
- **CodePipeline Logs**: パイプライン実行履歴
- **CloudWatch Logs**: 統合ログ管理
- **保持期間**: 30日間

### アラート設定
- **パイプライン失敗**: Slack通知
- **ビルド失敗**: 開発者へのメール通知
- **長時間実行**: タイムアウト警告
- **手動承認待ち**: 承認者への通知

## 🔗 関連ディレクトリ

- [環境設定](../environments/)
- [サービス定義](../pos-web-app/)
- [ワーカーサービス](../../workers/)
- [Lambda関数](../../functions/)
- [ルートCopilot設定](../)

## 📝 運用メモ

### パフォーマンス考慮事項
- **並列ビルド**: ワーカーサービスの並列デプロイ
- **イメージ再利用**: 共通イメージの活用
- **キャッシュ活用**: Dockerレイヤーキャッシュ
- **ビルドスペック**: 適切なコンピュートタイプ選択

### セキュリティ設定
- **GitHub連携**: OAuthトークンによる認証
- **IAMロール**: 最小権限の原則
- **シークレット**: Secrets Managerで管理
- **アーティファクト**: S3暗号化

### トラブルシューティング
1. **ビルド失敗**
   - DockerfileとCopilot設定の整合性確認
   - 依存関係のバージョン確認
   - ビルドログの詳細確認

2. **デプロイ失敗**
   - CloudFormationスタックの状態確認
   - サービスのヘルスチェック確認
   - IAM権限の確認

3. **パイプライン停止**
   - GitHub接続状態確認
   - CodePipelineの実行履歴確認
   - 手動承認の有無確認

### ベストプラクティス
- **ブランチ保護**: mainブランチへの直接push禁止
- **レビュー必須**: PRマージ前のコードレビュー
- **段階的リリース**: staging → production の順守
- **ロールバック準備**: 前バージョンへの切り戻し手順

### コスト最適化
- **ビルド時間短縮**: イメージ再利用とキャッシュ
- **不要なビルド防止**: 適切なブランチフィルター
- **リソース最適化**: 必要最小限のコンピュートタイプ
- **アーティファクト管理**: 古いビルドの定期削除

---
*Infrastructure-Agent作成: 2025-01-24*