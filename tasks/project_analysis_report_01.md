# プロジェクト構造分析レポート

## 調査状況サマリー

- **最終更新日時**: 2025-01-24 17:15:00 JST
- **調査進捗**: 超詳細分析完了（web-app の API・UI・feature 深堀完了）
- **追加調査完了ディレクトリ**: 
  - `packages/web-app/src/app/api/` - 全APIエンドポイント詳細
  - `packages/web-app/src/app/api/store/[store_id]/` - 店舗API詳細
  - `packages/web-app/src/app/auth/` - 認証後UIページ詳細
  - `packages/web-app/src/feature/` - ドメイン別コンポーネント詳細

## CLAUDE.md 配置確定リスト

*(ユーザーによって配置が確定されたディレクトリのリスト)*

- [ ] 確定待ち

## ディレクトリ分析詳細

### ルートディレクトリ構造

```
pos/
├── packages/           🔥 [重要度: 最高] メインコードベース
│   ├── web-app/        - Next.js フロントエンド
│   ├── backend-core/   - バックエンドコア
│   ├── common/         - 共通モジュール
│   └── api-generator/  - API生成ツール
├── copilot/           🔥 [重要度: 高] AWS Copilot デプロイ設定
├── jobs/              🔥 [重要度: 高] バックグラウンドジョブ
├── workers/           📋 [重要度: 中] ワーカープロセス
├── backend-services/  📋 [重要度: 中] バックエンドサービス
│   └── outbox/        - アウトボックスパターン実装
├── functions/         📋 [重要度: 中] Lambda関数
├── apps/              📋 [重要度: 低] アプリケーション（現在空）
├── configs/           📋 [重要度: 中] 設定ファイル
├── docs/              📋 [重要度: 中] ドキュメント
├── envs/              📋 [重要度: 中] 環境設定
├── prompts/           📋 [重要度: 低] プロンプトテンプレート
├── tasks/             📋 [重要度: 中] タスク管理
└── _templates/        📋 [重要度: 低] テンプレート
```

### 初期分析結果

#### 1. packages/ ディレクトリ [最重要]
**技術スタック推定**: 
- Monorepo構成（pnpm workspace）
- TypeScript/JavaScript
- Next.js (web-app)
- Node.js (backend-core)

**構成要素**:
- `web-app/`: フロントエンドアプリケーション（Next.js）
- `backend-core/`: バックエンドコア（API、データベース）
- `common/`: 共通ライブラリ・ユーティリティ
- `api-generator/`: API関連のコード生成

**CLAUDE.md配置推奨度**: ⭐⭐⭐⭐⭐
- 各サブディレクトリに個別のCLAUDE.mdが必要

#### 2. copilot/ ディレクトリ [高重要度]
**技術スタック推定**: 
- AWS Copilot CLI
- コンテナベースデプロイメント
- Infrastructure as Code

**構成推定**:
- 複数環境（staging, production）
- マイクロサービス構成
- パイプライン設定

**CLAUDE.md配置推奨度**: ⭐⭐⭐⭐
- インフラ構成の理解に重要

#### 3. jobs/ ディレクトリ [高重要度]
**技術スタック推定**:
- バックグラウンドジョブ処理
- 定期実行タスク
- データ処理パイプライン

**CLAUDE.md配置推奨度**: ⭐⭐⭐
- バッチ処理の理解に重要

### 詳細分析結果（packages/）

#### packages/web-app/ ディレクトリ [最重要]
**技術スタック確定**:
- **フレームワーク**: Next.js 14.2.3 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: React Hook Form
- **テスト**: Vitest, Playwright (E2E)
- **認証**: NextAuth.js
- **決済**: Square API, マルチペイメント
- **データベース**: Prisma Client
- **その他**: Redis, AWS SDK, バーコード/QR生成

**src/ディレクトリ構造**:
```
src/
├── app/            # Next.js App Router
│   ├── api/        # API Routes
│   ├── auth/       # 認証関連ページ
│   ├── register/   # 登録関連
│   ├── login/      # ログイン
│   ├── ec/         # ECサイト機能
│   └── docs/       # ドキュメント
├── components/     # 再利用可能コンポーネント
├── feature/        # 機能別コンポーネント
├── hooks/          # カスタムフック
├── contexts/       # React Context
├── providers/      # プロバイダー
├── api/            # API クライアント
├── utils/          # ユーティリティ
├── types/          # 型定義
├── constants/      # 定数
├── theme/          # テーマ設定
└── assets/         # 静的ファイル
```

**環境別設定**:
- 開発環境（dev）
- ステージング環境（staging）
- 本番環境（prod）
- 顧客公開環境（customer-prod）
- 一時環境（tmp）

#### packages/backend-core/ ディレクトリ [最重要]
**技術スタック確定**:
- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma 6.6.0
- **データベース**: MySQL (mysql2)
- **キャッシュ**: Redis (ioredis)
- **AWS**: S3, SES, SNS, SQS, CloudWatch, Scheduler
- **認証**: Google Auth Library
- **ユーティリティ**: Zod, Dayjs, CSV処理

**src/ディレクトリ構造**:
```
src/
├── services/       # ビジネスロジック
├── task/           # タスク処理
├── job/            # ジョブ処理
├── db/             # データベース関連
├── redis/          # Redis関連
├── event/          # イベント処理
└── error/          # エラーハンドリング
```

**Prismaスキーマ構成**:
```
prisma/schema/
├── schema.prisma      # メインスキーマ
├── account.prisma     # アカウント関連 (34KB)
├── product.prisma     # 商品関連 (44KB)
├── transaction.prisma # 取引関連 (23KB)
├── item.prisma        # アイテム関連 (25KB)
├── ec.prisma          # EC関連 (17KB)
├── customer.prisma    # 顧客関連
├── admin.prisma       # 管理者関連
├── dwh.prisma         # データウェアハウス
├── app.prisma         # アプリ関連
├── migrations/        # マイグレーション履歴
├── triggers/          # データベーストリガー
└── stored/            # ストアドプロシージャ
```

### 技術スタック詳細確定
- **フロントエンド**: Next.js 14.2.3 (App Router), TypeScript, Material-UI v5
- **バックエンド**: Node.js, TypeScript, Prisma 6.6.0
- **データベース**: MySQL + Redis
- **インフラ**: AWS (S3, SES, SNS, SQS, CloudWatch), AWS Copilot
- **決済**: Square API, マルチペイメント
- **パッケージ管理**: pnpm (monorepo)
- **ビルドツール**: Turbo, TypeScript
- **テスト**: Vitest, Playwright
- **環境管理**: dotenv (複数環境対応)

## 🎯 CLAUDE.md配置推奨リスト（拡張分析完了版）

### 📊 配置個数サマリー（超詳細版）
- **最優先配置**: 6個 ⭐⭐⭐⭐⭐
- **高優先配置**: 8個 ⭐⭐⭐⭐ *(+4個 追加)*
- **中優先配置**: 42個 ⭐⭐⭐ *(+32個 追加)*
- **検討優先配置**: 38個 ⭐⭐ *(+35個 追加)*
- **📈 総配置推奨数**: **94個** *(71個 大幅増加)*

**🎯 特別細分化対象**:
- **API層**: 54個 (store_id別 + 全般API)
- **UI層**: 25個 (認証後ページ)
- **Feature層**: 30個 (ドメイン別コンポーネント)

---

### 最優先配置（⭐⭐⭐⭐⭐）[6個]
- `packages/` - Monorepo全体概要
- `packages/web-app/` - Next.jsフロントエンド
- `packages/backend-core/` - Node.jsバックエンド
- `packages/web-app/src/` - フロントエンドソースコード
- `packages/backend-core/src/` - バックエンドソースコード
- `packages/backend-core/prisma/` - データベース設計

### 高優先配置（⭐⭐⭐⭐）[8個]
- `packages/common/` - 共通ライブラリ
- `packages/api-generator/` - API生成ツール
- `copilot/` - AWS Copilotインフラ全体
- `workers/` - 定期処理ワーカー全体
- **🆕 `packages/web-app/src/app/api/`** - 全APIエンドポイント統括
- **🆕 `packages/web-app/src/app/api/store/`** - 店舗API統括
- **🆕 `packages/web-app/src/app/auth/`** - 認証後UI統括
- **🆕 `packages/web-app/src/feature/`** - ドメイン別コンポーネント統括

### 中優先配置（⭐⭐⭐）[42個]

#### **既存の中優先項目** [10個]
- `packages/web-app/src/app/` - Next.js App Router
- `packages/web-app/src/components/` - UIコンポーネント
- `packages/backend-core/src/services/` - ビジネスロジック
- `jobs/` - 重処理バックグラウンドジョブ
- `copilot/environments/` - 環境別設定
- `copilot/pipelines/` - CI/CDパイプライン
- `workers/transaction/` - 取引処理ワーカー
- `workers/scheduled/` - スケジュール処理ワーカー
- `backend-services/` - マイクロサービス

#### **🆕 店舗API詳細** [18個]
- `packages/web-app/src/app/api/store/[store_id]/`** - 店舗APIルート
- `packages/web-app/src/app/api/store/[store_id]/item/`** - 商品管理API
- `packages/web-app/src/app/api/store/[store_id]/product/`** - 製品管理API
- `packages/web-app/src/app/api/store/[store_id]/transaction/`** - 取引API
- `packages/web-app/src/app/api/store/[store_id]/customer/`** - 顧客管理API
- `packages/web-app/src/app/api/store/[store_id]/inventory/`** - 在庫管理API
- `packages/web-app/src/app/api/store/[store_id]/register/`** - レジスター管理API
- `packages/web-app/src/app/api/store/[store_id]/sale/`** - 売上管理API
- `packages/web-app/src/app/api/store/[store_id]/purchase-table/`** - 買取テーブルAPI
- `packages/web-app/src/app/api/store/[store_id]/stats/`** - 統計API
- `packages/web-app/src/app/api/store/[store_id]/reservation/`** - 予約管理API
- `packages/web-app/src/app/api/store/[store_id]/functions/`** - 機能API
- `packages/web-app/src/app/api/store/[store_id]/ec/`** - EC連携API
- `packages/web-app/src/app/api/store/[store_id]/appraisal/`** - 査定API
- `packages/web-app/src/app/api/store/[store_id]/loss/`** - ロス管理API
- `packages/web-app/src/app/api/store/[store_id]/template/`** - テンプレート管理API
- `packages/web-app/src/app/api/store/[store_id]/status/`** - ステータス管理API
- `packages/web-app/src/app/api/store/[store_id]/stocking/`** - 入荷管理API

#### **🆕 認証後UIページ詳細** [14個]
- `packages/web-app/src/app/auth/(dashboard)/`** - ダッシュボードルート
- `packages/web-app/src/app/auth/(dashboard)/item/`** - 商品管理ページ
- `packages/web-app/src/app/auth/(dashboard)/transaction/`** - 取引管理ページ
- `packages/web-app/src/app/auth/(dashboard)/customers/`** - 顧客管理ページ
- `packages/web-app/src/app/auth/(dashboard)/register/`** - レジスター画面
- `packages/web-app/src/app/auth/(dashboard)/sale/`** - 売上管理ページ
- `packages/web-app/src/app/auth/(dashboard)/purchase/`** - 購入管理ページ
- `packages/web-app/src/app/auth/(dashboard)/purchaseReception/`** - 購入受付ページ
- `packages/web-app/src/app/auth/(dashboard)/purchaseTable/`** - 買取テーブルページ
- `packages/web-app/src/app/auth/(dashboard)/stock/`** - 在庫管理ページ
- `packages/web-app/src/app/auth/(dashboard)/settings/`** - 設定ページ
- `packages/web-app/src/app/auth/(dashboard)/sales-analytics/`** - 売上分析ページ
- `packages/web-app/src/app/auth/(dashboard)/inventory-count/`** - 棚卸しページ
- `packages/web-app/src/app/auth/(dashboard)/original-pack/`** - オリジナルパック管理ページ

### 検討優先配置（⭐⭐）[38個]

#### **既存の検討優先項目** [3個]
- `functions/` - サーバーレス関数
- `jobs/daily/` - 日次バッチ処理
- `jobs/ensure-consistency/` - データ整合性チェック

#### **🆕 Feature ドメイン別コンポーネント詳細** [30個]
- `packages/web-app/src/feature/transaction/`** - 取引関連コンポーネント
- `packages/web-app/src/feature/item/`** - 商品関連コンポーネント
- `packages/web-app/src/feature/products/`** - 製品関連コンポーネント
- `packages/web-app/src/feature/customer/`** - 顧客関連コンポーネント
- `packages/web-app/src/feature/customers/`** - 顧客管理コンポーネント
- `packages/web-app/src/feature/register/`** - レジスター関連コンポーネント
- `packages/web-app/src/feature/sale/`** - 売上関連コンポーネント
- `packages/web-app/src/feature/purchase/`** - 購入関連コンポーネント
- `packages/web-app/src/feature/purchaseReception/`** - 購入受付コンポーネント
- `packages/web-app/src/feature/purchaseTable/`** - 買取テーブルコンポーネント
- `packages/web-app/src/feature/stock/`** - 在庫関連コンポーネント
- `packages/web-app/src/feature/stocking/`** - 入荷関連コンポーネント
- `packages/web-app/src/feature/inventory-count/`** - 棚卸しコンポーネント
- `packages/web-app/src/feature/settings/`** - 設定関連コンポーネント
- `packages/web-app/src/feature/dashboard/`** - ダッシュボードコンポーネント
- `packages/web-app/src/feature/ec/`** - EC関連コンポーネント
- `packages/web-app/src/feature/originalPack/`** - オリジナルパック関連
- `packages/web-app/src/feature/category/`** - カテゴリ関連コンポーネント
- `packages/web-app/src/feature/genre/`** - ジャンル関連コンポーネント
- `packages/web-app/src/feature/condition/`** - コンディション関連
- `packages/web-app/src/feature/conditionOption/`** - コンディションオプション
- `packages/web-app/src/feature/tag/`** - タグ関連コンポーネント
- `packages/web-app/src/feature/memo/`** - メモ関連コンポーネント
- `packages/web-app/src/feature/cash/`** - 現金管理コンポーネント
- `packages/web-app/src/feature/cashRegister/`** - キャッシュレジスター
- `packages/web-app/src/feature/close/`** - 締め処理関連
- `packages/web-app/src/feature/arrival/`** - 入荷関連コンポーネント
- `packages/web-app/src/feature/account/`** - アカウント関連
- `packages/web-app/src/feature/corporation/`** - 企業関連コンポーネント
- `packages/web-app/src/feature/square/`** - Square決済関連

#### **🆕 全般API詳細** [5個]
- `packages/web-app/src/app/api/account/`** - アカウント管理API
- `packages/web-app/src/app/api/corporation/`** - 企業管理API
- `packages/web-app/src/app/api/contract/`** - 契約管理API
- `packages/web-app/src/app/api/auth/`** - 認証API
- `packages/web-app/src/app/api/system/`** - システム管理API

### 🔍 超詳細分析結果（web-app API・UI・feature 完全マッピング）

#### packages/web-app/src/app/api/ の完全構造 [11個のAPIドメイン]
**発見された主要APIドメイン**:
- `account/` - アカウント管理
- `auth/` - 認証・認可 
- `contract/` - 契約管理
- `corporation/` - 企業管理
- `ec/` - EC統合
- `gmo/` - GMO決済
- `launch/` - ランチ機能
- `square/` - Square決済
- `store/` - 店舗管理（最大のドメイン）
- `system/` - システム管理
- `shopify/`, `ochanoko/` - 外部EC連携

#### packages/web-app/src/app/api/store/[store_id]/ の完全構造 [18個のエンドポイント]
**最重要な店舗別APIエンドポイント**:
- `item/` - 商品管理（最大のAPI - 26KB, 840行）
- `product/` - 製品管理
- `transaction/` - 取引管理
- `customer/` - 顧客管理
- `inventory/` - 在庫管理
- `stats/` - 統計・分析
- その他12個の専門エンドポイント

#### packages/web-app/src/app/auth/(dashboard)/ の完全構造 [14個のUIページ]
**認証後ダッシュボードの機能ページ**:
- レジスター・POS機能
- 商品・在庫管理
- 顧客・取引管理
- 売上分析・設定
- 各種管理画面

#### packages/web-app/src/feature/ の完全構造 [30個のドメイン]
**ドメイン駆動設計によるコンポーネント分割**:
- 各ドメインに `hooks/` と `components/` サブディレクトリ
- ビジネスロジックとUIの分離
- 再利用可能なドメイン固有コンポーネント

### 🎯 超詳細配置の戦略的価値

**なぜ94個の細分化が重要か**:

1. **API理解の最適化**
   - 各エンドポイントの役割と依存関係の明確化
   - RESTful APIの設計パターン理解
   - 店舗別マルチテナント構造の把握

2. **UI構造の完全マッピング**
   - Next.js App Routerの活用パターン理解
   - 認証後の機能別ページ構造把握
   - ユーザージャーニーの可視化

3. **Feature-Driven開発の理解**
   - ドメイン駆動設計の実装パターン
   - hooks/componentsの分離戦略
   - ビジネスロジックの再利用性

4. **開発効率の大幅向上**
   - 各機能の責務と境界の明確化
   - 新機能開発時の既存コードの発見容易性
   - チーム間の知識共有促進

### 次のアクション推奨事項

**A. 段階的CLAUDE.md作成開始**
1. **最優先6個**から開始（基盤理解）
2. **高優先8個**で全体構造把握
3. **中優先42個**で詳細機能理解
4. **検討優先38個**で完全カバレッジ

**B. 優先度調整**
- 94個から重要度を再評価
- チームの開発優先度に応じてカスタマイズ
- 段階的配置戦略の策定

**C. 配置確定プロセス開始**
- タスク2「合意形成フェーズ」への移行
- ユーザーによる最終配置リストの承認

### 拡張分析結果（copilot, workers, functions, jobs）

#### copilot/ ディレクトリ [高重要度]
**AWS Copilot構成確定**:
- **コンテナサービス**: 11個のサービス定義
  - `pos-web-app/` - メインWebアプリ
  - `ec-web-app/` - EC専用Webアプリ  
  - `backend-outbox/` - アウトボックスパターン
  - 7つのワーカーサービス（transaction, product, item, etc.）
  - 2つのジョブサービス（daily-calculate, ensure-consistency）

- **環境構成**: 5環境
  - `staging/` - ステージング環境
  - `production/` - 本番環境
  - `customer/` - 顧客専用環境
  - `public/` - 公開環境
  - `addons/` - 共通アドオン（RDS, VPN等）

- **CI/CDパイプライン**: 3パイプライン
  - `staging/` - ステージング用
  - `production/` - 本番用
  - `customer/` - 顧客用

#### workers/ ディレクトリ [高重要度]  
**ワーカープロセス構成**:
- **用途**: 定期的な軽量タスク処理
- **構成**: 7つの専門ワーカー
  - `transaction/` - 取引処理
  - `product/` - 商品処理
  - `item/` - アイテム処理
  - `notification/` - 通知処理
  - `scheduled/` - スケジュール処理
  - `external-ec/` - 外部EC連携
  - `ec-order/` - EC注文処理

#### jobs/ ディレクトリ [中重要度]
**バックグラウンドジョブ構成**:
- **用途**: 重処理系バッチ処理
- **構成**: 2つのメインジョブ
  - `daily/` - 日次計算・集計処理
  - `ensure-consistency/` - データ整合性チェック

#### functions/ ディレクトリ [検討優先度]
**サーバーレス関数構成**:
- **用途**: Lambda等サーバーレス処理
- **構成**: 1つの関数
  - `email-webhook/` - メール用Webhook処理

### アーキテクチャパターン特定（拡張版）

**確認されたパターン**:
- **Monorepo**: pnpm workspace + Turbo
- **Microservices**: AWS Copilot + 11コンテナサービス
- **Clean Architecture**: packages/backend-core/src/services/
- **Feature-Driven**: packages/web-app/src/feature/
- **API-First**: OpenAPI生成 + Prisma schema-first
- **Event-Driven**: SQS + ワーカーパターン
- **Outbox Pattern**: backend-outbox サービス
- **Multi-Environment**: 5環境 + 3パイプライン

---

*このレポートは段階的に更新されます。次回の深掘り調査でさらに詳細な情報を追加予定。* 