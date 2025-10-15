# TASK-003: Infrastructure CLAUDE.md作成タスク

## 📋 タスク基本情報

- **タスクID**: TASK-003
- **カテゴリ**: docs
- **担当エージェント**: Infrastructure-Agent
- **状態**: pending
- **優先度**: high
- **複雑度**: high
- **作成日**: 2025-01-24
- **期限**: 2025-01-26
- **担当ファイル数**: 22個

## 🎯 タスク概要

AWS Copilot・Workers・Jobs・Functions関連のCLAUDE.mdファイルを作成し、インフラストラクチャとデプロイメント戦略の完全な知識ベースを構築する。

## 📂 担当ファイルパス（競合防止）

### 🔒 **専属所有権ファイルパス**
```
copilot/
workers/
jobs/
functions/
backend-services/
```

## 📋 作成対象CLAUDE.mdファイル一覧

### 🔥 最優先配置 [0個]
*（最優先配置はPackages統括のため Infrastructure-Agentには該当なし）*

### ⭐ 高優先配置 [2個]
- [ ] `copilot/` - AWS Copilotインフラ全体
- [ ] `workers/` - 定期処理ワーカー全体

### 📋 中優先配置 [17個]
#### AWS Copilot 環境・パイプライン
- [ ] `copilot/environments/` - 環境別設定
- [ ] `copilot/pipelines/` - CI/CDパイプライン

#### Workers詳細
- [ ] `workers/transaction/` - 取引処理ワーカー
- [ ] `workers/scheduled/` - スケジュール処理ワーカー
- [ ] `workers/product/` - 商品処理ワーカー
- [ ] `workers/item/` - アイテム処理ワーカー
- [ ] `workers/notification/` - 通知処理ワーカー
- [ ] `workers/external-ec/` - 外部EC連携ワーカー
- [ ] `workers/ec-order/` - EC注文処理ワーカー

#### Jobs（重処理バッチ）
- [ ] `jobs/` - 重処理バックグラウンドジョブ
- [ ] `jobs/daily/` - 日次バッチ処理
- [ ] `jobs/ensure-consistency/` - データ整合性チェック 

#### Backend Services
- [ ] `backend-services/` - マイクロサービス
- [ ] `backend-services/outbox/` - アウトボックスパターン

#### AWS Copilot サービス詳細（上位5サービス）
- [ ] `copilot/pos-web-app/` - メインWebアプリ
- [ ] `copilot/ec-web-app/` - EC専用Webアプリ
- [ ] `copilot/backend-outbox/` - アウトボックスサービス

### 🎯 検討優先配置 [3個]
#### Functions・その他
- [ ] `functions/` - サーバーレス関数
- [ ] `functions/email-webhook/` - メール用Webhook処理
- [ ] `copilot/addons/` - 共通アドオン（RDS, VPN等）

## 📄 CLAUDE.mdテンプレート構造

各CLAUDE.mdファイルには以下の構造を含める：

```markdown
# [ディレクトリ名]/CLAUDE.md

## 🎯 目的・役割

## 🏗️ 技術構成
- **インフラ**: AWS Copilot
- **コンテナ**: Docker + ECS
- **オーケストレーション**: 
- **依存関係**: 

## 📁 ディレクトリ構造
```
[ツリー構造]
```

## ☁️ AWS リソース
- **サービス**: 
- **リージョン**: 
- **環境設定**: 

## 🔄 デプロイメント
- **デプロイ戦略**: 
- **パイプライン**: 
- **環境切り替え**: 

## 🔧 主要機能
- 機能1の説明
- 機能2の説明

## 💡 運用パターン
- 典型的な運用方法
- 設定例

## 📊 監視・ログ
- **監視項目**: 
- **ログ出力**: 
- **アラート設定**: 

## 🔗 関連ディレクトリ
- [関連ディレクトリ1](../path/)
- [関連ディレクトリ2](../path/)

## 📝 運用メモ
- パフォーマンス考慮事項
- セキュリティ設定
- トラブルシューティング

---
*Infrastructure-Agent作成: 2025-01-24*
```

## ✅ 受け入れ基準

- [ ] **完全性**: 22個すべてのCLAUDE.mdファイルが作成済み
- [ ] **品質**: 各ファイルにテンプレート構造の全セクションが含まれる
- [ ] **AWS設定**: Copilotマニフェスト・環境設定の正確な記載
- [ ] **デプロイ**: CI/CDパイプラインとデプロイ戦略の詳細
- [ ] **相互参照**: インフラ構成間のリンクが正しく設定
- [ ] **運用性**: 実際の運用で活用できる手順書レベルの情報
- [ ] **セキュリティ**: AWS セキュリティベストプラクティス記載

## 🔄 依存関係

- **requires**: project_analysis_report.md（完了済み）
- **blocks**: なし
- **relates**: TASK-001, TASK-002, TASK-004
- **coordination**: Backend-Agent（マイクロサービス統合）

## 🚀 実装手順

1. **Phase 1**: 高優先配置（2個）- インフラ全体統括
2. **Phase 2**: AWS Copilot 基盤（2個）- 環境・パイプライン
3. **Phase 3**: Workers詳細（7個）- 各ワーカーサービス
4. **Phase 4**: Jobs・Services（5個）- バッチ・マイクロサービス
5. **Phase 5**: Copilot Services（3個）- 主要アプリサービス
6. **Phase 6**: Functions・その他（3個）- サーバーレス・アドオン
7. **Phase 7**: 相互参照リンクの検証・更新

## 📊 進捗追跡

- **開始日時**: 未開始
- **Phase 1 完了**: 未完了
- **Phase 2 完了**: 未完了
- **Phase 3 完了**: 未完了
- **Phase 4 完了**: 未完了
- **Phase 5 完了**: 未完了
- **Phase 6 完了**: 未完了
- **Phase 7 完了**: 未完了
- **最終完了**: 未完了

## 💬 コミュニケーション

**Status** 2025-01-24 17:30 Infrastructure-Agent: タスク作成完了、実装待機中

## 🔍 品質チェックリスト

- [ ] AWS Copilot CLI の使用方法が正確に記載
- [ ] 11コンテナサービスの役割分担が明確
- [ ] 5環境（staging, production, customer, public, addons）の違いを詳記
- [ ] 3パイプライン（staging, production, customer）の設定説明
- [ ] Docker Compose / ECS タスク定義の参照
- [ ] マイクロサービス間通信パターンの説明
- [ ] イベント駆動アーキテクチャ（SQS等）の記載
- [ ] アウトボックスパターンの実装詳細
- [ ] モニタリング・ログ集約戦略の説明
- [ ] スケーリング・パフォーマンス考慮事項

## 🎯 特別重点項目

### 🏗️ AWS Copilot アーキテクチャ
- **11サービス構成**: 各サービスの責務と通信パターン
- **マルチ環境**: 環境間の設定差分と切り替え戦略
- **パイプライン**: GitOps による自動デプロイメント

### 🔄 ワーカーパターン
- **軽量処理**: 定期的・リアルタイム処理のワーカー設計
- **重処理**: バッチジョブとの使い分け
- **障害処理**: 再試行・Dead Letter Queue 戦略

### 📊 監視・運用
- **CloudWatch**: メトリクス・ログ・アラーム設定
- **分散トレーシング**: マイクロサービス間の可視化
- **デバッグ**: 本番環境でのトラブルシューティング手順

### 🔐 セキュリティ
- **IAM**: 最小権限原則に基づく権限設計
- **VPC**: ネットワーク分離とセキュリティグループ
- **シークレット**: 機密情報の安全な管理方法 