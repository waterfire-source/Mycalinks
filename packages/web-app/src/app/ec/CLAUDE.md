# EC Mall - お客さん向けECサイト

## プロジェクト概要
Mycalinks Mall は、トレーディングカードゲーム専門のECサイトです。顧客が商品を閲覧・購入し、注文管理やアカウント管理を行うことができるオンラインマーケットプレイスです。

## アーキテクチャサマリー
- **Next.js App Router**: モダンなフルスタック React アプリケーション
- **Server Components**: サーバーサイドレンダリングによる高速な初期表示
- **Client Components**: インタラクティブなユーザーインターフェース
- **レスポンシブデザイン**: Material-UI による統一されたデザインシステム
- **グループルーティング**: `(core)` と `(auth)` によるルーティング構造

## 技術スタック
- **フロントエンド**: Next.js 14, React 18, TypeScript
- **UI ライブラリ**: Material-UI (MUI)
- **状態管理**: React Hooks, Context API
- **認証**: NextAuth.js
- **日付処理**: dayjs
- **バックエンド連携**: backend-core パッケージ

## 開発ワークフロー
1. **商品閲覧**: ジャンル別商品一覧 → 商品詳細
2. **カート機能**: 商品追加 → カート確認 → 注文
3. **アカウント管理**: 新規登録 → ログイン → プロフィール編集
4. **注文管理**: 注文履歴 → 注文詳細 → 問い合わせ

## ディレクトリ構造
```
packages/web-app/src/app/ec/
├── page.tsx                    # ECサイトトップページ（35行）
├── layout.tsx                  # ECサイト共通レイアウト（34行）
├── test_check_sheet.yaml       # テストチェックシート（442行）
├── login/                      # ログイン機能
├── items/                      # 商品関連
│   ├── [id]/                  # 商品詳細
│   └── genre/                 # ジャンル別商品
├── cart/                       # ショッピングカート
├── account/                    # アカウント管理
│   ├── edit/                  # アカウント編集
│   └── signup/                # 新規登録
├── forget-password/            # パスワード忘れ
├── deck/                       # デッキ機能
├── (core)/                     # コア機能
│   ├── components/            # 共通コンポーネント
│   ├── constants/             # 定数定義
│   ├── contexts/              # React Context
│   ├── hooks/                 # カスタムフック
│   ├── utils/                 # ユーティリティ
│   └── feature/               # 機能別コンポーネント
└── (auth)/                     # 認証機能
    ├── addresses/             # 住所管理
    ├── message-center/        # メッセージセンター
    ├── order/                 # 注文管理
    └── payment-method/        # 支払い方法
```

## 実装されている機能

### トップページ (page.tsx - 35行)
```typescript
export default async function ECPage() {
  const genreResult = await getEcGenre();
  const bannerResult = await getEcBanner();
  
  return (
    <Container maxWidth="md" disableGutters>
      <MallContent
        genreCards={genreList}
        carouselItems={carouselItems}
        banners={banners}
      />
    </Container>
  );
}
```

### レイアウト (layout.tsx - 34行)
```typescript
export const metadata: Metadata = {
  title: 'EC Mall | マイカリンクス',
  description: 'Trading card game marketplace',
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ECLayout>
      <Suspense fallback={<CircularProgress />}>
        {children}
      </Suspense>
    </ECLayout>
  );
}
```

### メインコンテンツ (MallContent.tsx - 74行)
```typescript
export const MallContent = ({ genreCards, carouselItems, banners }: MallContentProps) => {
  const router = useRouter();
  
  return (
    <>
      <CarouselBanner items={carouselItems} />
      <Box sx={{ bgcolor: '#d32f2f', color: 'white', py: 1.5, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold">
          Mycalinks Mall
        </Typography>
      </Box>
      
      <Grid container spacing={1.5} sx={{ px: 1.5 }}>
        {genreCards.map((card) => (
          <Grid item xs={6} key={card.id}>
            <GenreCard
              title={card.display_name}
              image={card.single_genre_image}
              onClick={() => router.push(`${PATH.ITEMS.genre(card.id.toString())}?hasStock=true`)}
            />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        {banners.map((banner, index) => (
          <BottomBanner key={index} image={banner.image_url} />
        ))}
      </Box>
    </>
  );
};
```

## 主要コンポーネント

### CarouselBanner (71行)
- **カルーセル表示**: トップページのメインバナー
- **自動スライド**: 複数バナーの自動切り替え

### GenreCard (87行)
- **ジャンル表示**: ジャンル別商品への導線
- **画像表示**: ジャンル画像とタイトル
- **クリック遷移**: ジャンル別商品一覧への遷移

### BottomBanner (79行)
- **下部バナー**: 追加プロモーション表示
- **クリック処理**: バナークリック時の処理

### ErrorHandler (19行)
- **エラー表示**: API エラーの統一表示
- **エラー処理**: 複数エラーの同時表示対応

## パス定義 (constants/paths.ts)
```typescript
export const PATH = {
  TOP: '/ec',
  ITEMS: {
    root: '/ec/items',
    genre: (genre: string) => `/ec/items/genre/${genre}`,
    detail: (itemId: number) => `/ec/items/${itemId}`,
  },
  LOGIN: '/ec/login',
  CART: '/ec/cart',
  ORDER: {
    root: '/ec/order',
    result: (orderId: string) => `/ec/order/result/${orderId}`,
    history: { root: '/ec/order/history' },
  },
  ACCOUNT: {
    edit: '/ec/account/edit',
    signup: '/ec/account/signup',
  },
};
```

## モールデータ (constants/mallData.ts)
```typescript
// 16種類のトレーディングカードジャンル
export const genreCards = [
  { id: 1, title: 'ポケモンカードゲーム', image: '/sample.png' },
  { id: 2, title: '遊戯王', image: '/sample.png' },
  { id: 3, title: 'デュエルマスターズ', image: '/sample.png' },
  // ... 他13種類
];

// カルーセルバナー
export const carouselItems = [
  { id: 1, image: '/sample.png', title: '短期納品！ゲーム風バナー' },
  { id: 2, image: '/images/ec/vs_new_banner.png', title: '短期納品！ゲーム風バナー' },
  { id: 3, image: '/images/dangerous_icon.png', title: '短期納品！ゲーム風バナー' },
];
```

## 共通コマンド
```bash
# 開発サーバー起動
npm run dev

# ECサイトアクセス
http://localhost:3000/ec

# テスト実行
npm run test

# ビルド
npm run build
```

## 使用パターン
1. **商品閲覧**: トップページ → ジャンル選択 → 商品一覧 → 商品詳細
2. **商品購入**: 商品詳細 → カート追加 → カート確認 → 注文
3. **アカウント**: 新規登録 → ログイン → プロフィール編集
4. **注文管理**: 注文履歴 → 注文詳細 → 問い合わせ

## 重要ファイル
- `page.tsx`: ECサイトトップページ
- `layout.tsx`: ECサイト共通レイアウト
- `(core)/components/MallContent.tsx`: メインコンテンツ
- `(core)/constants/paths.ts`: パス定義
- `(core)/constants/mallData.ts`: モールデータ

## トラブルシューティング
- **画像が表示されない**: `/public/` 配下の画像パスを確認
- **ジャンル表示エラー**: `getEcGenre()` の API 接続を確認
- **バナー表示エラー**: `getEcBanner()` の API 接続を確認
- **レイアウト崩れ**: Material-UI のテーマ設定を確認

## 関連ディレクトリ
- `../auth/(dashboard)/ec/`: 店舗側EC管理
- `(core)/`: ECサイトコア機能
- `(auth)/`: 認証が必要な機能
- `/feature/ec/`: EC関連機能
- `/backend-core/`: バックエンド連携

## 開発メモ
- **Server Components**: 初期表示の高速化
- **レスポンシブ**: モバイルファーストデザイン
- **SEO対応**: メタデータとサーバーサイドレンダリング
- **エラーハンドリング**: 統一されたエラー表示
- **型安全性**: TypeScript による型定義

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 