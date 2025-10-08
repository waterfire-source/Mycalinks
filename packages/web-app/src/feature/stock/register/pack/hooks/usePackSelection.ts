import { PackType } from '@/feature/stock/register/pack/components/PackTable';
import { RegisterParams } from '@/feature/stock/register/pack/types';
import { useState, useEffect, useMemo } from 'react';

/**
 * パック選択機能のカスタムフック
 */
export const usePackSelection = () => {
  // パック選択状態
  const [selectedPack, setSelectedPack] = useState<PackType | undefined>();

  // 開封パラメータの初期値
  const initialFormData = useMemo<RegisterParams>(
    () => ({
      openNumber: undefined,
      isFixedPack: false,
      isRandomPack: false,
      selectedStorageProduct: '',
    }),
    [],
  );

  const [registerParams, setRegisterParams] =
    useState<RegisterParams>(initialFormData);
  const [selectedStorageProduct, setSelectedStorageProduct] = useState<
    number | string
  >(0);

  // 選択されたパックが変更された時にフォームをリセット
  useEffect(() => {
    setRegisterParams({
      openNumber: undefined,
      isFixedPack: false,
      isRandomPack: false,
      selectedStorageProduct: '',
    });
  }, [selectedPack]);

  // フォームデータに変更があるかチェック
  const isDirty = useMemo(() => {
    return (
      registerParams.openNumber !== initialFormData.openNumber ||
      registerParams.isFixedPack !== initialFormData.isFixedPack ||
      registerParams.isRandomPack !== initialFormData.isRandomPack ||
      registerParams.selectedStorageProduct !==
        initialFormData.selectedStorageProduct
    );
  }, [registerParams, initialFormData]);

  return {
    selectedPack,
    setSelectedPack,
    registerParams,
    setRegisterParams,
    selectedStorageProduct,
    setSelectedStorageProduct,
    isDirty,
  };
};
