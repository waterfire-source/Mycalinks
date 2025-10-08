import { useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { ItemCategoryHandle } from '@prisma/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export const useCreateMycaGenreAndImportItems = () => {
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const createMycaGenreAndImportItems = async (
    mycaGenreID: number,
    targetCategoryHandles?: ItemCategoryHandle[],
  ) => {
    const createMycaGenreRes = await clientAPI.genre.createMycaGenre({
      storeID: store.id,
      mycaGenreID,
    });

    if (createMycaGenreRes instanceof CustomError) {
      throw createMycaGenreRes;
    }

    const importItemsRes = await clientAPI.item.importItemsFromApp({
      storeID: store.id,
      itemGenreID: createMycaGenreRes.id,
      targetCategoryHandles,
    });

    if (importItemsRes instanceof CustomError) {
      throw importItemsRes;
    }

    return importItemsRes;
  };

  // 複数ジャンルの一括登録関数
  const createMultipleMycaGenresAndImportItems = async (
    genreData: Array<{
      mycaGenreID: number;
      targetCategoryHandles?: ItemCategoryHandle[];
    }>,
  ) => {
    try {
      setIsLoading(true);

      // 並列処理でジャンル作成とアイテムインポートを実行
      const results = await Promise.allSettled(
        genreData.map(async ({ mycaGenreID, targetCategoryHandles }) => {
          return createMycaGenreAndImportItems(
            mycaGenreID,
            targetCategoryHandles,
          );
        }),
      );

      // 結果を集計
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failureCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;
      const failedGenres = results
        .map((result, index) => ({
          result,
          genreId: genreData[index].mycaGenreID,
        }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ genreId }) => genreId);

      // 結果に応じたアラート表示
      if (successCount === genreData.length) {
        setAlertState({
          message: `${successCount}つのジャンルの登録とアイテムインポートが完了しました。`,
          severity: 'success',
        });
      } else if (successCount > 0) {
        setAlertState({
          message: `${successCount}つのジャンルが成功、${failureCount}つのジャンルが失敗しました。`,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: 'すべてのジャンル登録が失敗しました。',
          severity: 'error',
        });
      }

      return {
        ok: true,
      };
    } catch (err) {
      handleError(err);
      setAlertState({
        message: 'ジャンル一括登録中にエラーが発生しました。',
        severity: 'error',
      });
      return {
        ok: false,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMultipleMycaGenresAndImportItems,
    isLoading,
  };
};
