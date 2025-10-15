'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Box, Typography, Button, CircularProgress } from '@mui/material';
import DataTable from '@/components/tables/DataTable';
import AlertConfirmationModal from '@/components/modals/AlertConfirmationModal';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { getRepeatPatternLabel } from '@/feature/sale/utils/repeatPatternUtils';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { SaleAPI } from '@/api/frontend/sale/api';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/page';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { PATH } from '@/constants/paths';
import { useSale } from '@/feature/stock/sale/hooks/useSale';
import { ItemText } from '@/feature/item/components/ItemText';

dayjs.locale('ja');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

// 商品情報の型定義
interface Product {
  id: number;
  displayNameWithMeta: string;
  price: string;
  condition: string;
  discount: string;
}

// セール詳細の型定義
interface SaleDetails {
  products: Product[];
}

// Modal の props 定義（SaleItem 型の selectedSale を受け取ります）
interface SaleItemDetailModalProps {
  open: boolean;
  onClose: () => void;
  saleListType: 'active' | 'completed';
  selectedSale: SaleItem | null;
  updateSales: () => void;
}

export default function SaleItemDetailModal({
  open,
  onClose,
  saleListType,
  selectedSale,
  updateSales,
}: SaleItemDetailModalProps) {
  const router = useRouter();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [saleDetails, setSaleDetails] = useState<SaleDetails | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertType, setAlertType] = useState<'cancel' | 'delete' | null>(null);
  const clientAPI = createClientAPI();
  const { updateSale, deleteSale } = useSale();

  const productColumns: GridColDef[] = useMemo(
    () => [
      {
        field: 'displayNameWithMeta',
        headerName: '商品名',
        minWidth: 150,
        flex: 0.5,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => <ItemText text={params.value} />,
      },
      {
        field: 'condition',
        headerName: '状態',
        minWidth: 150,
        flex: 0.2,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => params.value || '-',
      },
      {
        field: 'price',
        headerName: '単価',
        minWidth: 120,
        flex: 0.2,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => params.value || '-',
      },
      {
        field: 'discount',
        headerName: selectedSale?.transactionKind === 'buy' ? '増額' : '割引き',
        minWidth: 100,
        flex: 0.1,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value as string;
          return value || '-';
        },
      },
    ],
    // セールの種類によって表示するカラムを変える
    [selectedSale?.transactionKind],
  );

  // モーダルが開いたとき、かつ selectedSale があるときのみ詳細を取得
  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!open || !selectedSale) return;
      setIsLoading(true);
      // 商品情報取得
      let productsDetail = null;
      if (selectedSale.products && selectedSale.products.length > 0) {
        productsDetail = await clientAPI.product.listProducts({
          storeID: store.id,
          id: selectedSale.products?.map((product) => product.productId),
        });
        if (productsDetail instanceof CustomError) {
          setAlertState({
            message: productsDetail.message,
            severity: 'error',
          });
          setIsLoading(false);
          return;
        }
      }

      // 商品情報取得
      const products: Product[] =
        productsDetail && 'products' in productsDetail
          ? productsDetail.products.map((product) => ({
              id: product.id,
              displayNameWithMeta: product.displayNameWithMeta,
              price:
                selectedSale?.transactionKind === 'buy'
                  ? product.buy_price
                    ? `${product.buy_price.toLocaleString()}円`
                    : '-'
                  : product.sell_price
                  ? `${product.sell_price.toLocaleString()}円`
                  : '-',
              condition: product.condition_option_display_name || '-',
              discount: selectedSale.discountAmount
                ? selectedSale.discountAmount.startsWith('-')
                  ? `${selectedSale.discountAmount.slice(1)}円`
                  : selectedSale.discountAmount.endsWith('%')
                  ? `${Math.abs(100 - parseInt(selectedSale.discountAmount))}%`
                  : `${selectedSale.discountAmount}円`
                : '',
            }))
          : [];

      setSaleDetails({ products });
      setIsLoading(false);
    };
    fetchSaleDetails();
    // モーダルが開いたときのみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateRequestBody =
    useCallback((): SaleAPI['updateSale']['request']['body'] => {
      if (!selectedSale) return {} as SaleAPI['updateSale']['request']['body'];
      return {
        id: selectedSale.id,
        displayName: selectedSale.displayName,
        transactionKind: selectedSale.transactionKind,
        startDatetime: selectedSale.startDatetime,
        endDatetime: selectedSale.endDatetime,
        discountAmount: selectedSale.discountAmount,
        endTotalItemCount: selectedSale.endTotalItemCount,
        endUnitItemCount: selectedSale.endUnitItemCount,
        repeatCronRule: selectedSale.repeatCronRule,
        saleEndDatetime: selectedSale.saleEndDatetime,
        products:
          selectedSale.products?.map((p) => ({
            productId: p.productId,
            rule: p.rule,
          })) || [],
        departments: [],
        onPause: true,
      };
    }, [selectedSale]);

  const handleNavigation = (path: string): void => {
    router.push(path);
    onClose();
  };

  const handleResumeSale = async (): Promise<void> => {
    const requestBody = updateRequestBody();
    const result = await updateSale(
      {
        storeID: store.id,
        body: {
          ...requestBody,
          onPause: false,
        },
      },
      'セールを再開しました',
    );
    if (result instanceof CustomError) return;
    updateSales();
    onClose();
  };

  const handleCancelSale = async (): Promise<void> => {
    setAlertType('cancel');
    setIsAlertOpen(true);
  };

  const handleDeleteSale = (): void => {
    setAlertType('delete');
    setIsAlertOpen(true);
  };

  const handleCloseAlert = (): void => {
    setIsAlertOpen(false);
  };

  const handleConfirmAction = async (): Promise<void> => {
    if (!selectedSale) return;
    let result;
    // 削除ボタンが押された場合
    if (alertType === 'delete') {
      result = await deleteSale({
        storeID: store.id,
        saleID: selectedSale.id,
      });
    }
    // キャンセルボタンが押された場合
    else if (alertType === 'cancel') {
      const requestBody = updateRequestBody();
      result = await updateSale(
        {
          storeID: store.id,
          body: {
            ...requestBody,
            onPause: true,
          },
        },
        'セールを中止しました',
      );
    }
    // エラーの場合はエラーメッセージを表示
    if (result instanceof CustomError) return;
    updateSales();
    onClose();
    setIsAlertOpen(false);
  };

  return (
    <>
      <CustomModalWithIcon
        open={open}
        onClose={onClose}
        title="セール詳細"
        width="90%"
        sx={{ maxHeight: '90%' }}
        hideButtons={true}
      >
        <Box sx={{ p: 4, width: '100%' }}>
          {saleDetails && !isLoading ? (
            <>
              <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography sx={{ mb: 2 }}>
                    セール名：{selectedSale?.displayName}{' '}
                    {selectedSale?.transactionKind === 'buy'
                      ? '（買取）'
                      : '（販売）'}
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    対象店舗：{store?.display_name || ''}
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    開始日時：
                    {selectedSale
                      ? dayjs(selectedSale.startDatetime).format(
                          'YYYY/MM/DD HH:mm',
                        )
                      : ''}
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    終了日時：
                    {selectedSale && selectedSale.endDatetime
                      ? dayjs(selectedSale.endDatetime).format(
                          'YYYY/MM/DD HH:mm',
                        )
                      : 'なし'}
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    繰り返し：
                    {(() => {
                      const pattern = getRepeatPatternLabel(
                        selectedSale?.repeatCronRule || '',
                        selectedSale?.endDatetime || undefined,
                      );
                      return (
                        <span>
                          {pattern.frequency}
                          {pattern.end &&
                            `（${dayjs(pattern.end).format(
                              'YYYY/MM/DD',
                            )}まで）`}
                          {pattern.weekdays &&
                            pattern.weekdays.length > 0 &&
                            ` ${pattern.weekdays.join('、')}`}
                          {pattern.day && ` ${pattern.day}`}
                        </span>
                      );
                    })()}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      flex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        mr: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                      }}
                    >
                      <Typography sx={{ mb: 1, mr: 2 }}>対象商品：</Typography>
                      <Box
                        sx={{
                          flexGrow: 1,
                          height: '300px',
                          width: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            borderTop: '4px solid #b82a2a',
                            bgcolor: 'white',
                          }}
                        ></Box>
                        <DataTable
                          columns={productColumns}
                          rows={saleDetails.products}
                          sx={{ height: '100%', width: '100%' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  left: 0,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleDeleteSale}
                  size="small"
                  sx={{
                    m: 1,
                    backgroundColor: 'grey.300',
                    minWidth: '100px',
                    color: 'grey.700',
                    '&:hover': {
                      backgroundColor: 'grey.500',
                      color: 'grey.800',
                    },
                  }}
                >
                  セール削除
                </Button>
                {saleListType === 'active' ? (
                  <>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={
                        selectedSale?.onPause
                          ? handleResumeSale
                          : handleCancelSale
                      }
                      size="small"
                      sx={{
                        m: 1,
                        backgroundColor: 'grey.500',
                        '&:hover': {
                          backgroundColor: 'grey.700',
                        },
                        minWidth: '100px',
                      }}
                    >
                      {selectedSale?.onPause ? 'セール再開' : 'セール中止'}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleNavigation(
                          `${PATH.STOCK.sale.register}?type=item&id=${selectedSale?.id}`,
                        )
                      }
                      size="small"
                      sx={{ minWidth: '100px', m: 1 }}
                    >
                      編集
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleNavigation(
                        `${PATH.STOCK.sale.register}?type=item&id=${selectedSale?.id}&copy=true`,
                      )
                    }
                    size="small"
                    sx={{ minWidth: '100px', m: 1 }}
                  >
                    このセールから新しいセールを作成
                  </Button>
                )}
              </Box>
            </>
          ) : (
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
          )}
        </Box>
      </CustomModalWithIcon>
      <AlertConfirmationModal
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        onConfirm={handleConfirmAction}
        message={
          alertType === 'cancel'
            ? '開催中のセールです。本当に中止しますか？'
            : selectedSale &&
              selectedSale.status === 'ON_HELD' &&
              !selectedSale.onPause
            ? '開催中のセールです。本当に削除しますか？'
            : '本当に削除しますか？'
        }
        confirmButtonText={alertType === 'cancel' ? '中止' : '削除'}
        cancelButtonText="キャンセル"
      />
    </>
  );
}
