# EC Core Hooks - ECサイトカスタムフック

## 目的
ECサイト全体で使用されるカスタムフック群を提供し、API呼び出し・状態管理・データ変換を統一

## 実装されているフック (14個)

### 1. useEcOrder.ts (318行) - 最大規模
```typescript
export const useEcOrder = () => {
  const { setAlertState } = useAlert();
  const { getUserId } = useAppAuth();
  const { refreshCart } = useCart();

  /**
   * カートの中身を取得する
   */
  const getCartContents = useCallback(
    async (code?: string): Promise<EcOrderData | null> => {
      try {
        const userId = await getUserId();
        const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY);
        
        // ログイン済み&ローカルストレージにカートコードがある場合
        if (userId && storageOrderCode) {
          const userOrders = await ecImplement().getEcOrder({
            code: storageOrderCode,
          }, true);
          
          // オーダーがユーザに紐づけられていない可能性がある場合は紐づけをおこなう
          if (!(userOrders instanceof CustomError) && userOrders.orders.length > 0) {
            const response = await ecImplement().createOrUpdateEcOrder({
              body: {
                cartStores: userOrders.orders[0].cart_stores.map((store) => ({
                  storeId: store.store_id,
                  shippingMethodId: store.shipping_method_id ?? undefined,
                  products: store.products.map((product) => ({
                    productId: product.product_id,
                    originalItemCount: product.original_item_count,
                  })),
                })),
              },
            });
            
            if (!(response instanceof CustomError) && response.cart_stores.length > 0) {
              localStorage.removeItem(EC_ORDER_CODE_KEY);
            }
          }
        }
        
        const orderCode = !userId ? storageOrderCode || undefined : undefined;
        if (!userId && !storageOrderCode) return null;

        const response = await ecImplement().getEcOrder({
          code: code || orderCode,
        });
        
        if (response instanceof CustomError) {
          setAlertState({
            message: 'カートの取得に失敗しました',
            severity: 'error',
          });
          return null;
        }
        
        return response;
      } catch (error) {
        setAlertState({
          message: 'カートの取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [getUserId, setAlertState],
  );

  /**
   * カートに商品を追加する
   */
  const addToCart = useCallback(
    async (params: AddToCartParams) => {
      try {
        const existingCart = await getCartContents();
        const existingCode = params.isLoggedIn
          ? undefined
          : localStorage.getItem(EC_ORDER_CODE_KEY);

        // 既存のカートと新しい商品をマージ
        const mergedCartStores = [...params.cartStores];
        if (existingCart?.orders) {
          const draftOrders = existingCart.orders.filter(
            (order) => order.status === 'DRAFT',
          );
          const latestDraftOrder = draftOrders.length > 0
            ? draftOrders.reduce(
                (latest, current) =>
                  current.id > latest.id ? current : latest,
                draftOrders[0],
              )
            : null;
            
          if (latestDraftOrder?.cart_stores) {
            const existingStores = latestDraftOrder.cart_stores.map(
              convertApiCartStoreToAppFormat,
            );
            
            existingStores.forEach((existingStore) => {
              const storeIndex = mergedCartStores.findIndex(
                (store) => store.storeId === existingStore.storeId,
              );

              if (storeIndex === -1) {
                mergedCartStores.push(existingStore);
              } else {
                const store = mergedCartStores[storeIndex];
                existingStore.products.forEach((existingProduct) => {
                  const productIndex = store.products.findIndex(
                    (product) => product.productId === existingProduct.productId,
                  );

                  if (productIndex === -1) {
                    store.products.push(existingProduct);
                  } else {
                    store.products[productIndex].originalItemCount +=
                      existingProduct.originalItemCount;
                  }
                });
              }
            });
          }
        }

        // API呼び出し
        const response = await ecImplement().createOrUpdateEcOrder({
          body: {
            cartStores: mergedCartStores.map((store) => ({
              storeId: store.storeId,
              shippingMethodId: store.shippingMethodId,
              products: store.products.map((product) => ({
                productId: product.productId,
                originalItemCount: product.originalItemCount,
              })),
            })),
          },
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: 'カートへの追加に失敗しました',
            severity: 'error',
          });
          return false;
        }

        // 在庫不足商品の処理
        if (response.insufficientProducts && response.insufficientProducts.length > 0) {
          saveInsufficientProducts(response.insufficientProducts);
        }

        // 非ログイン状態の場合はローカルストレージに保存
        if (!params.isLoggedIn && response.order_code) {
          localStorage.setItem(EC_ORDER_CODE_KEY, response.order_code);
        }

        refreshCart();
        return true;
      } catch (error) {
        setAlertState({
          message: 'カートへの追加に失敗しました',
          severity: 'error',
        });
        return false;
      }
    },
    [getCartContents, setAlertState, refreshCart],
  );

  return {
    getCartContents,
    addToCart,
    // その他のメソッド...
  };
};
```

### 2. useEcItem.ts (125行) - 商品データ管理
```typescript
export const useEcItem = () => {
  const getEcItem = async (
    request: EcAPI['getEcItem']['request'],
  ): Promise<EcItem[] | null> => {
    const clientAPI = createClientAPI();

    try {
      const res = await clientAPI.ec.getEcItem(request);
      if (res instanceof CustomError) {
        return null;
      }
      
      // 最も状態が良く、最も安価な商品が"topPosProduct"に選択されるように処理
      const items = res.items.map((item) => {
        const ecItem = {
          id: item.id,
          cardGenre: item.cardgenre,
          genreId: item.genre_id,
          cardName: item.cardname,
          displayNameWithMeta: item.displayNameWithMeta,
          cardNumber: item.cardnumber,
          cardSeries: item.cardseries,
          type: item.type,
          displayType1: item.displaytype1,
          displayType2: item.displaytype2,
          expansion: item.expansion,
          packItemCount: item.pack_item_count,
          boxPackCount: item.box_pack_count,
          rarity: item.rarity,
          option1: item.option1,
          option2: item.option2,
          option3: item.option3,
          option4: item.option4,
          option5: item.option5,
          option6: item.option6,
          releaseDate: item.release_date,
          yesterdayPrice: item.yesterday_price,
          price: item.price,
          sameNameId: item.same_name_id,
          kindId: item.kind_id,
          nameGroup: item.name_group,
          keyword: item.keyword,
          idForRegulation: item.id_for_regulation,
          packId: item.pack_id,
          itemPackId: item.item_pack_id,
          cardPackId: item.cardpackid,
          pack: item.pack,
          packGenre: item.packgenre,
          packExpansion: item.packexpansion,
          fullImageUrl: item.full_image_url,
          weight: item.weight,
          topPosProduct: {
            id: item.topPosProduct.id,
            conditionOptionHandle: item.topPosProduct.condition_option_handle,
            actualEcSellPrice: item.topPosProduct.actual_ec_sell_price,
            ecStockNumber: item.topPosProduct.ec_stock_number,
          },
          productCount: item.productCount,
        };

        return ecItem;
      });
      return items;
    } catch (error) {
      console.error('Failed to fetch items:', error);
      return null;
    }
  };

  return {
    getEcItem,
  };
};
```

### 3. useEcPasswordReset.ts (128行) - パスワードリセット
- **パスワードリセットフロー**: メール送信→トークン検証→パスワード更新
- **状態管理**: loading, error, success の状態管理
- **バリデーション**: メール・パスワード形式の検証

### 4. useEcOrderContact.ts (117行) - 注文問い合わせ
- **問い合わせ送信**: 注文に関する問い合わせの送信
- **問い合わせ取得**: 過去の問い合わせ履歴の取得
- **状態管理**: loading, error の状態管理

### 5. useEcPayment.ts (112行) - 決済処理
- **決済方法管理**: クレジットカード・コンビニ決済等の管理
- **決済実行**: 実際の決済処理の実行
- **エラーハンドリング**: 決済エラーの適切な処理

### 6. useItemOption.ts (136行) - 商品オプション
- **商品オプション取得**: 商品の詳細オプション情報取得
- **オプション管理**: 状態・レアリティ等のオプション管理

### 7. useItemDetail.ts (82行) - 商品詳細
- **商品詳細取得**: 個別商品の詳細情報取得
- **関連商品**: 関連商品の取得

### 8. useEcProduct.ts (69行) - 商品管理
- **商品検索**: 商品の検索・フィルタリング
- **商品取得**: 商品情報の取得

### 9. usePasswordResetFlow.ts (65行) - パスワードリセットフロー
- **フロー管理**: パスワードリセットの段階的フロー管理
- **状態遷移**: 各段階の状態遷移管理

### 10. useEcDeck.ts (60行) - デッキ機能
- **デッキ管理**: カードデッキの作成・管理
- **デッキ保存**: デッキ情報の保存・読み込み

### 11. useEcContact.ts (57行) - 問い合わせ
- **問い合わせ送信**: 一般的な問い合わせの送信
- **問い合わせ履歴**: 問い合わせ履歴の管理

### 12. useEcGenre.ts (44行) - ジャンル管理
- **ジャンル取得**: 商品ジャンルの取得
- **ジャンル一覧**: ジャンル一覧の管理

### 13. useISettingConstant.ts (38行) - 設定定数
- **設定値取得**: アプリケーション設定値の取得
- **定数管理**: 各種定数の管理

### 14. useCart.ts (13行) - 最小規模
```typescript
'use client';

import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

## 主要な技術実装

### 複雑な状態管理 (useEcOrder - 318行)
- **カート管理**: ログイン・非ログイン状態の統合カート管理
- **ローカルストレージ**: 非ログイン時のカート永続化
- **マージ処理**: 既存カートと新規商品の複雑なマージロジック
- **在庫不足処理**: 在庫不足商品の適切な処理
- **エラーハンドリング**: 統一されたエラー処理とアラート表示

### データ変換 (useEcItem - 125行)
- **API→アプリ形式**: サーバーAPIレスポンスをアプリ用形式に変換
- **商品優先度**: 最も状態が良く安価な商品を topPosProduct に選択
- **型安全性**: TypeScript による厳密な型定義

### Context統合 (useCart - 13行)
- **Context利用**: CartContext の薄いラッパー
- **エラーハンドリング**: Provider外使用時のエラー処理
- **型安全性**: Context の型安全な利用

## 使用パターン

### 1. カート操作
```typescript
const { addToCart, getCartContents } = useEcOrder();

// カートに商品追加
const handleAddToCart = async () => {
  const success = await addToCart({
    cartStores: [{
      storeId: 1,
      products: [{ productId: 123, originalItemCount: 1 }]
    }],
    isLoggedIn: true,
  });
  
  if (success) {
    // 成功処理
  }
};

// カート内容取得
const cartData = await getCartContents();
```

### 2. 商品検索
```typescript
const { getEcItem } = useEcItem();

// 商品検索
const searchProducts = async () => {
  const items = await getEcItem({
    genreId: 1,
    keyword: 'ポケモン',
    limit: 20,
    offset: 0,
  });
  
  if (items) {
    setProducts(items);
  }
};
```

### 3. 決済処理
```typescript
const { processPayment } = useEcPayment();

// 決済実行
const handlePayment = async () => {
  const result = await processPayment({
    paymentMethod: 'CARD',
    amount: 1000,
    orderCode: 'ORDER123',
  });
  
  if (result.success) {
    // 決済成功
  }
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../utils/`: ユーティリティ関数（フックから使用）
- `../contexts/`: React Context（フックから使用）
- `/api/frontend/ec/`: API実装（フックから呼び出し）
- `/contexts/`: アプリ全体のContext

## 開発ノート
- **規模の幅**: 13行（useCart）〜 318行（useEcOrder）
- **責務分離**: 各フックは単一責務を持つ
- **エラーハンドリング**: 統一されたエラー処理パターン
- **型安全性**: TypeScript による厳密な型定義
- **再利用性**: 複数コンポーネントから利用可能
- **パフォーマンス**: useCallback による最適化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 