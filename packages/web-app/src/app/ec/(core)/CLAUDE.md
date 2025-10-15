# EC Core - ECサイトコア機能

## 目的
ECサイトの共通機能・コンポーネント・定数・ユーティリティを提供するコアモジュール

## 内容概要
```
(core)/
├── components/             # 共通UIコンポーネント
├── constants/              # 定数定義
├── contexts/               # React Context
├── hooks/                  # カスタムフック
├── utils/                  # ユーティリティ
└── feature/                # 機能別コンポーネント
```

## 重要ファイル

### 定数定義 (constants/)
- **paths.ts (47行)**: ECサイト全体のパス定義
- **mallData.ts (66行)**: モールデータ（ジャンル・バナー）
- **orderStatus.ts (71行)**: 注文ステータス定義
- **paymentMethod.ts (34行)**: 支払い方法定義
- **condition.ts (38行)**: 商品状態定義

### パス定義 (constants/paths.ts)
```typescript
export const BASE_PATH = '/ec';
export const PATH = {
  TOP: BASE_PATH,
  ITEMS: {
    root: `${BASE_PATH}/items`,
    genre: (genre: string) => `${BASE_PATH}/items/genre/${genre}`,
    detail: (itemId: number) => `${BASE_PATH}/items/${itemId}`,
  },
  LOGIN: `${BASE_PATH}/login`,
  CART: `${BASE_PATH}/cart`,
  ORDER: {
    root: `${BASE_PATH}/order`,
    result: (orderId: string) => `${BASE_PATH}/order/result/${orderId}`,
    history: {
      root: `${BASE_PATH}/order/history`,
      detail: (orderId: string) => `${BASE_PATH}/order/history/${orderId}`,
    },
    contact: (orderId: string) => `${BASE_PATH}/order/contact/${orderId}`,
  },
  ACCOUNT: {
    edit: `${BASE_PATH}/account/edit`,
    signup: `${BASE_PATH}/account/signup`,
  },
  FORGET_PASSWORD: {
    root: `${BASE_PATH}/forget-password`,
    signIn: `${BASE_PATH}/forget-password/sign-in`,
    changePassword: `${BASE_PATH}/forget-password/change-password`,
  },
};

// EC関連の外部リンク
export const EC_EXTERNAL_PATH = {
  specialCommercialLaw: 'https://mycalinks-mall.com/scl/',
};
```

### モールデータ (constants/mallData.ts)
```typescript
// 16種類のトレーディングカードジャンル
export const genreCards = [
  { id: 1, title: 'ポケモンカードゲーム', image: '/sample.png' },
  { id: 2, title: '遊戯王', image: '/sample.png' },
  { id: 3, title: 'デュエルマスターズ', image: '/sample.png' },
  { id: 4, title: 'ヴァイスシュバルツ', image: '/sample.png' },
  { id: 5, title: 'ワンピースカードゲーム', image: '/sample.png' },
  { id: 6, title: 'デジモンカードゲーム', image: '/sample.png' },
  { id: 7, title: 'ヴァンガード', image: '/sample.png' },
  { id: 8, title: 'シャドウバースエボルブ', image: '/sample.png' },
  { id: 9, title: 'RUSHデュエル', image: '/sample.png' },
  { id: 10, title: 'バトルスピリッツ', image: '/sample.png' },
  { id: 11, title: '名探偵コナンカードゲーム', image: '/sample.png' },
  { id: 12, title: 'ユニオンアリーナ', image: '/sample.png' },
  { id: 13, title: 'プロ野球ドリームオーダー', image: '/sample.png' },
  { id: 14, title: 'ヴァイスシュバルツブロウ', image: '/sample.png' },
  { id: 15, title: 'Z/X', image: '/sample.png' },
  { id: 16, title: 'ドラゴンボール超カードゲーム', image: '/sample.png' },
];

// カルーセルバナー（3つ）
export const carouselItems = [
  {
    id: 1,
    image: '/sample.png',
    title: '短期納品！ゲーム風バナー',
    description: '第1回の文無制限',
  },
  {
    id: 2,
    image: '/images/ec/vs_new_banner.png',
    title: '短期納品！ゲーム風バナー',
    description: '第2回の文無制限',
  },
  {
    id: 3,
    image: '/images/dangerous_icon.png',
    title: '短期納品！ゲーム風バナー',
    description: '第3回の文無制限',
  },
];

// ボトムバナー（4つ）
export const bottomBannerItems = [
  {
    id: 1,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 2,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 3,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 4,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
];
```

### 主要コンポーネント (components/)

#### MallContent.tsx (74行)
```typescript
export const MallContent = ({
  genreCards,
  carouselItems,
  banners,
}: MallContentProps) => {
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
              onClick={() =>
                router.push(
                  `${PATH.ITEMS.genre(card.id.toString())}?hasStock=true`,
                )
              }
            />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        {banners.map((banner, index) => (
          <BottomBanner
            key={index}
            image={banner.image_url}
            onClick={() => console.log(`Banner clicked: ${banner.url}`)}
          />
        ))}
      </Box>
    </>
  );
};
```

#### GenreCard.tsx (87行)
- **ジャンル表示**: ジャンル画像とタイトル
- **クリック処理**: ジャンル別商品一覧への遷移
- **レスポンシブ**: Grid システムで2列表示

#### CarouselBanner.tsx (71行)
- **カルーセル表示**: 複数バナーの自動スライド
- **画像表示**: バナー画像とタイトル・説明
- **ナビゲーション**: スライドナビゲーション

#### BottomBanner.tsx (79行)
- **下部バナー**: 追加プロモーション表示
- **クリック処理**: バナークリック時の処理
- **レスポンシブ**: フルワイドバナー

#### DetailContent.tsx (335行)
- **商品詳細**: 商品詳細情報の表示
- **高機能**: 335行の大型コンポーネント
- **複雑な表示**: 商品情報の詳細表示

#### ErrorHandler.tsx (19行)
```typescript
export const ErrorHandler = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;
  
  return (
    <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
      {errors.map((error, index) => (
        <Typography key={index} variant="body2">
          {error}
        </Typography>
      ))}
    </Box>
  );
};
```

## 使用パターン
1. **パス生成**: `PATH.ITEMS.genre(genreId)` でジャンル別商品一覧へ
2. **ジャンル表示**: `genreCards` からジャンル一覧を生成
3. **バナー表示**: `carouselItems` からカルーセルバナーを生成
4. **エラー処理**: `ErrorHandler` で統一されたエラー表示

## 開発メモ
- **定数管理**: 全てのパスと設定値を一元管理
- **コンポーネント**: 再利用可能なUIコンポーネント
- **型安全性**: TypeScript による型定義
- **レスポンシブ**: Material-UI Grid システム活用
- **SEO対応**: 適切なメタデータとセマンティクス

## 関連ディレクトリ
- `../`: ECサイトメインディレクトリ
- `components/`: 共通UIコンポーネント
- `constants/`: 定数定義
- `contexts/`: React Context
- `hooks/`: カスタムフック
- `utils/`: ユーティリティ
- `feature/`: 機能別コンポーネント

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 