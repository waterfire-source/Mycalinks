'use client';

import { useEcProduct } from '@/app/ec/(core)/hooks/useEcProduct';
import { ConditionOptionHandle } from '@prisma/client';
import { ORDER_KIND_VALUE } from '@/app/ec/(core)/constants/orderKind';
import { useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';

type FilterOptions = {
  cardConditions?: ConditionOptionHandle[];
  orderBy?: string;
  storeIds?: number[];
  specialty?: string;
};

type ProductResponse = Awaited<
  ReturnType<MycaPosApiClient['ec']['getEcProduct']>
>;

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
        const data = await getEcProduct(
          mycaItemId,
          undefined,
          filterOptions?.specialty,
        );

        if (!data) {
          return null;
        }

        let validProducts = data.products.filter(
          (product) =>
            product.ec_stock_number > 0 &&
            product.actual_ec_sell_price !== null &&
            product.condition_option !== null,
        );

        // storeIdsによるフィルタ
        if (filterOptions?.storeIds && filterOptions.storeIds.length > 0) {
          validProducts = validProducts.filter((product) =>
            filterOptions.storeIds!.includes(product.store.id),
          );
        }

        // 状態によるフィルタ
        if (filterOptions?.cardConditions?.length) {
          validProducts = validProducts.filter(
            (product) =>
              product.condition_option?.handle &&
              filterOptions.cardConditions?.includes(
                product.condition_option.handle,
              ),
          );
        }

        return {
          ...data,
          products: sortProducts(
            validProducts as ProductResponse['products'],
            filterOptions?.orderBy,
          ),
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
