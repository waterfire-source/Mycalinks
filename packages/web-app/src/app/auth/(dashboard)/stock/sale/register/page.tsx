'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useSearchParams } from 'next/navigation';
import { SaleInfo } from '@/feature/stock/sale/register/components/SaleInfo';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { Box, Card, CardContent, CircularProgress } from '@mui/material';
import { CustomError } from '@/api/implement';
import { TransactionKind, SaleStatus, SaleRule } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TargetProduct } from '@/feature/stock/sale/register/components/TargetProduct';
import { useSale } from '@/feature/stock/sale/hooks/useSale';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

export interface SaleItem {
  id: number | null;
  storeId: number;
  status: SaleStatus;
  onPause: boolean;
  displayName: string;
  transactionKind: TransactionKind;
  startDatetime: Date;
  discountAmount: string | null;
  endDatetime: Date | null;
  endTotalItemCount: number | null;
  endUnitItemCount: number | null;
  repeatCronRule: string | null;
  saleEndDatetime: Date | null;
  products: Array<{
    rule: SaleRule;
    productId: number;
    productName: string;
    productDisplayNameWithMeta: string;
  }>;
  departments: Array<{
    rule: SaleRule;
    itemGenreId: number;
    itemGenreDisplayName: string;
    itemCategoryId: number;
    itemCategoryDisplayName: string;
  }>;
}

export default function RegisterSale() {
  // URLパラメータからセールIDとコピーフラグを取得
  const searchParams = useSearchParams();
  const saleId = searchParams.get('id');
  const isCopy = searchParams.get('copy');

  // ストアコンテキストから店舗情報を取得
  const { store } = useStore();

  // ローディング状態の管理
  const [isLoading, setIsLoading] = useState(false);

  // 選択中のセール情報の状態管理
  const initialFormData = useMemo<SaleItem>(
    () => ({
      id: null,
      storeId: store?.id,
      status: SaleStatus.ON_HELD,
      onPause: false,
      displayName: '',
      transactionKind: TransactionKind.sell,
      startDatetime: dayjs().toDate(),
      discountAmount: null,
      endDatetime: null,
      endTotalItemCount: null,
      endUnitItemCount: null,
      repeatCronRule: null,
      saleEndDatetime: null,
      products: [],
      departments: [],
    }),
    [store?.id],
  );
  const [selectedSale, setSelectedSale] = useState<SaleItem>(initialFormData);

  // フォームデータに変更があるか
  const isDirty = useMemo(() => {
    const normalize = (item: SaleItem) => ({
      ...item,
      startDatetime: item.startDatetime
        ? dayjs(item.startDatetime).toISOString()
        : null,
      endDatetime: item.endDatetime
        ? dayjs(item.endDatetime).toISOString()
        : null,
      saleEndDatetime: item.saleEndDatetime
        ? dayjs(item.saleEndDatetime).toISOString()
        : null,
    });

    return (
      JSON.stringify(normalize(selectedSale)) !==
      JSON.stringify(normalize(initialFormData))
    );
  }, [selectedSale, initialFormData]);

  const { fetchSales } = useSale();

  // セールの取得
  useEffect(() => {
    const fetchSaleData = async () => {
      if (saleId && store?.id) {
        setIsLoading(true);
        const sale = await fetchSales(store.id, {
          id: Number(saleId),
        });
        setIsLoading(false);
        if (sale instanceof CustomError) return;
        setSelectedSale(sale[0]);
      }
    };
    fetchSaleData();
    // 画面遷移時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id]);

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  useEffect(() => {
    setModalVisible(isDirty);
  }, [isDirty, setModalVisible]);

  return (
    <ContainerLayout
      title={
        !isCopy && saleId
          ? 'セール・キャンペーン編集'
          : '新規セール・キャンペーン作成'
      }
      helpArchivesNumber={785}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: '100%',
          mb: 2,
        }}
      >
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <SaleInfo
                saleSettings={selectedSale}
                setSaleSettings={setSelectedSale}
              />
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
              <TargetProduct
                selectedSale={selectedSale}
                setSelectedSale={setSelectedSale}
              />
            </CardContent>
          )}
        </Card>
      </Box>
    </ContainerLayout>
  );
}
