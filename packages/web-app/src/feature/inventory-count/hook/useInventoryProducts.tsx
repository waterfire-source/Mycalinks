import { useCallback, useMemo, useState } from 'react';
import { getInventoryProductsApi } from '@/../../api-generator/src/defs/inventory/def';
import { z } from 'zod';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { CustomError } from '@/api/implement';
import { useErrorAlert } from '@/hooks/useErrorAlert';

type InventoryProductsResponse = z.infer<
  typeof getInventoryProductsApi.response
>;

type InventoryProductsQuery = z.infer<
  typeof getInventoryProductsApi.request.query
>;

type FetchArg = {
  inventoryId: number;
  isInjectedWholesalePrice?: InventoryProductsQuery['isInjectedWholesalePrice'];
  genre_id?: InventoryProductsQuery['genre_id'];
  category_id?: InventoryProductsQuery['category_id'];
  condition_option_name?: InventoryProductsQuery['condition_option_name'];
  shelfId?: InventoryProductsQuery['shelfId'];
  diff_filter?: InventoryProductsQuery['diff_filter'];
  orderBy?: InventoryProductsQuery['orderBy'];
  orderDirection?: InventoryProductsQuery['orderDirection'];
  take?: InventoryProductsQuery['take'];
  skip?: InventoryProductsQuery['skip'];
};

// 型定義をexport
export type DiffFilterType = FetchArg['diff_filter'];
export type OrderByType = FetchArg['orderBy'];
export type OrderDirectionType = FetchArg['orderDirection'];

export type InventoryProductAPIData =
  InventoryProductsResponse['products'][number];

export const useInventoryProducts = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingInventoryProducts, setIsLoadingInventoryProducts] =
    useState<boolean>(false);
  const [inventoryProducts, setInventoryProducts] = useState<
    InventoryProductsResponse['products']
  >([]);
  console.log('棚卸のinventoryProducts: ', inventoryProducts);

  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [store.id],
  );

  const fetchInventoryProducts = useCallback(
    async ({
      inventoryId,
      isInjectedWholesalePrice,
      genre_id,
      category_id,
      condition_option_name,
      shelfId,
      diff_filter,
      orderBy,
      orderDirection,
      take,
      skip,
    }: FetchArg): Promise<InventoryProductsResponse | null> => {
      setIsLoadingInventoryProducts(true);
      try {
        const apiParams: any = {
          storeId: store.id,
          inventoryId: inventoryId,
        };

        if (isInjectedWholesalePrice !== undefined) {
          apiParams.isInjectedWholesalePrice = isInjectedWholesalePrice;
        }
        if (genre_id !== undefined) {
          apiParams.genreId = genre_id;
        }
        if (category_id !== undefined) {
          apiParams.categoryId = category_id;
        }
        if (condition_option_name !== undefined) {
          apiParams.conditionOptionName = condition_option_name;
        }
        if (shelfId !== undefined) {
          apiParams.shelfId = shelfId;
        }
        if (take !== undefined) {
          apiParams.take = take;
        }
        if (skip !== undefined) {
          apiParams.skip = skip;
        }
        if (diff_filter !== undefined) {
          apiParams.diffFilter = diff_filter;
        }
        if (orderBy !== undefined) {
          apiParams.orderBy = orderBy;
        }
        if (orderDirection !== undefined) {
          apiParams.orderDirection = orderDirection;
        }

        const res =
          await mycaPosApiClient.inventory.getInventoryProducts(apiParams);
        console.log('棚卸のres: ', res);

        if (res instanceof CustomError) throw res;

        const converted = res.products.map((p) => ({
          ...p,
          product: {
            ...p.product,
            created_at: new Date(p.product.created_at),
            updated_at: new Date(p.product.updated_at),
            condition: {
              ...p.product.condition,
              created_at: new Date(
                p.product.condition.created_at || Date.now(),
              ),
            },
            item: {
              ...p.product.item,
              genre: {
                ...p.product.item.genre,
                created_at: new Date(
                  p.product.item.genre.created_at || Date.now(),
                ),
                updated_at: new Date(
                  p.product.item.genre.updated_at || Date.now(),
                ),
              },
              category: {
                ...p.product.item.category,
                created_at: new Date(
                  p.product.item.category.created_at || Date.now(),
                ),
                updated_at: new Date(
                  p.product.item.category.updated_at || Date.now(),
                ),
              },
            },
            specialty: p.product?.specialty?.id
              ? {
                  ...p.product.specialty,
                  id: p.product.specialty.id!,
                  created_at: new Date(
                    p.product.specialty?.created_at || Date.now(),
                  ),
                  updated_at: new Date(
                    p.product.specialty?.updated_at || Date.now(),
                  ),
                }
              : null,
          },
        }));

        console.log('棚卸のconverted: ', converted);
        setTotalCount(res.total_count);
        setInventoryProducts(converted);
        return { total_count: res.total_count, products: converted };
      } catch (error) {
        handleError(error);
        return null;
      } finally {
        setIsLoadingInventoryProducts(false);
      }
    },
    [mycaPosApiClient],
  );

  return {
    inventoryProducts,
    fetchInventoryProducts,
    isLoadingInventoryProducts,
    totalCount,
  };
};
