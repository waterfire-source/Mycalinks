# EC Core Components Cards - カードコンポーネント

## 目的
ECサイトで使用される商品・ストア・サマリー表示用のカードコンポーネントを提供

## 実装されているコンポーネント (3個)

```
cards/
├── StoreCard.tsx (566行) - 最大規模
├── ProductCard.tsx (188行)
└── ProductSummaryCard.tsx (91行)
```

## 主要実装

### StoreCard.tsx (566行) - カート内ストアカード
```typescript
import {
  Box,
  Typography,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { DeleteButton } from '@/components/buttons/DeleteButton';
import { getConditionLabel } from '@/app/ec/(core)/utils/condition';
import { ConditionOptionHandle } from '@prisma/client';
import {
  ShopChangeModal,
  ShopChangeSelection,
} from '@/app/ec/(core)/components/modals/ShopChangeModal';
import { useState } from 'react';

// カート表示用の型（APIレスポンスより簡略化）
type CartStoreProduct = {
  product_id: number;
  total_unit_price: number;
  original_item_count: number;
  store_id?: number;
  product: {
    ec_stock_number: number;
    condition_option: {
      handle: ConditionOptionHandle | null;
    };
    mycaItem: {
      id: number;
      cardname: string | null;
      cardnumber: string | null;
      rarity: string | null;
      full_image_url: string | null;
    };
  };
};

export type CartStore = {
  store_id: number;
  store?: {
    display_name?: string | null;
  };
  products: CartStoreProduct[];
  total_price: number;
  shipping_fee: number;
  shipping_method_id: number | null;
  shippingMethodCandidates?: Array<{
    id: number;
    display_name: string;
    fee: number;
  }>;
};

/**
 * StoreCardの表示モード
 * - cart: カート画面用（数量変更可能）
 * - order: 注文確認画面用（数量表示のみ）
 */
type ViewMode = 'cart' | 'order';

// ショップ変更後のカート更新情報の型
export type ShopChangeUpdateInfo = {
  parentProductId: number; // 親商品ID
  parentStoreId: number; // 親ストアID
  parentRemainingCount: number; // 親商品の残り数量
  selections: ShopChangeSelection[]; // 選択した商品情報（価格情報を含む）
  shouldRemoveParent: boolean; // 親商品を削除するかどうか
};

type Props = {
  store: {
    store_id: number;
    store: {
      display_name: string | null;
    };
    total_price: number;
    shipping_method_id: number | null;
    shipping_fee: number;
    status: string;
    code: string;
    products: Array<{
      product_id: number;
      original_item_count: number;
      total_unit_price: number;
      product: {
        ec_stock_number: number;
        condition_option: {
          handle: ConditionOptionHandle | null;
        };
        item: {
          myca_item_id: number | null;
        };
        mycaItem: {
          id: number;
          cardname: string | null;
          cardnumber: string | null;
          rarity: string | null;
          full_image_url: string | null;
          expansion: string | null;
        };
      };
    }>;
    shippingMethodCandidates?: Array<{
      id: number;
      display_name: string;
      fee: number;
    }>;
  };
  storeIndex: number;
  totalStores: number;
  onStockChange: (productId: number, value: number) => void;
  onDelete: (productId: number) => void;
  onShopChange: (updateInfo: ShopChangeUpdateInfo) => void;
  onShippingMethodChange: (storeId: number, methodId: number) => void;
  viewMode?: ViewMode;
  // すべてのカートストア情報
  allCartStores?: Array<{
    store_id: number;
    products: Array<{
      product_id: number;
      original_item_count: number;
    }>;
  }>;
};

/**
 * カート内のストアカードコンポーネント
 * ストア情報、商品リスト、小計情報を表示する
 */
export const StoreCard = ({
  store,
  storeIndex,
  totalStores,
  onStockChange,
  onDelete,
  onShopChange,
  onShippingMethodChange,
  viewMode = 'cart',
  allCartStores = [],
}: Props) => {
  // ショップ変更モーダルの状態管理
  const [isShopChangeModalOpen, setIsShopChangeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<CartStoreProduct | null>(null);

  // ショップ変更モーダルを開く
  const handleOpenShopChangeModal = (product: CartStoreProduct) => {
    // store_idを設定
    product.store_id = store.store_id;
    setSelectedProduct(product);
    setIsShopChangeModalOpen(true);
  };

  // ショップ変更モーダルを閉じる
  const handleCloseShopChangeModal = () => {
    setIsShopChangeModalOpen(false);
    setSelectedProduct(null);
  };

  // ショップ変更の確定
  const handleConfirmShopChange = (selections: ShopChangeSelection[]) => {
    if (!selectedProduct) return;

    // 選択した商品の合計数量を計算
    const totalSelectedCount = selections.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    // 親商品の残り数量を計算
    const parentRemainingCount = Math.max(
      0,
      selectedProduct.original_item_count - totalSelectedCount,
    );

    // 親商品を削除するかどうか判定（選択数量が親の数量以上の場合）
    const shouldRemoveParent =
      totalSelectedCount >= selectedProduct.original_item_count;

    // ショップ変更情報を作成
    const updateInfo: ShopChangeUpdateInfo = {
      parentProductId: selectedProduct.product_id,
      parentStoreId: store.store_id,
      parentRemainingCount,
      selections,
      shouldRemoveParent,
    };

    // 親コンポーネントにショップ変更情報を渡す
    onShopChange(updateInfo);
    handleCloseShopChangeModal();
  };

  return (
    <div key={store.store_id}>
      {/* ストア情報ヘッダー */}
      <Box sx={{ /* スタイル定義 */ }}>
        <Typography variant="h6" fontWeight="bold">
          {store.store?.display_name || '店舗名なし'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {storeIndex + 1} / {totalStores} 店舗
        </Typography>
      </Box>

      {/* 商品リスト */}
      {store.products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={product}
          onStockChange={(value) => onStockChange(product.product_id, value)}
          onDelete={() => onDelete(product.product_id)}
          onShopChange={() => handleOpenShopChangeModal(product)}
          viewMode={viewMode}
        />
      ))}

      {/* 配送方法選択 */}
      {viewMode === 'cart' && store.shippingMethodCandidates && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            配送方法
          </Typography>
          <RadioGroup
            value={store.shipping_method_id || ''}
            onChange={(e) =>
              onShippingMethodChange(store.store_id, parseInt(e.target.value))
            }
          >
            {store.shippingMethodCandidates.map((method) => (
              <FormControlLabel
                key={method.id}
                value={method.id}
                control={<Radio />}
                label={`${method.display_name} - ${method.fee}円`}
              />
            ))}
          </RadioGroup>
        </Box>
      )}

      {/* 小計情報 */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2">
          商品小計: {store.total_price.toLocaleString()}円
        </Typography>
        <Typography variant="body2">
          送料: {store.shipping_fee.toLocaleString()}円
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          店舗合計: {(store.total_price + store.shipping_fee).toLocaleString()}円
        </Typography>
      </Box>

      {/* ショップ変更モーダル */}
      {selectedProduct && (
        <ShopChangeModal
          open={isShopChangeModalOpen}
          onClose={handleCloseShopChangeModal}
          product={selectedProduct}
          onConfirm={handleConfirmShopChange}
          allCartStores={allCartStores}
        />
      )}
    </div>
  );
};
```

### ProductCard.tsx (188行) - 商品カード
```typescript
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { Item_Category_Condition_Option } from '@prisma/client';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';
import { formatPrice } from '@/app/ec/(core)/utils/price';
import { getConditionLabel } from '@/app/ec/(core)/utils/condition';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { useState, useCallback } from 'react';
import { useAppAuth } from '@/providers/useAppAuth';

type Props = {
  product: {
    id: number;
    ec_stock_number: number;
    actual_ec_sell_price: number | null;
    store: {
      id: number;
      display_name: string | null;
      ec_setting: {
        same_day_limit_hour: number | null;
        shipping_days: number | null;
        free_shipping: boolean;
      };
    };
    condition_option: {
      handle: Item_Category_Condition_Option['handle'];
    };
  };
  hasTitle?: boolean;
  orderBy?: string;
  onAddToCartSuccess?: () => void;
  shippingAddressPrefecture?: string;
  itemCount?: number;
};

export const ProductCard = ({
  product,
  hasTitle = false,
  orderBy,
  onAddToCartSuccess,
  shippingAddressPrefecture,
  itemCount = 1,
}: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayPrice = product.actual_ec_sell_price ?? 0;
  const displayStoreName = product.store.display_name ?? '店舗名なし';
  const sameDayLimitHour = product.store.ec_setting.same_day_limit_hour ?? 15;

  // カート追加のカスタムフック
  const { addToCart } = useEcOrder();
  // ユーザー認証カスタムフック
  const { getUserId } = useAppAuth();
  // 追加中の状態管理
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // 選択された数量の状態管理
  const [selectedCount, setSelectedCount] = useState(itemCount);

  // カートに追加
  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      // カート追加時にリアルタイムでログイン状態を確認
      const currentUserId = await getUserId();
      const isLoggedIn = currentUserId !== null;

      // ログイン状態に応じて異なるパラメータでカート追加処理を実行
      const success = await addToCart({
        shippingAddressPrefecture,
        cartStores: [
          {
            storeId: product.store.id,
            products: [
              {
                productId: product.id,
                originalItemCount: selectedCount,
              },
            ],
          },
        ],
        isLoggedIn: isLoggedIn,
      });

      // 成功時のみコールバックを実行（エラー時はuseEcOrderがエラー表示を担当）
      if (success) {
        onAddToCartSuccess?.();
      }
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    product.id,
    product.store.id,
    isAddingToCart,
    addToCart,
    onAddToCartSuccess,
    shippingAddressPrefecture,
    selectedCount,
    getUserId,
  ]);

  return (
    <Card
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'grey.400',
        p: hasTitle ? 0 : 2,
        boxShadow: 'none',
      }}
    >
      <Stack direction="column" spacing={1}>
        {hasTitle && (
          <Typography
            variant="h4"
            color="white"
            fontWeight="bold"
            sx={{
              fontSize: '1rem !important',
              bgcolor: 'primary.main',
              textAlign: 'center',
              textBox: 'trim-both cap alphabetic',
              p: '12px',
            }}
          >
            {getConditionLabel(product.condition_option?.handle ?? null)}
            {orderBy ? ` ${orderBy}` : ''}
          </Typography>
        )}
        <Stack
          direction="column"
          spacing={1}
          sx={{ p: hasTitle ? 2 : 0, pt: hasTitle ? 0 : 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <ConditionTag value={product.condition_option?.handle ?? null} />
            <Typography
              fontWeight="bold"
              color="primary.main"
              sx={{ fontSize: '1.4rem !important' }}
            >
              {formatPrice(displayPrice)}円
            </Typography>
          </Stack>
          <Typography variant="h5">{displayStoreName}</Typography>
          <Typography variant="h5" color="grey.600">
            {sameDayLimitHour}時までの注文で即日発送
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            sx={{
              height: { xs: '40px', md: '50px' },
              justifyContent: { xs: 'flex-start', md: 'space-between' },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '30%' } }}>
              <StockSelect
                maxStock={product.ec_stock_number}
                value={selectedCount}
                onChange={(value) => setSelectedCount(value)}
              />
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              sx={{
                bgcolor: 'primary.main',
                py: 1.5,
                width: '100%',
                maxWidth: { xs: '100%', md: '30%' },
              }}
            >
              <Typography variant="h3" fontWeight="bold" color="white">
                {isAddingToCart ? '追加中...' : 'カートへ'}
              </Typography>
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};
```

### ProductSummaryCard.tsx (91行) - 商品サマリーカード
```typescript
import { formatPrice } from '@/app/ec/(core)/utils/price';
import { Box, Container, Stack, Typography } from '@mui/material';
import Image from 'next/image';

type Props = {
  product: {
    name: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    price: number | null;
  };
  isScrollHeader?: boolean;
  isVisible?: boolean;
};

export const ProductSummaryCard = ({
  product,
  isScrollHeader = false,
  isVisible = true,
}: Props) => {
  const { name, cardNumber, rarity, imageUrl, price } = product;

  const scrollHeaderStyle = isScrollHeader
    ? {
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: 'white',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }
    : {};

  const Content = () => (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1,
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '60px',
          height: '60px',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Stack sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight="bold">
          {name}
        </Typography>
        <Typography>
          {cardNumber} {rarity}
        </Typography>
        {price !== null && (
          <Typography color="primary.main" fontWeight="bold">
            {formatPrice(price)}円
          </Typography>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={scrollHeaderStyle}>
      {isScrollHeader ? (
        <Container maxWidth="md">
          <Content />
        </Container>
      ) : (
        <Content />
      )}
    </Box>
  );
};
```

## 主要な技術実装

### 複雑なカート管理 (StoreCard.tsx - 566行)
- **ストア単位管理**: カート内の店舗別商品グループ化
- **ショップ変更**: 商品の店舗間移動機能
- **配送方法選択**: 店舗ごとの配送方法とコスト計算
- **表示モード**: カート編集・注文確認の2つのモード

### 商品カード機能 (ProductCard.tsx - 188行)
- **リアルタイム認証**: カート追加時のログイン状態確認
- **在庫管理**: StockSelect による在庫数量選択
- **価格表示**: formatPrice による価格フォーマット
- **即日発送**: 店舗設定による発送時間表示

### サマリーカード機能 (ProductSummaryCard.tsx - 91行)
- **スクロールヘッダー**: 固定表示・アニメーション対応
- **画像最適化**: Next.js Image による画像最適化
- **レスポンシブ**: Container による幅制御
- **条件表示**: 価格の null チェック

### 型定義の充実
- **CartStoreProduct**: カート内商品の詳細型定義
- **CartStore**: ストア情報・商品リスト・配送情報の統合型
- **ShopChangeUpdateInfo**: ショップ変更時の更新情報型
- **ViewMode**: 表示モードの型安全性

## 使用パターン

### 1. カート画面でのストアカード
```typescript
import { StoreCard } from './cards/StoreCard';

const CartPage = () => {
  const [cartStores, setCartStores] = useState<CartStore[]>([]);

  const handleStockChange = (productId: number, value: number) => {
    // 在庫数量変更処理
    setCartStores(prev => 
      prev.map(store => ({
        ...store,
        products: store.products.map(product =>
          product.product_id === productId
            ? { ...product, original_item_count: value }
            : product
        )
      }))
    );
  };

  const handleDelete = (productId: number) => {
    // 商品削除処理
    setCartStores(prev =>
      prev.map(store => ({
        ...store,
        products: store.products.filter(product => product.product_id !== productId)
      })).filter(store => store.products.length > 0)
    );
  };

  const handleShopChange = (updateInfo: ShopChangeUpdateInfo) => {
    // ショップ変更処理
    console.log('Shop change:', updateInfo);
  };

  const handleShippingMethodChange = (storeId: number, methodId: number) => {
    // 配送方法変更処理
    setCartStores(prev =>
      prev.map(store =>
        store.store_id === storeId
          ? { ...store, shipping_method_id: methodId }
          : store
      )
    );
  };

  return (
    <div>
      {cartStores.map((store, index) => (
        <StoreCard
          key={store.store_id}
          store={store}
          storeIndex={index}
          totalStores={cartStores.length}
          onStockChange={handleStockChange}
          onDelete={handleDelete}
          onShopChange={handleShopChange}
          onShippingMethodChange={handleShippingMethodChange}
          viewMode="cart"
          allCartStores={cartStores}
        />
      ))}
    </div>
  );
};
```

### 2. 商品一覧での商品カード
```typescript
import { ProductCard } from './cards/ProductCard';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [shippingPrefecture, setShippingPrefecture] = useState('東京都');

  const handleAddToCartSuccess = () => {
    // カート追加成功時の処理
    console.log('商品をカートに追加しました');
  };

  return (
    <div>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          hasTitle={true}
          orderBy="価格順"
          onAddToCartSuccess={handleAddToCartSuccess}
          shippingAddressPrefecture={shippingPrefecture}
          itemCount={1}
        />
      ))}
    </div>
  );
};
```

### 3. 商品詳細でのサマリーカード
```typescript
import { ProductSummaryCard } from './cards/ProductSummaryCard';

const ProductDetailPage = () => {
  const [isScrollHeaderVisible, setIsScrollHeaderVisible] = useState(false);
  const product = {
    name: 'ピカチュウ',
    cardNumber: 'XY-P',
    rarity: 'プロモ',
    imageUrl: '/images/cards/pikachu.jpg',
    price: 1500,
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollHeaderVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* 通常のサマリーカード */}
      <ProductSummaryCard product={product} />
      
      {/* スクロール時の固定ヘッダー */}
      <ProductSummaryCard
        product={product}
        isScrollHeader={true}
        isVisible={isScrollHeaderVisible}
      />
      
      {/* 商品詳細内容 */}
      <div style={{ height: '2000px' }}>
        商品詳細...
      </div>
    </div>
  );
};
```

### 4. 注文確認画面での読み取り専用表示
```typescript
import { StoreCard } from './cards/StoreCard';

const OrderConfirmationPage = () => {
  const [orderStores, setOrderStores] = useState<CartStore[]>([]);

  return (
    <div>
      <h2>注文内容確認</h2>
      {orderStores.map((store, index) => (
        <StoreCard
          key={store.store_id}
          store={store}
          storeIndex={index}
          totalStores={orderStores.length}
          onStockChange={() => {}} // 読み取り専用
          onDelete={() => {}} // 読み取り専用
          onShopChange={() => {}} // 読み取り専用
          onShippingMethodChange={() => {}} // 読み取り専用
          viewMode="order" // 注文確認モード
        />
      ))}
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../hooks/`: カスタムフック（useEcOrder）
- `../../utils/`: ユーティリティ（price, condition）
- `../selects/`: セレクトコンポーネント（StockSelect）
- `../tags/`: タグコンポーネント（ConditionTag）
- `../modals/`: モーダルコンポーネント（ShopChangeModal）
- `/components/buttons/`: 共通ボタンコンポーネント（DeleteButton）
- `/providers/`: 認証プロバイダー（useAppAuth）

## 開発ノート
- **複雑な状態管理**: カート・ストア・商品の多層状態管理
- **型安全性**: TypeScript による厳密な型定義
- **パフォーマンス**: useCallback による再レンダリング最適化
- **UX**: 直感的な操作・リアルタイム反映・ローディング状態
- **レスポンシブ**: モバイル・デスクトップ対応のレイアウト
- **拡張性**: ViewMode による表示切り替え・柔軟な Props 設計

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 