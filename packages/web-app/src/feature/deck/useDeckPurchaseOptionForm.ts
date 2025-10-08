import {
  DeckAvailableProductsPriorityOption,
  useEcDeck,
} from '@/app/ec/(core)/hooks/useEcDeck';
import {
  AddToCartParams,
  CartStore,
  useEcOrder,
} from '@/app/ec/(core)/hooks/useEcOrder';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { DeckOptionForm, DeckOptionFormType } from '@/feature/deck/form-schema';
import { cardCondition } from '@/app/ec/(core)/constants/condition';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { EcAPI } from '@/api/frontend/ec/api';
import { createOrUpdateEcOrderDef } from '@/app/api/ec/def';

export type DeckItems =
  EcAPI['getEcDeckAvailableProducts']['response']['deckItems'];
export type InsufficientProduct = NonNullable<
  (typeof createOrUpdateEcOrderDef.response)['insufficientProducts']
>[number];

/**
 * デッキ購入オプションフォームのカスタムフック
 *
 * 【機能概要】
 * 1. デッキ構築に必要な商品の在庫を取得
 * 2. 利用可能な商品を店舗別に整理してカートに追加
 * 3. 在庫不足の商品を検出してユーザーに通知
 *
 * 【在庫不足検出機能】
 * - availableProductsが空のアイテムを自動検出
 * - mycaItemの情報を使用して不足在庫情報を作成
 * - condition_option.handleは"O2_A"で固定
 * - カートページで自動的にモーダル表示される
 *
 * @param deckId デッキID（ポケカ公式デッキ以外）
 * @param code デッキコード（ポケカ公式デッキ）
 */
export const useDeckPurchaseOptionForm = (deckId?: number, code?: string) => {
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { addToCart } = useEcOrder();
  const { getEcDeckAvailableProducts } = useEcDeck();

  const defaultValues: DeckOptionFormType = {
    anyCardNumber: false,
    anyRarity: false,
    conditionOption: cardCondition.map((condition) => condition.value),
    priorityOption: DeckAvailableProductsPriorityOption.COST,
  };

  const formResolver = zodResolver(DeckOptionForm);

  const methods = useForm<DeckOptionFormType>({
    defaultValues,
    resolver: formResolver,
  });
  const { handleSubmit } = methods;
  const fetchDeckAvailableProducts = useCallback(
    async (data: DeckOptionFormType) => {
      const { anyRarity, anyCardNumber, conditionOption, priorityOption } =
        data;

      try {
        const response = await getEcDeckAvailableProducts(
          anyRarity,
          anyCardNumber,
          deckId,
          deckId ? undefined : code,
          conditionOption.join(','),
          priorityOption,
        );
        return response?.deckItems;
      } catch (error) {
        return null;
      }
    },
    [deckId, code, getEcDeckAvailableProducts],
  );

  // 店舗ごとに在庫を整理するためのヘルパー関数
  const organizeProductsByStore = useCallback(
    (deckItems: DeckItems): CartStore[] => {
      const storeMap = new Map<number, CartStore>();

      deckItems.forEach((item) => {
        let remainingCount = item.needItemCount;

        // 各商品に必要数を分配
        item.availableProducts.forEach((product) => {
          if (remainingCount <= 0) return;

          const storeId = product.store.id;
          if (!storeMap.has(storeId)) {
            storeMap.set(storeId, {
              storeId,
              shippingMethodId: undefined,
              products: [],
            });
          }

          // 在庫数を考慮して追加数を決定
          const addCount = Math.min(
            remainingCount,
            product.ec_stock_number || 1,
          );

          storeMap.get(storeId)?.products.push({
            productId: product.id,
            originalItemCount: addCount,
          });

          remainingCount -= addCount;
        });
      });

      return Array.from(storeMap.values());
    },
    [],
  );

  /**
   * デッキ構築で在庫が不足している商品を検出するヘルパー関数
   *
   * @param deckItems - デッキ構築API(/api/ec/item/deck-available-products)から取得したアイテム情報
   * @returns InsufficientProduct[] - 不足在庫の配列
   *
   * 【処理概要】
   * 1. 各アイテムの必要数(needItemCount)と利用可能在庫数を比較
   * 2. ケース1: availableProductsが空 → 全て不足
   * 3. ケース2: availableProductsはあるが在庫数が不足 → 差分が不足
   * 4. 不足在庫の情報はmycaItemから取得し、コンディションは"O2_A"で固定
   */
  const detectInsufficientProducts = useCallback(
    (deckItems: DeckItems): InsufficientProduct[] => {
      const insufficientProducts: InsufficientProduct[] = [];

      deckItems.forEach((item) => {
        let totalAvailableStock = 0;

        // 利用可能在庫の合計を計算
        item.availableProducts.forEach((product) => {
          totalAvailableStock += product.ec_stock_number || 0;
        });

        // 必要数と利用可能在庫を比較して不足数を計算
        const insufficientCount = item.needItemCount - totalAvailableStock;

        // 不足がある場合のみ不足在庫として記録
        if (insufficientCount > 0) {
          insufficientProducts.push({
            product_id: 0, // 不足在庫なので実際の商品IDは0
            insufficient_count: insufficientCount, // 計算された不足数
            item: {
              // mycaItemから商品情報を取得
              id: item.mycaItem.id,
              cardname: item.mycaItem.cardname,
              rarity: item.mycaItem.rarity,
              expansion: item.mycaItem.expansion,
              cardnumber: item.mycaItem.cardnumber,
              full_image_url: item.mycaItem.full_image_url,
            },
            condition_option: {
              // コンディションは"O2_A"で固定（要件に従って）
              handle: 'O2_A',
            },
          });
        }
      });

      return insufficientProducts;
    },
    [],
  );

  /**
   * デッキ商品をカートに追加する処理を行うヘルパー関数
   *
   * @param deckItems - デッキ構築APIから取得したアイテム情報
   *
   * 【処理フロー】
   * 1. organizeProductsByStore: 利用可能な商品を店舗ごとに整理
   * 2. detectInsufficientProducts: 不足在庫を検出
   * 3. AddToCartParamsに両方の情報を含めてaddToCart実行
   * 4. 成功時はカートページにリダイレクト
   * 5. 失敗時はエラーメッセージを表示
   *
   * 【不足在庫の処理】
   * - 不足在庫が検出された場合、AddToCartParamsのinsufficientProductsに含める
   * - useEcOrder.addToCart内でローカルストレージに保存される
   * - カートページで自動的にInsufficientProductsModalが表示される
   */
  const processCartAddition = useCallback(
    async (deckItems: DeckItems) => {
      try {
        // 1. 利用可能な商品を店舗ごとに整理
        const cartStores = organizeProductsByStore(deckItems);

        // 2. 在庫不足の商品を検出
        const insufficientProducts = detectInsufficientProducts(deckItems);

        // 3. カート追加パラメータを構築（不足在庫がある場合は含める）
        const params: AddToCartParams = {
          cartStores,
          // 不足在庫がある場合のみinsufficientProductsプロパティを追加
          ...(insufficientProducts.length > 0 && { insufficientProducts }),
        };

        // 4. カートに追加実行
        await addToCart(params);

        // 5. 成功時はカートページにリダイレクト
        router.push(PATH.CART);
      } catch (error) {
        // エラー時はアラートを表示
        setAlertState({
          message: 'カートに追加できませんでした。もう一度お試しください。',
          severity: 'error',
        });
      }
    },
    [
      addToCart,
      organizeProductsByStore,
      detectInsufficientProducts,
      router,
      setAlertState,
    ],
  );

  const onSubmit = handleSubmit(async (data: DeckOptionFormType) => {
    setIsLoading(true);

    // 1. デッキで利用可能な商品を取得
    const deckItems = await fetchDeckAvailableProducts(data);
    if (!deckItems) {
      setIsLoading(false);
      return;
    }

    await processCartAddition(deckItems);
    setIsLoading(false);
  });

  return { methods, onSubmit, isLoading };
};
