# packages/CLAUDE.md

## 🎯 目的・役割

MycaLinks POS システムのモノレポジトリにおけるコアパッケージを管理するワークスペースのルートディレクトリ。pnpm workspace を使用した効率的な依存関係管理と、各パッケージ間の相互連携を実現している。

## 🏗️ 技術構成

- **パッケージマネージャー**: pnpm v10.10.0
- **Node.js**: v23.9.0 (Voltaで管理)
- **ワークスペース管理**: pnpm workspace
- **ビルドツール**: Turbo
- **型システム**: TypeScript v5.8.3

## 📁 ディレクトリ構造

```
packages/
├── web-app/               # Next.js 14 フロントエンドアプリケーション
├── backend-core/          # 共通バックエンドロジック・データベース層
├── api-generator/         # OpenAPI定義からTypeScriptクライアント生成
└── common/                # 共通ユーティリティ・定数・型定義
```

## 🔧 主要機能

### 1. **web-app** - フロントエンドアプリケーション
- Next.js 14.2.3 (App Router) によるSSR/SSG対応
- Material-UI (MUI) によるコンポーネントライブラリ
- React Hook Form + Zod によるフォーム管理・バリデーション
- NextAuth による認証機能
- POS/EC統合インターフェース

### 2. **backend-core** - バックエンドコア機能
- Prisma ORM によるデータベース抽象化層
- MySQL データベーススキーマ管理
- Redis キャッシュ層
- イベント駆動型アーキテクチャ (AWS SQS)
- ビジネスロジック・サービス層

### 3. **api-generator** - API自動生成
- OpenAPI 3.0 仕様準拠
- TypeScriptクライアントコード自動生成
- 型安全なAPI呼び出し
- エンドポイント定義の一元管理

### 4. **common** - 共通ライブラリ
- 汎用ユーティリティ関数
- 共通定数・設定値
- 型定義・インターフェース
- バリデーションヘルパー

## 💡 使用パターン

### 開発フロー
```bash
# 1. 依存関係インストール
pnpm i

# 2. バックエンドコアビルド
pnpm run build:backend-core

# 3. API生成
pnpm run api:generate

# 4. 開発サーバー起動
pnpm run dev:web-app
```

### パッケージ間の依存関係
```
common (基礎層)
  ↑
backend-core (データ・ビジネスロジック層)
  ↑
api-generator (API定義層)
  ↑
web-app (プレゼンテーション層)
```

## 🗺️ プロジェクト内での位置づけ

このディレクトリは MycaLinks POS システムの中核となるパッケージ群を管理している：

- **上位層**: プロジェクトルート（ワークスペース設定）
- **同位層**: `/workers`, `/jobs`, `/backend-services`
- **管理対象**: フロントエンド、バックエンドコア、API定義、共通ライブラリ

各パッケージは独立したビルド・デプロイが可能でありながら、型定義やビジネスロジックを共有することで、一貫性のあるシステムを構築している。

## 🔗 関連ディレクトリ

- [../workers/](../workers/) - 非同期ジョブワーカー群
- [../jobs/](../jobs/) - 定期実行ジョブ
- [../backend-services/](../backend-services/) - マイクロサービス群
- [../copilot/](../copilot/) - AWS Copilot インフラ定義

## 📚 ドキュメント・リソース

- [web-app/CLAUDE.md](./web-app/CLAUDE.md) - フロントエンドアーキテクチャ詳細
- [backend-core/README.md](./backend-core/README.md) - バックエンドコア機能説明
- [api-generator/src/defs/README.md](./api-generator/src/defs/README.md) - API定義ガイド
- [common/README.md](./common/README.md) - 共通ライブラリ使用方法

## 📝 開発メモ

### ビルド順序の重要性
1. `common` → `backend-core` → `api-generator` → `web-app` の順でビルドが必要
2. Prisma生成は `backend-core` ビルド前に実行必須
3. API生成は型定義変更時に必ず実行

### パフォーマンス最適化
- Turbo によるビルドキャッシュ活用
- pnpm の効率的な依存関係管理
- 共通コードの適切な分離によるバンドルサイズ最適化

### 将来の拡張計画
- マイクロフロントエンドアーキテクチャへの移行検討
- GraphQL API層の追加
- 共通コンポーネントライブラリの独立パッケージ化

---
*Documentation-Agent作成: 2025-01-24*