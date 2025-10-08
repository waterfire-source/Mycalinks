# EC Core Feature Detail - 商品詳細機能

## 目的
ECサイトの商品詳細表示に特化したフック・コンポーネントを提供

## 実装されている機能 (1個)

### hooks/ - 商品詳細フック
```
detail/hooks/
└── useEcProduct.ts (121行)
```

## 主要実装

### useEcProduct.ts (121行) - 商品詳細フック
```typescript
'use client';

import { useEcProduct } from '@/app/ec/(core)/hooks/useEcProduct';
import { CustomError } from '@/api/implement';
import type { EcAPI } from '@/api/frontend/ec/api';
import { ConditionOptionHandle } from '@prisma/client';
import { ORDER_KIND_VALUE } from '@/app/ec/(core)/constants/orderKind';
import { useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';

type FilterOptions = {
  cardConditions?: ConditionOptionHandle[];
  orderBy?: string;
};

type ProductResponse = Exclude<EcAPI['getEcProduct']['response'], CustomError>;

/**
 * 商品を並び替える
 * @param products - 商品の配列
 * @param orderBy - 並び替えの基準
 * @returns 並び替えられた商品の配列
 */
const sortProducts = (
  products: ProductResponse['products'],
  orderBy: string = ORDER_KIND_VALUE.PRICE_ASC,
) => {
  return [...products].sort((a, b) => {
    if (a.actual_ec_sell_price === null) return 1;
    if (b.actual_ec_sell_price === null) return -1;

    if (orderBy === ORDER_KIND_VALUE.PRICE_ASC) {
      return a.actual_ec_sell_price - b.actual_ec_sell_price;
    }
    if (orderBy === ORDER_KIND_VALUE.PRICE_DESC) {
      return b.actual_ec_sell_price - a.actual_ec_sell_price;
    }

    if (
      orderBy === ORDER_KIND_VALUE.CONDITION_ASC ||
      orderBy === ORDER_KIND_VALUE.CONDITION_DESC
    ) {
      const handleA = a.condition_option?.handle ?? '';
      const handleB = b.condition_option?.handle ?? '';
      return orderBy === ORDER_KIND_VALUE.CONDITION_ASC
        ? handleA.localeCompare(handleB)
        : handleB.localeCompare(handleA);
    }

    return a.actual_ec_sell_price - b.actual_ec_sell_price;
  });
};

/**
 * 商品詳細を取得し、フィルタリングと並び替えを適用するカスタムフック
 */
export const useEcProductDetail = () => {
  const { getEcProduct } = useEcProduct();
  const { setAlertState } = useAlert();

  /**
   * 商品詳細を取得し、フィルタリングと並び替えを適用する
   * @param mycaItemId - 商品ID
   * @param filterOptions - フィルタリングと並び替えのオプション
   * @returns フィルタリングと並び替えが適用された商品詳細情報
   */
  const getEcProductWithFilters = useCallback(
    async (
      mycaItemId: number,
      filterOptions?: FilterOptions,
    ): Promise<ProductResponse | null> => {
      try {
        const data = await getEcProduct(mycaItemId);

        if (!data) {
          return null;
        }

        const validProducts = data.products.filter(
          (product) =>
            product.ec_stock_number > 0 &&
            product.actual_ec_sell_price !== null &&
            product.condition_option !== null,
        );

        // フィルタリングオプションがない場合は並び替えのみ適用
        if (!filterOptions?.cardConditions?.length) {
          return {
            ...data,
            products: sortProducts(validProducts, filterOptions?.orderBy),
          };
        }

        // 商品データをフィルタリング
        const filteredProducts = validProducts.filter(
          (product) =>
            product.condition_option?.handle &&
            filterOptions.cardConditions?.includes(
              product.condition_option.handle,
            ),
        );

        return {
          ...data,
          products: sortProducts(filteredProducts, filterOptions?.orderBy),
        };
      } catch (error) {
        console.error('Failed to fetch and process product details:', error);
        setAlertState({
          message: '商品詳細の取得と処理に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [getEcProduct, setAlertState],
  );

  return { getEcProductWithFilters };
};
```

## 主要な技術実装

### 商品詳細フック (useEcProduct.ts - 121行)
- **フィルタリング**: 商品状態（コンディション）による絞り込み
- **ソート機能**: 価格昇順・降順、状態昇順・降順の並び替え
- **在庫フィルタ**: 在庫数・販売価格・状態オプションによる有効商品の絞り込み
- **エラーハンドリング**: 統一されたエラー処理とアラート表示

### ソート機能の実装
- **価格ソート**: 昇順・降順の価格並び替え
- **状態ソート**: 商品状態による並び替え（localeCompare使用）
- **null値処理**: 価格がnullの商品を適切に処理
- **デフォルト値**: 価格昇順をデフォルトソート

### フィルタリング機能
- **有効商品**: 在庫数 > 0、販売価格 !== null、状態オプション !== null
- **状態フィルタ**: 指定されたコンディション配列による絞り込み
- **柔軟な処理**: フィルタオプションがない場合はソートのみ適用

## 使用パターン

### 1. 基本的な商品詳細取得
```typescript
import { useEcProductDetail } from './hooks/useEcProduct';

const ProductDetailPage = () => {
  const { getEcProductWithFilters } = useEcProductDetail();

  const fetchProductDetail = async (itemId: number) => {
    const productData = await getEcProductWithFilters(itemId);
    if (productData) {
      setProducts(productData.products);
    }
  };

  return (
    // 商品詳細表示
  );
};
```

### 2. フィルタリング付き商品詳細取得
```typescript
import { useEcProductDetail } from './hooks/useEcProduct';
import { ConditionOptionHandle } from '@prisma/client';

const ProductDetailPage = () => {
  const { getEcProductWithFilters } = useEcProductDetail();

  const fetchFilteredProducts = async (itemId: number) => {
    const filterOptions = {
      cardConditions: ['A', 'B'] as ConditionOptionHandle[],
      orderBy: 'PRICE_ASC'
    };

    const productData = await getEcProductWithFilters(itemId, filterOptions);
    if (productData) {
      setProducts(productData.products);
    }
  };

  return (
    // フィルタリング付き商品詳細表示
  );
};
```

### 3. ソート機能付き商品詳細取得
```typescript
import { useEcProductDetail } from './hooks/useEcProduct';
import { ORDER_KIND_VALUE } from '@/app/ec/(core)/constants/orderKind';

const ProductDetailPage = () => {
  const { getEcProductWithFilters } = useEcProductDetail();

  const fetchSortedProducts = async (itemId: number, sortOrder: string) => {
    const filterOptions = {
      orderBy: sortOrder
    };

    const productData = await getEcProductWithFilters(itemId, filterOptions);
    if (productData) {
      setProducts(productData.products);
    }
  };

  return (
    // ソート機能付き商品詳細表示
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../../hooks/`: 共通フック（useEcProduct, useAlert）
- `../../constants/`: 定数（ORDER_KIND_VALUE）
- `/api/frontend/ec/`: API実装（EcAPI）
- `/contexts/`: アラートContext

## 開発ノート
- **単一責務**: 商品詳細に特化したフック
- **フィルタリング**: 柔軟なフィルタリング・ソート機能
- **エラーハンドリング**: 統一されたエラー処理
- **型安全性**: TypeScript による厳密な型定義
- **パフォーマンス**: useCallback による最適化
- **再利用性**: 複数の商品詳細ページで利用可能

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 