import { useState, useCallback, useMemo } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import dayjs from 'dayjs';
import { $Enums, Store } from '@prisma/client';
import { getInventoriesApi } from '@/../../api-generator/src/defs/inventory/def';
import { z } from 'zod';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

type InventoriesResponse = z.infer<typeof getInventoriesApi.response>;
export type InventoryData = InventoriesResponse['inventories'][number];

type InventoryFetchArg = z.infer<typeof getInventoriesApi.request.query>;

export interface InventoryCountData {
  id: number;
  title: string;
  status: string;
  updatedAt: string;
  store: {
    id: number;
    display_name: string;
  };
  genreIds: number[];
  categoryIds: number[];
  progress: number;
  difference: number;
  inputTotalWholesalePrice: bigint;
  inputCount: number;
  targetTotalWholesalePrice: bigint;
  targetCount: number;
  discrepancy: number;
}

export const useInventoryCount = (storeId: number, stores: Store[]) => {
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [rows, setRows] = useState<InventoryCountData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentShelfs, setCurrentShelfs] = useState<
    {
      id: number;
      display_name: string;
      order_number: number | null;
      created_at: Date;
      updated_at: Date;
      store_id: number;
      is_deleted: boolean;
    }[]
  >([]);

  const clientAPI = useMemo(() => createClientAPI(), []);
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [],
  );

  const mapInventoryData = (inventory: InventoryData): InventoryCountData => {
    const inputCount = inventory.total_item_count || 0;
    const targetCount = inventory.total_stock_number || 0;

    const data = {
      id: inventory.id,
      title: inventory.title || '',
      status:
        inventory.status === $Enums.InventoryStatus.FINISHED
          ? '完了'
          : '中断中',
      updatedAt: inventory.updated_at
        ? dayjs(inventory.updated_at).format('YYYY/MM/DD HH:mm')
        : '-',
      store: {
        id: inventory.store_id,
        display_name:
          stores.find((s) => s.id === inventory.store_id)?.display_name || '-',
      },
      genreIds: inventory.item_genres.map((item) => item.item_genre_id),
      categoryIds: inventory.item_categories.map(
        (item) => item.item_category_id,
      ),
      progress: Math.round((inputCount / targetCount) * 1000) / 10,
      difference: Number(
        BigInt(inventory.total_item_wholesale_price || 0) -
          BigInt(inventory.total_stock_wholesale_price || 0),
      ),
      inputTotalWholesalePrice:
        inventory.total_item_wholesale_price || BigInt(0),
      inputCount,
      targetTotalWholesalePrice:
        inventory.total_stock_wholesale_price || BigInt(0),
      targetCount,
      discrepancy: inputCount - targetCount,
    };

    return data;
  };

  const fetchData = useCallback(
    async (arg?: InventoryFetchArg) => {
      setIsLoading(true);

      try {
        const response = await mycaPosApiClient.inventory.getInventories({
          storeId: storeId,
          id: arg?.id,
          take: arg?.take,
          skip: arg?.skip,
          status: arg?.status,
          categoryId: arg?.category_id,
          genreId: arg?.genre_id,
        });

        const mappedInventories = response.inventories.map((inventory) =>
          mapInventoryData({
            ...inventory,
            created_at: new Date(inventory?.created_at || Date.now()),
            updated_at: new Date(inventory?.updated_at || Date.now()),
            finished_at: new Date(inventory?.finished_at || Date.now()),
            total_item_count: Number(inventory.total_item_count || 0),
            total_item_sell_price: BigInt(inventory.total_item_sell_price || 0),
            total_item_wholesale_price: BigInt(
              inventory.total_item_wholesale_price || 0,
            ),
            total_stock_number: Number(inventory.total_stock_number || 0),
            total_stock_sell_price: BigInt(
              inventory.total_stock_sell_price || 0,
            ),
            total_stock_wholesale_price: BigInt(
              inventory.total_stock_wholesale_price || 0,
            ),
          }),
        );
        setRows(mappedInventories);
        // APIレスポンスからtotalCountを設定
        setTotalCount(response.totalCount || mappedInventories.length);

        const shelfsResponse = await clientAPI.inventory.getShelfs({
          storeID: storeId,
        });
        if (shelfsResponse instanceof CustomError) throw shelfsResponse;

        setCurrentShelfs(shelfsResponse.shelfs);
      } catch (error) {
        handleError(error);
        return;
      } finally {
        setIsLoading(false);
      }
    },
    [storeId, mycaPosApiClient, clientAPI, setAlertState, mapInventoryData],
  );

  const handleSaveShelfNames = async (
    newShelfs: {
      id: number;
      display_name: string;
      order_number: number | null;
    }[],
  ) => {
    const createOrUpdatePromises = newShelfs
      .filter((shelf) => {
        const current = currentShelfs.find((s) => s.id === shelf.id);
        return (
          !current || // 新規棚
          shelf.display_name !== current.display_name || // 名前変更
          shelf.order_number !== current.order_number // 並び順変更 ← 追加！
        );
      })
      .map(async (shelf) => {
        const response = await clientAPI.inventory.createOrUpdateShelf({
          storeID: storeId,
          ...(currentShelfs.some(
            (currentShelf) => shelf.id === currentShelf.id,
          ) && { id: shelf.id }),
          display_name: shelf.display_name,
          order_number: shelf.order_number,
        });
        if (response instanceof CustomError) {
          setAlertState({ message: response.message, severity: 'error' });
          return;
        }
      });

    const deletePromises = currentShelfs
      .filter(
        (currentShelf) =>
          !newShelfs.some((shelf) => shelf.id === currentShelf.id),
      )
      .map(async (shelfToDelete) => {
        const response = await clientAPI.inventory.deleteShelf({
          storeID: storeId,
          shelfID: shelfToDelete.id,
        });
        if (response instanceof CustomError) {
          setAlertState({ message: response.message, severity: 'error' });
          return;
        }
      });

    await Promise.all([...createOrUpdatePromises, ...deletePromises]);

    const shelfsResponse = await clientAPI.inventory.getShelfs({
      storeID: storeId,
    });
    if (shelfsResponse instanceof CustomError) {
      setAlertState({ message: shelfsResponse.message, severity: 'error' });
      return;
    }
    setCurrentShelfs(shelfsResponse.shelfs);
    setAlertState({ message: '棚の更新が完了しました', severity: 'success' });
  };

  return {
    rows,
    totalCount,
    isLoading,
    currentShelfs,
    fetchData,
    handleSaveShelfNames,
  };
};
