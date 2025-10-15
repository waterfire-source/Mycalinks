# web-app/CLAUDE.md

## 🎯 目的・役割

MycaLinks POS システムのフロントエンドアプリケーション。Next.js 14 App Router を基盤とした、POS（店舗販売）とEC（オンライン販売）を統合的に管理する Web アプリケーション。小売店舗スタッフが日常的に使用する販売・在庫管理・顧客対応のインターフェースを提供する。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14.2.3 (App Router)
- **UIライブラリ**: Material-UI (MUI) v5
- **言語**: TypeScript v5.8.3
- **スタイリング**: Emotion (@emotion/react, @emotion/styled)
- **フォーム管理**: React Hook Form v7 + Zod
- **認証**: NextAuth v4
- **状態管理**: React Context API
- **HTTPクライアント**: Axios
- **テスト**: Vitest (統合テスト), Playwright (E2E)

## 📁 ディレクトリ構造

```
web-app/
├── src/
│   ├── app/                    # Next.js App Router ページ・API
│   │   ├── api/               # APIルート (BFF層)
│   │   ├── (auth)/           # 認証必須ページ群
│   │   ├── ec/               # ECサイト公開ページ
│   │   ├── guest/            # ゲスト用ページ
│   │   └── login/            # ログインページ
│   ├── feature/               # ドメイン別機能コンポーネント
│   ├── components/            # 共通UIコンポーネント
│   ├── contexts/              # React Context プロバイダー
│   ├── hooks/                 # カスタムフック
│   ├── api/                   # APIクライアント層
│   ├── utils/                 # ユーティリティ関数
│   ├── constants/             # 定数定義
│   └── types/                 # TypeScript型定義
├── public/                    # 静的アセット
├── tests/                     # テストファイル
└── uploaded/                  # アップロードファイル一時保存
```

## 🔧 主要機能

### POS機能 (店舗販売)
- **販売処理**: レジ画面、バーコードスキャン、決済処理
- **在庫管理**: 商品検索、在庫確認、棚卸し
- **買取査定**: 買取受付、査定、買取処理
- **顧客管理**: 顧客情報、ポイント管理、購入履歴
- **レシート印刷**: EPSON/Brother プリンター連携

### EC機能 (オンライン販売)
- **商品管理**: 商品登録、価格設定、在庫連動
- **注文管理**: 注文確認、ステータス管理、発送処理
- **外部EC連携**: おちゃのこネット連携
- **決済連携**: GMO Payment Gateway, Square

### 管理機能
- **店舗設定**: 店舗情報、スタッフ管理、権限設定
- **売上分析**: 日次・月次集計、商品別分析
- **マスタ管理**: カテゴリ、ジャンル、取引先

## 💡 使用パターン

### 開発環境起動
```bash
# 開発サーバー起動 (http://localhost:3020)
pnpm run dev

# ビルド & プロダクション起動
pnpm run build
pnpm run start
```

### 環境別ビルド
```bash
# ステージング
pnpm run staging:build

# 本番 (Myca店舗)
pnpm run build

# 一般公開
pnpm run public-prod:build

# 顧客環境
pnpm run customer-prod:build
```

### Feature-Driven Development
各機能は `/src/feature/` 配下にドメイン単位で分離：
- 独立したコンポーネント群
- ドメイン固有のフック・ユーティリティ
- 型定義・定数の局所化

## 🗺️ プロジェクト内での位置づけ

### レイヤードアーキテクチャ内での役割
```
[ユーザー] 
    ↓
[web-app] ← 現在地 (プレゼンテーション層)
    ↓
[API Routes (BFF)]
    ↓
[backend-core] (ビジネスロジック層)
    ↓
[Database/External Services]
```

### 依存関係
- **依存元**: エンドユーザー、モバイルアプリ
- **依存先**: `backend-core`, `api-generator`, `common`
- **外部連携**: 各種決済サービス、プリンターSDK

## 🔗 関連ディレクトリ

- [../backend-core/](../backend-core/) - バックエンドコア機能
- [../api-generator/](../api-generator/) - API定義・クライアント生成
- [../common/](../common/) - 共通ユーティリティ
- [./src/feature/](./src/feature/) - 各ドメイン機能実装

## 📚 ドキュメント・リソース

### 内部ドキュメント
- [./src/app/api/readme.md](./src/app/api/readme.md) - API Routes 設計指針
- [./src/components/README.md](./src/components/README.md) - UIコンポーネントガイド
- [./tests/e2e/README.md](./tests/e2e/README.md) - E2Eテストガイド

### 外部リソース
- [Next.js App Router](https://nextjs.org/docs/app) - 公式ドキュメント
- [Material-UI](https://mui.com/) - UIコンポーネントリファレンス
- [React Hook Form](https://react-hook-form.com/) - フォーム管理

## 📝 開発メモ

### パフォーマンス最適化
- Server Components の積極活用
- 動的インポートによるコード分割
- 画像最適化 (next/image)
- APIレスポンスのキャッシュ戦略

### セキュリティ考慮事項
- CORS設定による適切なアクセス制御
- 認証トークンの安全な管理 (httpOnly Cookie)
- CSRFトークンによる保護
- 入力値の厳格なバリデーション

### 開発時の注意点
- ESLint/Prettier による自動フォーマット
- 型安全性の徹底 (any禁止)
- コンポーネントの適切な分離
- エラーハンドリングの統一

### 将来の拡張計画
- PWA対応によるオフライン機能
- リアルタイム同期機能 (WebSocket)
- 多言語対応 (i18n)
- マイクロフロントエンド化の検討

---
*Documentation-Agent作成: 2025-01-24*