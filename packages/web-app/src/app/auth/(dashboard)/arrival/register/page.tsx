'use client';
import { useSearchParams } from 'next/navigation';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { ArrivalRegisterItemButton } from '@/feature/arrival/register/arrivalRegisterItem/Button';
import { ArrivalSetting } from '@/feature/arrival/register/ArrivalSetting';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { CartTableComponent } from '@/feature/arrival/register/CartTableComponent';
import { useListStocking } from '@/feature/arrival/hooks/useListStocking';
import { StockingStatus } from '@prisma/client';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { useFetchProducts } from '@/feature/arrival/hooks/useFetchProducts';
import { useAlert } from '@/contexts/AlertContext';
import { useSaveLocalStorageRegister } from '@/app/auth/(dashboard)/arrival/register/hooks/useSaveLocalStorageRegister';

export interface CustomArrivalProductSearchType
  extends ArrivalProductSearchType {
  customId?: string;
}
const ArrivalRegisterPage = () => {
  const searchParams = useSearchParams();
  const { setAlertState } = useAlert();
  const taxTypeParam = searchParams.get('tax');
  const taxType = taxTypeParam === 'include' ? 'include' : 'exclude';
  const isTaxIncluded = taxType === 'include';
  const id = Number(searchParams.get('id'));

  const [selectedStocking, setSelectedStocking] = useState<
    BackendStockingAPI[5]['response']['200'][number] | null
  >(null);
  const {
    listStocking,
    stockings,
    isLoading: isLoadingStockings,
  } = useListStocking();
  const {
    fetchProducts,
    isLoading: isLoadingProducts,
    setProducts,
    products,
  } = useFetchProducts();
  const { saveLocalStorageItem, getLocalStorageItem } =
    useSaveLocalStorageRegister();

  const isLoading = isLoadingStockings || isLoadingProducts;

  // URLパラメータにidがある場合仕入れ情報を取得
  // ①仕入れ情報stockingsをフェッチ
  useEffect(() => {
    const fetchStocking = async () => {
      if (!id) return;
      if (stockings.length === 0) {
        const stocking = await listStocking({
          status: StockingStatus.NOT_YET,
          id,
        });

        if (!stocking)
          return setAlertState({
            message: '発注データが見つかりませんでした',
            severity: 'error',
          });

        setSelectedStocking(stocking.data[0]);
      }
    };

    fetchStocking();
  }, [id, listStocking, stockings.length]);

  // ③仕入れ情報が変更されたら仕入れ情報を取得
  useEffect(() => {
    if (!selectedStocking) return;
    fetchProducts(selectedStocking);
  }, [selectedStocking]);

  /**
   * ローカル保存機能
   */
  // --- localStorageからproductsを復元（新規登録時のみ） ---
  const NEW_REGISTER_ID = -1;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (id) return;

    const saved = getLocalStorageItem(NEW_REGISTER_ID, taxType);
    if (saved && saved.length > 0) {
      setProducts(saved);
    }
    setIsInitialLoad(false);
  }, [NEW_REGISTER_ID, id, setProducts, taxType]);

  // --- productsが変更されるたびにlocalStorageへ保存（新規登録時のみ、初回復元時は除く）
  useEffect(() => {
    if (id || isInitialLoad) return;
    saveLocalStorageItem(NEW_REGISTER_ID, taxType, products);
  }, [id, isInitialLoad, taxType, products, NEW_REGISTER_ID]);

  return (
    <ContainerLayout
      title="発注登録"
      helpArchivesNumber={780}
      actions={
        <Stack flexDirection="row" justifyContent="flex-end">
          <ArrivalRegisterItemButton setProducts={setProducts} />
        </Stack>
      }
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography color="primary.main" variant="body2">
          {isTaxIncluded ? '税込み価格で登録中' : '税抜き価格で登録中'}
        </Typography>
        {/* <TertiaryButton>CSVアップロード ※未実装</TertiaryButton> */}
      </Stack>

      <Stack
        flexDirection="row"
        gap={1}
        height="100%"
        width="100%"
        overflow="auto"
      >
        <Stack width="70%">
          <CartTableComponent
            products={products}
            setProducts={setProducts}
            isLoading={isLoading}
          />
        </Stack>
        <Stack width="30%">
          <ArrivalSetting
            products={products}
            setProducts={setProducts}
            isTaxIncluded={isTaxIncluded}
            selectedStocking={selectedStocking}
            idParam={id || ''}
          />
        </Stack>
      </Stack>
    </ContainerLayout>
  );
};

export default ArrivalRegisterPage;
