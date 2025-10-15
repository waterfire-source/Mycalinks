'use client';

import { useCallback } from 'react';
import { ecImplement } from '@/api/frontend/ec/implement';
import { EcAPI } from '@/api/frontend/ec/api';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useAppAuth } from '@/providers/useAppAuth';
import { saveInsufficientProducts } from '@/app/ec/(core)/utils/ecStorage';
import { useCart } from '@/app/ec/(core)/hooks/useCart';

const EC_ORDER_CODE_KEY = 'ec_order_code';

type CartProduct = {
  productId: number;
  originalItemCount: number;
};

export type CartStore = {
  storeId: number;
  shippingMethodId?: number;
  products: CartProduct[];
};

export type AddToCartParams = {
  shippingAddressPrefecture?: string;
  cartStores: CartStore[];
  isLoggedIn?: boolean; // ログイン状態を示すフラグ
  /**
   * 在庫不足商品の配列（デッキ構築機能などで使用）
   *
   * 【使用例】
   * - デッキ構築でavailableProductsが空の場合
   * - 商品の在庫が完全に不足している場合
   *
   * 【処理フロー】
   * 1. フロントエンドで不足在庫を検出
   * 2. AddToCartParamsに含めて送信
   * 3. addToCart関数内でローカルストレージに保存
   * 4. カートページで自動的にモーダル表示
   */
  insufficientProducts?: Array<{
    product_id: number; // 0の場合は実際の商品IDが存在しない
    insufficient_count: number; // 不足している数量
    item: {
      id: number; // MycaアイテムID
      cardname: string; // カード名
      rarity: string; // レアリティ
      expansion: string; // エキスパンション
      cardnumber: string; // 型番
      full_image_url: string; // 画像URL
    };
    condition_option: {
      handle: string; // コンディションハンドル（例: "O2_A"）
    };
  }>;
};

export type EcOrderData = Exclude<EcAPI['getEcOrder']['response'], CustomError>;

export type CreateOrUpdateEcOrderParam =
  EcAPI['createOrUpdateEcOrder']['request'];
type CreateOrUpdateEcOrderResponse = EcAPI['createOrUpdateEcOrder']['response'];

type ApiCartStore = {
  store_id: number;
  shipping_method_id: number | null;
  products: {
    product_id: number;
    original_item_count: number;
  }[];
};

/**
 * ECオーダー関連のカスタムフック
 * @returns ECオーダー関連の関数を含むオブジェクト
 */
export const useEcOrder = () => {
  const { setAlertState } = useAlert();
  const { getUserId } = useAppAuth();
  const { refreshCart } = useCart();
  /**
   * カートの中身を取得する
   * @returns カートの情報、エラーの場合はnull
   */
  const getCartContents = useCallback(
    async (code?: string): Promise<EcOrderData | null> => {
      try {
        const userId = await getUserId(); // ログインIDを取得
        const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY); // ローカルストレージを取得
        // ログイン済み&ローカルストレージにカートコードがある場合
        if (userId && storageOrderCode) {
          const userOrders = await ecImplement().getEcOrder(
            {
              code: storageOrderCode,
            },
            true,
          );
          // オーダーがユーザに紐づけられていない可能性がある場合は紐づけをおこなう
          if (
            !(userOrders instanceof CustomError) &&
            userOrders.orders.length > 0
          ) {
            // オーダーリストの中からEC_ORDER_CODE_KEYと一致するcodeを持つオーダーがあるか確認
            const response = await ecImplement().createOrUpdateEcOrder({
              body: {
                cartStores: userOrders.orders[0].cart_stores
                  .map((store) => ({
                    storeId: store.store_id,
                    shippingMethodId: store.shipping_method_id ?? undefined,
                    products: store.products
                      .filter((product) => product.original_item_count > 0)
                      .map((product) => ({
                        productId: product.product_id,
                        originalItemCount: product.original_item_count,
                      })),
                  }))
                  .filter((store) => store.products.length > 0),
              },
            });
            if (
              !(response instanceof CustomError) &&
              response.cart_stores.length > 0
            ) {
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
   * APIのカートストア形式をアプリケーションの形式に変換
   */
  const convertApiCartStoreToAppFormat = (
    apiStore: ApiCartStore,
  ): CartStore => ({
    storeId: apiStore.store_id,
    shippingMethodId: apiStore.shipping_method_id ?? undefined,
    products: apiStore.products.map((product) => ({
      productId: product.product_id,
      originalItemCount: product.original_item_count,
    })),
  });

  /**
   * カートに商品を追加する
   * @param params - カート追加のパラメータ
   * @returns 成功時はtrue、失敗時はfalse
   */
  const addToCart = useCallback(
    async (params: AddToCartParams) => {
      try {
        // ログイン状態に応じてカート取得処理を変更
        const existingCart = await getCartContents();

        // ログイン状態の場合はローカルストレージのコードを使用しない
        // 非ログイン状態の場合はローカルストレージのコードを使用
        const existingCode = params.isLoggedIn
          ? undefined
          : localStorage.getItem(EC_ORDER_CODE_KEY);

        // 既存のカートと新しい商品をマージ
        const mergedCartStores = [...params.cartStores];
        if (existingCart?.orders) {
          // DRAFTステータスのオーダーを取得し、IDが最も大きいものを選択
          const draftOrders = existingCart.orders.filter(
            (order) => order.status === 'DRAFT',
          );
          const latestDraftOrder =
            draftOrders.length > 0
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
                // 新しい店舗の場合はそのまま追加
                mergedCartStores.push(existingStore);
              } else {
                // 既存の店舗の場合は商品をマージ
                const store = mergedCartStores[storeIndex];
                existingStore.products.forEach((existingProduct) => {
                  const productIndex = store.products.findIndex(
                    (product) =>
                      product.productId === existingProduct.productId,
                  );

                  if (productIndex === -1) {
                    // 新しい商品の場合は追加
                    store.products.push(existingProduct);
                  } else {
                    // 既存の商品の場合は数量を加算
                    store.products[productIndex].originalItemCount +=
                      existingProduct.originalItemCount;
                  }
                });
              }
            });
          }
        }

        // original_item_countが0より大きい商品のみを含むカートストアをフィルタリング
        const filteredCartStores = mergedCartStores
          .map((store) => ({
            ...store,
            products: store.products.filter(
              (product) => product.originalItemCount > 0,
            ),
          }))
          .filter((store) => store.products.length > 0);

        const response = await ecImplement().createOrUpdateEcOrder({
          body: {
            // ログイン状態の場合はcodeをundefinedに設定
            // 非ログイン状態の場合のみ既存コードを使用
            code: existingCode ?? undefined,
            shippingAddressPrefecture: params.shippingAddressPrefecture,
            cartStores: filteredCartStores,
          },
        });
        // カートバッチを更新（商品数の更新）
        refreshCart();

        if ('code' in response) {
          // ログイン状態でない場合のみローカルストレージにコードを保存
          if (!params.isLoggedIn) {
            localStorage.setItem(EC_ORDER_CODE_KEY, response.code);
          }

          /**
           * 不足在庫の統合処理
           *
           * 【処理概要】
           * 1. フロントエンドで検出された不足在庫（パラメータ）
           * 2. APIサーバーで検出された不足在庫（レスポンス）
           * この2つを統合してローカルストレージに保存
           *
           * 【保存先】ローカルストレージ（key: "ec", field: "insufficient_products"）
           * 【表示タイミング】カートページ読み込み時に自動表示
           */
          const allInsufficientProducts = [];

          // 1. パラメータで渡された不足商品を追加（デッキ構築など）
          if (
            params.insufficientProducts &&
            params.insufficientProducts.length > 0
          ) {
            allInsufficientProducts.push(...params.insufficientProducts);
          }

          // 2. APIレスポンスからの不足商品を追加（在庫数チェック結果）
          if (
            !(response instanceof CustomError) &&
            response.insufficientProducts &&
            response.insufficientProducts.length > 0
          ) {
            allInsufficientProducts.push(...response.insufficientProducts);
          }

          // 3. 不足商品が存在する場合、ローカルストレージに保存
          if (allInsufficientProducts.length > 0) {
            saveInsufficientProducts(allInsufficientProducts);
          }

          return true;
        }

        setAlertState({
          message: 'カートへの追加に失敗しました',
          severity: 'error',
        });
        return false;
      } catch (error) {
        setAlertState({
          message: 'カートへの追加に失敗しました',
          severity: 'error',
        });
        return false;
      }
    },
    [getCartContents, setAlertState],
  );

  /**
   * カート情報を更新する汎用関数
   * 配送方法の変更やカート内容の更新に使用できる
   * @param params - カート更新のパラメータ
   * @returns 成功時は更新されたカート情報、失敗時はnull
   */
  const createOrUpdateEcOrder = useCallback(
    async (
      params: CreateOrUpdateEcOrderParam,
    ): Promise<CreateOrUpdateEcOrderResponse | null> => {
      try {
        // ログイン状態のチェックはhook内で行う
        const userId = await getUserId();
        const storageOrderCode = localStorage.getItem(EC_ORDER_CODE_KEY);
        const code = !userId ? storageOrderCode || undefined : undefined;

        // createOrUpdateEcOrderを呼び出してカート情報を更新
        // params.cartStoresには更新後のカート情報を指定する
        // 配送方法候補を取得したい場合はincludesShippingMethodCandidatesをtrueに設定

        // original_item_countが0より大きい商品のみを含むカートストアをフィルタリング
        const filteredCartStores = params.body?.cartStores
          ?.map((store) => ({
            storeId: store.storeId,
            shippingMethodId: store.shippingMethodId,
            products: store.products
              .filter((product) => product.originalItemCount > 0)
              .map((product) => ({
                productId: product.productId,
                originalItemCount: product.originalItemCount,
              })),
          }))
          .filter((store) => store.products.length > 0);

        const response = await ecImplement().createOrUpdateEcOrder({
          includesShippingMethodCandidates:
            params.includesShippingMethodCandidates,
          includesPaymentMethodCandidates:
            params.includesPaymentMethodCandidates,
          body: {
            code: code,
            shippingAddressPrefecture: params.body?.shippingAddressPrefecture,
            cartStores: filteredCartStores,
          },
        });

        // エラーレスポンスの場合はエラーメッセージを表示して終了
        if (response instanceof CustomError) {
          setAlertState({
            message: 'カートの更新に失敗しました',
            severity: 'error',
          });
          return null;
        }

        // 成功時の処理
        // ログイン状態でない場合のみローカルストレージにコードを保存
        if (!userId) {
          localStorage.setItem(EC_ORDER_CODE_KEY, response.code);
        }
        // カートバッチを更新（商品数の更新）
        refreshCart();

        return response;
      } catch (error) {
        setAlertState({
          message: 'カートの更新に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [setAlertState, getUserId],
  );

  /**
   * 領収書を発行する
   * @param orderId - オーダーID
   * @param storeId - ストアID
   * @param customerName - 宛名
   * @returns 成功時は領収書URL、失敗時はnull
   */
  const issueReceipt = useCallback(
    async (
      orderId: number,
      storeId: number,
      customerName?: string,
    ): Promise<string | null> => {
      try {
        const response = await ecImplement().getEcOrderReceipt({
          orderId,
          storeId,
          customerName,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: '領収書の発行に失敗しました ' + response.message,
            severity: 'error',
          });
          return null;
        }
        return response.receiptUrl;
      } catch (error) {
        if (error instanceof CustomError) {
          setAlertState({
            message: '領収書の発行に失敗しました ' + error.message,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '領収書の発行に失敗しました',
            severity: 'error',
          });
        }
        return null;
      }
    },
    [setAlertState],
  );

  return { addToCart, getCartContents, createOrUpdateEcOrder, issueReceipt };
};
