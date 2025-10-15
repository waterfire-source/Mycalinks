import { useState, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';

export type GetItemFindOptionResponse = Awaited<
  ReturnType<MycaPosApiClient['mycaItem']['getMycaItemFindOptionByStoreId']>
>;

export type findOptionsType = GetItemFindOptionResponse['searchElements'];

/** 商品を検索するための絞り込み選択肢を取得する*/
export const useGetItemFindOption = () => {
  const { setAlertState } = useAlert();

  // 絞り込み選択肢のstate
  const [findOptions, setFindOptions] = useState<findOptionsType | undefined>(
    undefined,
  );
  // 絞り込み選択肢のLoading
  const [isLoadingFindOption, setIsLoadingFindOption] = useState(false);

  const fetchItemFindOption = useCallback(
    async (
      storeID?: number,
      genreId?: number | null,
      categoryId?: number | null,
      cardCategoryId?: number,
    ) => {
      const apiClient = new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      });
      // ジャンルが選択された時点でカテゴリ「カード」（idは親から取得）としてfindOption取得
      if (!!storeID && !!genreId && !!cardCategoryId) {
        setIsLoadingFindOption(true);
        try {
          const response =
            await apiClient.mycaItem.getMycaItemFindOptionByStoreId({
              storeId: storeID,
              genreId: genreId,
              categoryId:
                categoryId && categoryId !== 0 ? categoryId : cardCategoryId,
            });

          setFindOptions(response.searchElements);
        } catch (error) {
          setFindOptions(undefined);
          setAlertState({
            message: `絞り込み選択肢の取得に失敗しました`,
            severity: 'error',
          });
        } finally {
          setIsLoadingFindOption(false);
        }
      } else {
        setFindOptions(undefined);
      }
    },
    [setAlertState],
  );

  return {
    findOptions,
    fetchItemFindOption,
    isLoadingFindOption,
  };
};
