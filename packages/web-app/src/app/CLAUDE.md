# app/CLAUDE.md

## 🎯 目的・役割

Next.js 14 App Routerベースのアプリケーションルーティングとページ構成を管理。POS業務、ECサイト、MycaLinksサービス、認証フローを統合的にルーティングし、マルチプラットフォーム対応のWebアプリケーションを実現する。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14.2.3 (App Router)
- **ルーティング**: ファイルベースルーティング、Dynamic Routes、Route Groups
- **認証**: NextAuth.js v4 セッション管理
- **レイアウト**: Nested Layouts、共通レイアウトコンポーネント
- **API**: Route Handlers (RESTful API)
- **スタイリング**: CSS Modules、Global CSS
- **依存関係**: `next`, `next-auth`, React 18

## 📁 ディレクトリ構造

```
app/
├── api/                      # API Route Handlers
│   ├── auth/                 # NextAuth認証API
│   ├── store/[store_id]/     # 店舗別APIエンドポイント
│   ├── account/              # アカウント管理API
│   ├── contract/             # 契約・決済API
│   ├── corporation/          # 企業管理API
│   ├── ec/                   # ECサイトAPI
│   └── system/               # システム管理API
├── auth/                     # 認証後POS業務画面
│   ├── (dashboard)/          # メインダッシュボード
│   └── setup/                # 初期設定フロー
├── ec/                       # ECサイト（一般顧客向け）
│   ├── (core)/               # EC機能コンポーネント
│   └── (auth)/               # EC認証エリア
├── mycalinks/                # MycaLinksサービス
│   ├── (auth)/               # 査定・会員機能
│   └── (core)/               # サービス基盤
├── guest/[storeId]/          # ゲスト向け機能
├── login/                    # ログイン・認証
├── register/                 # 新規登録
└── error/                    # エラーページ
```

## 🔧 主要機能

### ルーティング戦略
- **Route Groups**: `(dashboard)`, `(auth)`, `(core)` で機能分離
- **Dynamic Routes**: `[store_id]`, `[item_id]` で動的ページ
- **Nested Layouts**: 各セクション固有のレイアウト適用
- **Parallel Routes**: 複数コンテンツ同時表示

### 認証・セッション管理
- NextAuth.js セッションベース認証
- 店舗・企業別アクセス制御
- ロール・権限ベース画面表示制御
- SSR対応セッション状態管理

### API設計
- RESTful API エンドポイント
- 店舗別データ分離 (`/api/store/[store_id]/`)
- OpenAPI仕様準拠
- エラーハンドリング統一

### レスポンシブ対応
- モバイル・タブレット・デスクトップ対応
- デバイス別レイアウト切り替え
- PWA対応（Service Worker、Cache API）

## 💡 使用パターン

### ページコンポーネント
```typescript
// app/auth/(dashboard)/item/page.tsx
export default async function ItemPage({
  params,
  searchParams,
}: {
  params: { store_id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <ItemManagementContent />
}
```

### API Route Handler
```typescript
// app/api/store/[store_id]/item/route.ts
export async function GET(
  request: Request,
  { params }: { params: { store_id: string } }
) {
  // 店舗別商品データ取得
}
```

### レイアウト継承
```typescript
// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SideBar />
      <main>{children}</main>
    </AuthProvider>
  )
}
```

## 🔗 関連ディレクトリ

- [../components/](../components/) - 再利用可能UIコンポーネント
- [../feature/](../feature/) - 業務ドメイン別コンポーネント
- [../hooks/](../hooks/) - カスタムフック
- [../api/](../api/) - API型定義・クライアント
- [../contexts/](../contexts/) - React Context
- [../providers/](../providers/) - アプリケーションプロバイダー

## 📝 開発メモ

### App Router移行のポイント
- `pages`ディレクトリから`app`ディレクトリへの移行完了
- Server Components がデフォルト、Client Components は明示的に指定
- `layout.tsx` でメタデータ・共通レイアウト管理
- `loading.tsx`, `error.tsx` でローディング・エラー状態管理

### パフォーマンス最適化
- Server Components でサーバーサイドレンダリング
- Dynamic Import で必要時ローディング
- Image Optimization（next/image）
- Route Level Code Splitting

### セキュリティ考慮
- CSRFトークン検証
- 店舗・企業別データアクセス制御
- SQLインジェクション対策（Prisma ORM）
- XSS対策（React自動エスケープ）

### 開発時の注意点
- Route Groups `()` は URL に含まれない
- `metadata` は Server Components でのみ使用可能
- 動的ルートの型安全性確保
- SEO対応（メタタグ、構造化データ）

---
*Frontend-Agent作成: 2025-01-13*