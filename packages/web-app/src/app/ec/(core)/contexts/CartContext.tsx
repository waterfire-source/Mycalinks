'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { CustomError } from '@/api/implement';
import { ecImplement } from '@/api/frontend/ec/implement';
import { usePathname } from 'next/navigation';
import { useAppAuth } from '@/providers/useAppAuth';
import { MycaPosApiClient } from 'api-generator/client';
import { saveInsufficientProducts } from '@/app/ec/(core)/utils/ecStorage';

const EC_ORDER_CODE_KEY = 'ec_order_code';

/**
 * カート状態の型定義
 */
type CartType =
  | 'LOGGED_IN_USER' // ログイン済みユーザーの場合
  | 'GUEST_USER' // ゲストユーザーの場合
  | 'MERGE_GUEST_TO_USER' // 未ログイン→ログインした場合（ゲストカートをログインユーザーに統合）
  | 'NO_CART'; // カートなしの場合

/**
 * ドラフトカート詳細情報の型定義
 */
export type DraftCartDetails = {
  id: number;
  code: string;
  shipping_total_fee: number;
  total_price: number;
  cart_stores: Array<{
    store_id: number;
    total_price: number;
    shipping_method_id: number | null;
    shipping_fee: number;
    shippingMethodCandidates?: Array<{
      id: number;
      display_name: string;
      fee: number;
    }>;
  }>;
  paymentMethodCandidates?: Array<{
    id: string;
    display_name: string;
  }>;
  insufficientProducts?: Array<{
    product_id: number;
    requested_count: number;
    available_count: number;
  }>;
};

export type DraftCart = Awaited<
  ReturnType<MycaPosApiClient['ec']['getEcOrder']>
>['orders'][0];

/**
 * カートコンテキストの型定義
 */
export interface CartContextType {
  cartItemCount: number; // カート内のアイテム数
  draftCart: DraftCart | null;
  draftCartDetails: DraftCartDetails | null;
  isLoading: boolean; // ローディング状態
  fetchDraftCart: () => Promise<DraftCart | null>; // ドラフトカートを取得する関数（カート数も同時に更新）
  fetchDraftCartDetails: (
    prefecture?: string,
  ) => Promise<DraftCartDetails | null>; // ドラフトカート詳細情報を取得する関数
  updateCartCount: (count: number) => void; // カート数を直接更新する関数
  refreshCart: () => Promise<void>; // カート情報を再取得する関数（fetchDraftCartを呼び出し）
}

/**
 * カート情報を管理するコンテキスト
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * カートコンテキストのプロバイダーコンポーネント
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // カート内のアイテム数の状態管理
  const [cartItemCount, setCartItemCount] = useState(0);
  // ドラフトカートの状態管理
  const [draftCart, setDraftCart] = useState<
    | Awaited<ReturnType<MycaPosApiClient['ec']['getEcOrder']>>['orders'][0]
    | null
  >(null);
  // ドラフトカート詳細情報の状態管理
  const [draftCartDetails, setDraftCartDetails] =
    useState<DraftCartDetails | null>(null);
  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);
  // 現在のパス
  const pathname = usePathname();
  const { getUserId } = useAppAuth();

  /**
   * カート状態を判定する
   */
  const getCartType = useCallback(async (): Promise<CartType> => {
    const userId = await getUserId();
    const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY);

    if (userId && storageOrderCode) {
      return 'MERGE_GUEST_TO_USER'; // 未ログイン→ログインした場合（ゲストカートをログインユーザーに統合）
    } else if (userId) {
      return 'LOGGED_IN_USER'; // ログイン済みユーザーの場合
    } else if (storageOrderCode) {
      return 'GUEST_USER'; // ゲストユーザーの場合
    } else {
      return 'NO_CART'; // カートなしの場合
    }
  }, [getUserId]);

  /**
   * ゲストカートをログインユーザーに統合する
   */
  const mergeGuestCartToUser = useCallback(async (guestCartCode: string) => {
    const userOrders = await ecImplement().getEcOrder(
      {
        code: guestCartCode,
        includesInsufficientProducts: true,
      },
      true,
    );

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

      if (
        !(response instanceof CustomError) &&
        response.cart_stores.length > 0
      ) {
        localStorage.removeItem(EC_ORDER_CODE_KEY);
      }
    }
  }, []);

  /**
   * ケース1: ログイン済みユーザーのドラフトカート取得
   */
  const fetchDraftCartForLoggedInUser =
    useCallback(async (): Promise<DraftCart | null> => {
      const response = await ecImplement().getEcOrder({
        code: undefined,
        status: 'DRAFT',
        includesInsufficientProducts: true,
      });

      if (response instanceof CustomError) {
        return null;
      }

      const draftOrders = response.orders.filter(
        (order) => order.status === 'DRAFT',
      );
      return draftOrders.length > 0
        ? (draftOrders.reduce(
            (latest, current) => (current.id > latest.id ? current : latest),
            draftOrders[0],
          ) as DraftCart)
        : null;
    }, []);

  /**
   * ケース2: ゲストユーザーのドラフトカート取得
   */
  const fetchDraftCartForGuest =
    useCallback(async (): Promise<DraftCart | null> => {
      const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY);
      const response = await ecImplement().getEcOrder({
        code: storageOrderCode || undefined,
        includesInsufficientProducts: true,
      });

      if (response instanceof CustomError) {
        return null;
      }

      const draftOrders = response.orders.filter(
        (order) => order.status === 'DRAFT',
      );
      return draftOrders.length > 0
        ? (draftOrders.reduce(
            (latest, current) => (current.id > latest.id ? current : latest),
            draftOrders[0],
          ) as DraftCart)
        : null;
    }, []);

  /**
   * ケース3: 統合が必要なユーザーのドラフトカート取得
   */
  const fetchDraftCartForMergeUser =
    useCallback(async (): Promise<DraftCart | null> => {
      const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY);

      // 統合処理
      if (storageOrderCode) {
        await mergeGuestCartToUser(storageOrderCode);
      }

      // 統合後はログインユーザーとして取得
      return await fetchDraftCartForLoggedInUser();
    }, [mergeGuestCartToUser, fetchDraftCartForLoggedInUser]);

  /**
   * ケース4: カートなしの場合
   */
  const fetchDraftCartForNoCart =
    useCallback(async (): Promise<DraftCart | null> => {
      return null;
    }, []);

  /**
   * ドラフトカートを取得する
   */
  const fetchDraftCart = useCallback(async (): Promise<DraftCart | null> => {
    setIsLoading(true);
    let latestDraftOrder: DraftCart | null = null;
    try {
      // カート状態を取得
      const cartType = await getCartType();
      switch (cartType) {
        // ログイン済みユーザーの場合
        case 'LOGGED_IN_USER':
          latestDraftOrder = await fetchDraftCartForLoggedInUser();
          break;
        // ゲストユーザーの場合
        case 'GUEST_USER':
          latestDraftOrder = await fetchDraftCartForGuest();
          break;
        // 未ログイン→ログインした場合（ゲストカートをログインユーザーに統合）
        case 'MERGE_GUEST_TO_USER':
          latestDraftOrder = await fetchDraftCartForMergeUser();
          break;
        // カートなしの場合
        case 'NO_CART':
          latestDraftOrder = await fetchDraftCartForNoCart();
          break;
      }

      setDraftCart(latestDraftOrder);

      // ドラフトカートから商品数も更新
      if (latestDraftOrder) {
        const totalItemCount = latestDraftOrder.cart_stores.reduce(
          (total, store) =>
            total +
            store.products.reduce(
              (storeTotal, product) => storeTotal + product.original_item_count,
              0,
            ),
          0,
        );
        setCartItemCount(totalItemCount);

        // 不足商品がある場合はローカルストレージに保存
        if (
          latestDraftOrder.insufficientProducts &&
          latestDraftOrder.insufficientProducts.length > 0
        ) {
          saveInsufficientProducts(latestDraftOrder.insufficientProducts);
        }
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch draft cart:', error);
      setDraftCart(null);
      setCartItemCount(0);
    } finally {
      setIsLoading(false);
    }
    return latestDraftOrder;
  }, [
    getCartType,
    fetchDraftCartForLoggedInUser,
    fetchDraftCartForGuest,
    fetchDraftCartForMergeUser,
    fetchDraftCartForNoCart,
  ]);

  /**
   * ドラフトカート詳細情報を取得する
   */
  const fetchDraftCartDetails = useCallback(
    async (prefecture = '東京都'): Promise<DraftCartDetails | null> => {
      setIsLoading(true);
      let draftCartDetails: DraftCartDetails | null = null;
      try {
        // まずdraftCartを取得
        const draftCart = await fetchDraftCart();

        if (!draftCart?.cart_stores) {
          setDraftCartDetails(null);
          return null;
        }

        // 配送・決済詳細情報を取得
        const cartStores = draftCart.cart_stores.map((store) => ({
          storeId: store.store_id,
          shippingMethodId: store.shipping_method_id ?? undefined,
          products: store.products.map((product) => ({
            productId: product.product_id,
            originalItemCount: product.original_item_count,
          })),
        }));

        const response = await ecImplement().createOrUpdateEcOrder({
          includesShippingMethodCandidates: true,
          includesPaymentMethodCandidates: true,
          body: {
            shippingAddressPrefecture: prefecture,
            cartStores: cartStores,
          },
        });

        if (response instanceof CustomError) {
          console.error('カート詳細情報の取得に失敗しました', response);
          setDraftCartDetails(null);
          return null;
        }

        draftCartDetails = response as DraftCartDetails;
        setDraftCartDetails(draftCartDetails);
      } catch (error) {
        console.error('Failed to fetch draft cart details:', error);
        setDraftCartDetails(null);
      } finally {
        setIsLoading(false);
      }
      return draftCartDetails;
    },
    [fetchDraftCart, draftCart],
  );

  /**
   * カート内のアイテム数を直接更新する
   */
  const updateCartCount = useCallback((count: number) => {
    setCartItemCount(count);
  }, []);

  /**
   * カート情報を再取得する
   */
  const refreshCart = useCallback(async () => {
    await fetchDraftCart();
  }, [fetchDraftCart]);

  // URL変更時にドラフトカートを取得（カート数も同時に更新される）
  useEffect(() => {
    fetchDraftCart();
  }, [pathname, fetchDraftCart]);

  return (
    <CartContext.Provider
      value={{
        cartItemCount,
        draftCart,
        draftCartDetails,
        isLoading,
        fetchDraftCart,
        fetchDraftCartDetails,
        updateCartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// カートコンテキストをエクスポート
export { CartContext };
