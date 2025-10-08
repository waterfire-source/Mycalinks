# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MycaLinks POS System - Project Overview

## 概要
MycaLinksのPOS（Point of Sale）システム。小売店舗の販売・在庫管理・ECサイト運営を統合的に管理するWebアプリケーション。

## アーキテクチャ

### モノレポ構成
- **パッケージマネージャー**: pnpm (v10.10.0)
- **Node.js**: v23.9.0 (Voltaで管理)
- **ビルドツール**: Turbo (v2.5.2) - ビルドキャッシュとタスク並列化
- **ワークスペース構成**:
  - `/packages/web-app`: Next.js 14 フロントエンド
  - `/packages/backend-core`: 共通バックエンドロジック
  - `/packages/api-generator`: API定義からTypeScriptクライアント生成
  - `/packages/common`: 共通ユーティリティ
  - `/workers`: 非同期ジョブワーカー群
  - `/jobs`: 定期実行ジョブ
  - `/backend-services`: バックエンドサービス
  - `/functions`: AWS Lambda関数
  - `/copilot`: AWS Copilotインフラ定義

## 主要機能

### POS機能
- 販売取引処理
- 買取・査定機能
- 在庫管理（複数コンディション対応）
- レジ管理・決済処理
- レシート・ラベル印刷

### EC機能
- オンラインストア
- 外部ECプラットフォーム連携（おちゃのこネット、Shopify）
- ショッピングカート
- 注文管理
- 複数決済ゲートウェイ（GMO、Square）

### 在庫管理
- 商品マスタ管理
- 在庫追跡・履歴
- 仕入先管理
- バンドル商品・パック開封機能
- バーコード/QRコード対応

### 顧客管理
- 顧客プロファイル
- ポイントシステム
- 予約管理
- 購入履歴

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **UIライブラリ**: Material-UI (MUI)
- **フォーム管理**: React Hook Form + Zod
- **認証**: NextAuth
- **状態管理**: React hooks + Context API
- **テスト**: Vitest (統合テスト), Playwright (E2E)

### バックエンド
- **ORM**: Prisma (MySQL)
- **キャッシュ**: Redis
- **メッセージキュー**: AWS SQS
- **アーキテクチャ**: イベント駆動型
- **AWS SDK**: S3, SES, CloudWatch, SNS

### インフラ (AWS Copilot)
- **コンテナ**: ECS
- **データベース**: RDS (MySQL)
- **キャッシュ**: ElastiCache
- **CDN**: CloudFront
- **ストレージ**: S3
- **メール**: SES

## 開発コマンド

### 環境構築
```bash
# 依存関係インストール
pnpm i

# バックエンドビルド (必須: 他の作業前に実行)
pnpm run build:backend-core

# フロントエンド開発サーバー起動 (port 3020)
pnpm run dev:web-app

# 特定パッケージのみビルド
pnpm run build:common
pnpm run build:api-generator
```

### データベース
```bash
# Prisma型生成 (スキーマ変更後に必須)
pnpm run prisma:generate

# マイグレーション実行
pnpm run migrate

# マイグレーション作成のみ
pnpm run migrateScript

# ストアドプロシージャ更新
pnpm run migrateFunctions

# データベース管理画面
pnpm run dev:mysql
```

### API
```bash
# APIクライアント生成 (API定義変更後に必須)
pnpm run api:generate

# 新規API定義作成
pnpm run api:new
```

### テスト・品質管理
```bash
# APIテスト
pnpm run test:integ:api:internal

# E2Eテスト
pnpm run test:e2e

# リント実行
pnpm run lint:web-app

# フォーマット
pnpm run formatOnly
```

### 高速ビルド (Turbo版)
```bash
# Turboを使用した並列ビルド
pnpm run build:web-app:turbo
pnpm run dev:web-app:turbo

# ベンチマーク比較
pnpm run benchmark:web-app
```

## 環境・URL

- **ローカル**: http://localhost:3020
- **ステージング**: https://staging.pos.mycalinks.io
- **本番**: https://pos.mycalinks.io (Myca店舗用)
- **一般公開**: https://public.pos.mycalinks.io (外部テスト店舗用)
- **顧客環境**: https://pos.mycalinks.com (有料契約顧客用)
- **一時環境**: https://tmp.pos.mycalinks.io (機能検証用)

## ブランチ戦略

- `develop`: 開発メインブランチ（ステージング自動デプロイ）
- `production`: 本番環境（自動デプロイ・マイグレーション）
- `public-production`: 一般公開環境
- `customer-production`: 顧客環境
- `tmp`: 一時検証環境

**重要**: production, developに直接プッシュしない。必ずPRを作成する。

## 依存関係とビルド順序

### 依存関係グラフ
```
common (基礎)
  ↑
backend-core (データ・ビジネスロジック)
  ↑
api-generator (API定義・クライアント生成)
  ↑
web-app (フロントエンド)
```

### ビルド順序 (重要)
1. `common` → `backend-core` → `api-generator` → `web-app`
2. Prisma生成は`backend-core`ビルド前に必須
3. API生成は型定義変更時に必須

## ワーカー・ジョブ

### Workers (非同期処理)
- `ec-order`: EC注文処理
- `external-ec`: 外部EC連携
- `item`: 商品管理
- `notification`: 通知送信
- `product`: 在庫更新
- `scheduled`: スケジュールタスク
- `transaction`: 取引処理

### Jobs (定期実行)
- `daily`: 日次集計処理
- `ensure-consistency`: データ整合性チェック

### Functions (AWS Lambda)
- `email-webhook`: メールWebhook処理
- `shopify-webhook`: Shopify Webhook処理

## データベース構成

### 主要エンティティ
- `Account`: ユーザーアカウント
- `Store`: 店舗
- `Item`: 商品マスタ
- `Product`: 在庫
- `Transaction`: 取引
- `Customer`: 顧客
- `EC_Order`: EC注文

### 設計原則
- マルチテナント対応（store_id による分離）
- 論理削除対応（deleted フラグ）
- 履歴管理テーブル
- 一度リリースしたテーブルのカラムは原則削除しない

## 外部連携

- **決済**: GMO Payment Gateway, Square
- **EC**: おちゃのこネット, Shopify
- **ハードウェア**: EPSONプリンター、Brotherラベルプリンター
- **クラウド**: AWS, Google Cloud Platform
- **通知**: Expo (プッシュ通知)

## コーディング規約

### 必須ルール
- 変数名: キャメルケース
- ファイル名: コンポーネント.tsx以外はキャメルケース、コンポーネントはパスカルケース
- クラス名: パスカルケース
- page.tsx: default export、他のコンポーネント: named export
- コミット前にlint/prettierが自動実行 (husky)

### アーキテクチャ原則
- 高凝集、疎結合を意識
- Feature-Driven Development (feature単位でディレクトリ分離)
- 型安全性の徹底 (any禁止)
- エラーハンドリングの統一

## トラブルシューティング

### Prisma関連エラー
1. `pnpm run prisma:generate` を実行
2. devサーバー再起動
3. それでも解決しない場合は担当者に相談

### API関連エラー
1. `pnpm run api:generate` を実行
2. devサーバー再起動
3. Slack #info-myca-error チャンネルのエラーログ確認
4. 担当者に相談

### ビルドエラー
1. 依存関係の順序を確認 (common → backend-core → api-generator → web-app)
2. `pnpm i` で依存関係を再インストール
3. Turboキャッシュクリア: `npx turbo clean`

## デプロイメント

### 自動デプロイ
- developブランチ → ステージング環境
- productionブランチ → 本番環境 (マイグレーション自動実行)

### 手動デプロイ (AWS Copilot CLI)
```bash
# サービスデプロイ
copilot deploy

# 環境デプロイ
copilot env deploy

# パイプライン状況確認
copilot pipeline status
```

## リソース識別子 (MRN)

形式: `mrn:myca:pos:（リソース種別）:（ID）@corporation:（企業ID）:store:（店舗ID）`

例: `mrn:myca:pos:product:1234@corporation:1:store:1`

## 重要な注意事項

### セキュリティ
- production, developに直接プッシュしない
- 機密情報は環境変数で管理
- store_idによる厳密なデータ分離

### データベース
- 本番デプロイ前は必ずステージングで動作確認
- マイグレーションは慎重に実行
- 一度リリースしたテーブルのカラムは原則削除しない

### 開発フロー
1. 機能ブランチ作成
2. ステージング環境で15分ほど動作確認
3. productionブランチへマージ

## 主要なドキュメント

### ルートディレクトリ
- **README.md** - 基本的な環境構築手順
- **CLAUDE.md** - プロジェクト概要とアーキテクチャ詳細

### パッケージ別ドキュメント
- `packages/backend-core/README.md` - バックエンドコア機能
- `packages/common/README.md` - 共通ユーティリティ
- `packages/api-generator/src/defs/README.md` - API定義ガイド
- `workers/README.md` - ワーカープロセス
- `jobs/README.md` - ジョブ
- `functions/README.md` - Lambda関数

### インフラ・デプロイ
- `copilot/`配下の各種README - インフラ設定とデプロイ手順

### テスト関連
- `docs/API統合テスト実装完了報告書.md` - API統合テスト
- `docs/テストケーステンプレート集.md` - テストケース作成ガイド
- `packages/web-app/tests/e2e/README.md` - E2Eテストガイド