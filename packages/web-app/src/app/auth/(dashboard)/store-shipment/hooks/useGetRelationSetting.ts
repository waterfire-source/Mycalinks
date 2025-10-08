import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useCallback, useRef, useState } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { SelectOption } from '@/app/auth/(dashboard)/store-shipment/type';

interface Props {
  selectedTab?: number;
}

export const useGetRelationSetting = ({ selectedTab }: Props) => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );

  const [conditionFromOptions, setConditionFromOptions] = useState<
    SelectOption[]
  >([]);
  const [conditionToOptions, setConditionToOptions] = useState<SelectOption[]>(
    [],
  );
  const [genreFromOptions, setGenreFromOptions] = useState<SelectOption[]>([]);
  const [genreToOptions, setGenreToOptions] = useState<SelectOption[]>([]);
  const [specialtyFromOptions, setSpecialtyFromOptions] = useState<
    SelectOption[]
  >([]);
  const [specialtyToOptions, setSpecialtyToOptions] = useState<SelectOption[]>(
    [],
  );
  const [categoryFromOptions, setCategoryFromOptions] = useState<
    SelectOption[]
  >([]);
  const [categoryToOptions, setCategoryToOptions] = useState<SelectOption[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      // FROM店舗（自店舗）のAPI呼び出しを並列実行
      const fromPromises = [
        apiClient.current.item.getItemCategory({ storeId: store.id }),
        apiClient.current.item.getItemGenre({ storeId: store.id }),
        apiClient.current.product.getSpecialty({ storeId: store.id }),
      ];

      const fromResults = await Promise.allSettled(fromPromises);

      // 自店舗のレスポンスを取得
      const fromCategoryRes =
        fromResults[0].status === 'fulfilled' ? fromResults[0].value : null;
      const fromGenreRes =
        fromResults[1].status === 'fulfilled' ? fromResults[1].value : null;
      const fromSpecialtyRes =
        fromResults[2].status === 'fulfilled' ? fromResults[2].value : null;

      // エラーハンドリング（FROM）
      fromResults.forEach((result) => {
        if (result.status === 'rejected') {
          handleError(result.reason);
        }
      });

      // TO店舗（出荷先店舗）のAPI呼び出し
      let toCategoryRes = null;
      let toGenreRes = null;
      let toSpecialtyRes = null;

      if (selectedTab) {
        const toPromises = [
          apiClient.current.item.getItemCategory({ storeId: selectedTab }),
          apiClient.current.item.getItemGenre({ storeId: selectedTab }),
          apiClient.current.product.getSpecialty({ storeId: selectedTab }),
        ];

        const toResults = await Promise.allSettled(toPromises);

        // 出荷先店舗のレスポンスを取得
        toCategoryRes =
          toResults[0].status === 'fulfilled' ? toResults[0].value : null;
        toGenreRes =
          toResults[1].status === 'fulfilled' ? toResults[1].value : null;
        toSpecialtyRes =
          toResults[2].status === 'fulfilled' ? toResults[2].value : null;

        // エラーハンドリング（TO）
        toResults.forEach((result) => {
          if (result.status === 'rejected') {
            handleError(result.reason);
          }
        });
      }

      // 自店舗の選択肢を作成
      const conditionFromOpts: SelectOption[] = [];
      const categoryFromOpts: SelectOption[] = [];
      const genreFromOpts: SelectOption[] = [];
      const specialtyFromOpts: SelectOption[] = [];

      if (fromCategoryRes && 'itemCategories' in fromCategoryRes) {
        fromCategoryRes.itemCategories.forEach((category) => {
          // 独自カテゴリ（handleがnull）を抽出
          if (category.handle === null) {
            categoryFromOpts.push({
              value: category.id,
              label: category.display_name,
            });
          }

          // CARDカテゴリの状態オプションを抽出
          if (category.handle === 'CARD' && category.condition_options) {
            category.condition_options.forEach((option) => {
              conditionFromOpts.push({
                value: option.id,
                label: option.display_name,
              });
            });
          }
        });
      }

      if (fromGenreRes && 'itemGenres' in fromGenreRes) {
        fromGenreRes.itemGenres.forEach((genre) => {
          // 独自ジャンル（handleがnull）を抽出
          if (genre.handle === null) {
            genreFromOpts.push({
              value: genre.id,
              label: genre.display_name,
            });
          }
        });
      }

      if (fromSpecialtyRes && 'specialties' in fromSpecialtyRes) {
        fromSpecialtyRes.specialties.forEach((specialty) => {
          specialtyFromOpts.push({
            value: specialty.id,
            label: specialty.display_name,
          });
        });
      }

      // 出荷先店舗の選択肢を作成
      const conditionToOpts: SelectOption[] = [];
      const categoryToOpts: SelectOption[] = [];
      const genreToOpts: SelectOption[] = [];
      const specialtyToOpts: SelectOption[] = [];

      if (toCategoryRes && 'itemCategories' in toCategoryRes) {
        toCategoryRes.itemCategories.forEach((category) => {
          // 独自カテゴリ（handleがnull）を抽出
          if (category.handle === null) {
            categoryToOpts.push({
              value: category.id,
              label: category.display_name,
            });
          }

          if (category.handle === 'CARD' && category.condition_options) {
            category.condition_options.forEach((option) => {
              conditionToOpts.push({
                value: option.id,
                label: option.display_name,
              });
            });
          }
        });
      }

      if (toGenreRes && 'itemGenres' in toGenreRes) {
        toGenreRes.itemGenres.forEach((genre) => {
          // 独自ジャンル（handleがnull）を抽出
          if (genre.handle === null) {
            genreToOpts.push({
              value: genre.id,
              label: genre.display_name,
            });
          }
        });
      }

      if (toSpecialtyRes && 'specialties' in toSpecialtyRes) {
        toSpecialtyRes.specialties.forEach((specialty) => {
          specialtyToOpts.push({
            value: specialty.id,
            label: specialty.display_name,
          });
        });
      }

      // stateに設定
      setConditionFromOptions(conditionFromOpts);
      setConditionToOptions(conditionToOpts);
      setGenreFromOptions(genreFromOpts);
      setGenreToOptions(genreToOpts);
      setSpecialtyFromOptions(specialtyFromOpts);
      setSpecialtyToOptions(specialtyToOpts);
      setCategoryFromOptions(categoryFromOpts);
      setCategoryToOptions(categoryToOpts);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, store.id, selectedTab]);

  return {
    conditionFromOptions,
    conditionToOptions,
    genreFromOptions,
    genreToOptions,
    specialtyFromOptions,
    specialtyToOptions,
    categoryFromOptions,
    categoryToOptions,
    isLoading,
    fetchOptions,
  };
};
