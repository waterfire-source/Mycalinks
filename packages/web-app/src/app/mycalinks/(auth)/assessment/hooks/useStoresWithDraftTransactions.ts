'use client';

import { createClientAPI, CustomError } from '@/api/implement';
import { Store } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';
import { useGlobalNotify } from '@/app/mycalinks/(auth)/assessment/hooks/useGlobalNotify';
import { useErrorAlert } from '@/hooks/useErrorAlert';

type StoreWithTermAccepted = Store & {
  term_accepted_at: Date | null;
  reception_number: number;
  buy__is_assessed: boolean;
};

export const useStoresWithDraftTransactions = () => {
  const [stores, setStores] = useState<StoreWithTermAccepted[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { allTransactions } = useGlobalNotify(); // useGlobalNotifyからallTransactionsを取得
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { handleError } = useErrorAlert();

  const fetchStoresWithDraftTransactions = useCallback(async () => {
    if (allTransactions.length === 0) {
      setStores([]);
      return;
    }

    setLoading(true);
    try {
      // 有効な取引から店舗ID一覧を作成
      const storeIdToTerm: Record<
        number,
        {
          term_accepted_at: Date | null;
          reception_number: number;
          buy__is_assessed: boolean;
        }
      > = {};

      allTransactions.forEach((t) => {
        const current = storeIdToTerm[t.store_id];

        if (!current) {
          storeIdToTerm[t.store_id] = {
            term_accepted_at: t.term_accepted_at,
            reception_number: t.reception_number!,
            buy__is_assessed: t.buy__is_assessed,
          };
        }
      });

      // 最終的な配列に整形
      const storeTermInfoList = Object.entries(storeIdToTerm).map(
        ([store_id, info]) => ({
          store_id: Number(store_id),
          ...info,
        }),
      );

      // 各店舗の詳細情報を取得し、マージ
      const storeResults = await Promise.all(
        storeTermInfoList.map(
          async ({
            store_id,
            term_accepted_at,
            reception_number,
            buy__is_assessed,
          }) => {
            try {
              const storeResponse = await clientAPI.store.getStoreInfo({
                storeID: store_id,
              });

              if (storeResponse instanceof CustomError) {
                console.error(storeResponse.message);
                return null;
              }

              return {
                ...(storeResponse as Store),
                term_accepted_at,
                reception_number,
                buy__is_assessed,
              } as StoreWithTermAccepted;
            } catch (error) {
              handleError(error);
              return null;
            }
          },
        ),
      );

      // nullを除いた有効なデータだけに絞る
      const validStores = storeResults.filter(
        (store): store is StoreWithTermAccepted => store !== null,
      );

      setStores(validStores);
    } catch (error) {
      handleError(error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [allTransactions, clientAPI, handleError]);

  return {
    stores,
    loading,
    fetchStoresWithDraftTransactions,
  };
};
