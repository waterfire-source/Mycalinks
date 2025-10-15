'use client';

import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, TextField } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  TransactionCartType,
  useTransaction,
} from '@/feature/transaction/hooks/useTransaction';
import { useStore } from '@/contexts/StoreContext';
import { InfiniteScrollTable } from '@/components/tables/InfiniteScrollTable';
import { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { TransactionPaymentMethod } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { ItemText } from '@/feature/item/components/ItemText';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface ConsignmentSalesHistoryModalProps {
  open: boolean;
  onClose: () => void;
  consignmentClient: any;
}

export const ConsignmentSalesHistoryModal = ({
  open,
  onClose,
  consignmentClient,
}: ConsignmentSalesHistoryModalProps) => {
  const { isLoading, fetchConsignmentSalesHistory } = useTransaction();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [salesHistory, setSalesHistory] = useState<TransactionCartType[]>([]);
  // 販売合計＆買取合計
  const [totalAmount, setTotalAmount] = useState({
    totalSalePrice: 0,
    totalConsignmentCommissionPrice: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [searchParams, setSearchParams] = useState({
    productDisplayName: '',
    startDate: dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
    endDate: dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
  });

  const ITEMS_PER_PAGE = 50;

  const fetchSalesHistory = async (resetData = true) => {
    if (!consignmentClient || !store?.id) return;

    setLoading(true);
    try {
      const startDate = dayjs(searchParams.startDate)
        .startOf('day')
        .format('YYYY/MM/DD HH:mm:ss');
      const endDate = dayjs(searchParams.endDate)
        .endOf('day')
        .format('YYYY/MM/DD HH:mm:ss');
      const currentOffset = resetData ? 0 : offset;

      const result = await fetchConsignmentSalesHistory({
        storeId: store.id,
        consignmentClientId: consignmentClient.id,
        productDisplayName:
          searchParams.productDisplayName === ''
            ? undefined
            : searchParams.productDisplayName,
        finishedAtStart: startDate,
        finishedAtEnd: endDate,
        take: ITEMS_PER_PAGE,
        skip: currentOffset,
      });

      if (result && result.transactionCarts.length > 0) {
        if (resetData) {
          setSalesHistory(result.transactionCarts);
          setOffset(ITEMS_PER_PAGE);
        } else {
          setSalesHistory((prev) => [...prev, ...result.transactionCarts]);
          setOffset((prev) => prev + ITEMS_PER_PAGE);
        }

        // より多くのデータがあるかチェック
        setHasMore(result.transactionCarts.length === ITEMS_PER_PAGE);
      }

      if (result?.sales) {
        setTotalAmount({
          totalSalePrice: result.sales.total_sale_price,
          totalConsignmentCommissionPrice:
            result.sales.total_consignment_commission_price,
        });
      } else {
        setTotalAmount({
          totalSalePrice: 0,
          totalConsignmentCommissionPrice: 0,
        });
      }

      return result;
    } catch (error) {
      setAlertState({
        message:
          error instanceof Error
            ? error.message
            : '委託者の販売履歴取得に失敗しました',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreItems = () => {
    if (!loading && hasMore) {
      fetchSalesHistory(false);
    }
  };

  const handleSearch = () => {
    setSalesHistory([]);
    setOffset(0);
    setHasMore(true);
    fetchSalesHistory(true);
  };

  useEffect(() => {
    handleSearch();
  }, [searchParams.startDate, searchParams.endDate]);

  useEffect(() => {
    if (open && consignmentClient) {
      fetchSalesHistory(true);
    }
  }, [open, consignmentClient]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}/${String(date.getDate()).padStart(2, '0')}\n${String(
      date.getHours(),
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!consignmentClient) return null;

  const translatePaymentMethod = (method: TransactionPaymentMethod): string => {
    switch (method) {
      case TransactionPaymentMethod.cash:
        return '現金';
      case TransactionPaymentMethod.bank:
        return '銀行振込';
      case TransactionPaymentMethod.square:
        return 'カード';
      case TransactionPaymentMethod.paypay:
        return 'QR決済';
      case TransactionPaymentMethod.felica:
        return '電子マネー';
      default:
        return '-';
    }
  };

  const handleModalClose = () => {
    onClose();
    setSearchParams({
      productDisplayName: '',
      startDate: dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      endDate: dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    });
    setSalesHistory([]);
    setTotalAmount({
      totalSalePrice: 0,
      totalConsignmentCommissionPrice: 0,
    });
    setOffset(0);
  };

  const columns: GridColDef[] = [
    {
      field: 'finished_at',
      headerName: '取引日時',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {formatDate(row.transaction?.finished_at)}
        </Typography>
      ),
    },
    {
      field: 'transaction_id',
      headerName: '取引ID',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: 'display_name',
      headerName: '商品名',
      flex: 2,
      headerAlign: 'center',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ItemImage imageUrl={params.row.product.image_url || null} fill />
          <Stack sx={{ pl: 3 }}>
            <ItemText text={params.row.product.displayNameWithMeta} />
          </Stack>
        </Box>
      ),
    },
    {
      field: 'consignment_sale_unit_price',
      headerName: '販売金額',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => `${params.value.toLocaleString()}円`,
    },
    {
      field: 'item_count',
      headerName: '販売点数',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => `${params.value}点`,
    },
    {
      field: 'payment_method',
      headerName: '決済方法',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row }) => (
        <Typography variant="body2" textAlign="center">
          {translatePaymentMethod(row.transaction?.payment_method)}
        </Typography>
      ),
    },
    {
      field: 'consignment_commission_unit_price',
      headerName: '委託手数料',
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => `${params.value.toLocaleString()}円`,
    },
  ];

  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleModalClose}
      title={`${consignmentClient?.full_name || '委託者名'} 販売履歴`}
      width="90%"
      height="90%"
      hideButtons={true}
    >
      <Stack sx={{ height: '100%', mx: -2, my: -2 }}>
        {/* 検索エリア */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            size="small"
            placeholder="商品名"
            value={searchParams.productDisplayName}
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                productDisplayName: e.target.value,
              })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            sx={{ width: '200px', backgroundColor: 'white' }}
          />
          <PrimaryButton sx={{ height: '100%' }} onClick={handleSearch}>
            検索
          </PrimaryButton>
          <TextField
            size="small"
            type="date"
            value={
              searchParams.startDate
                ? dayjs(searchParams.startDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                startDate: dayjs(e.target.value)
                  .startOf('day')
                  .format('YYYY/MM/DD HH:mm:ss'),
              })
            }
            sx={{ backgroundColor: 'white' }}
          />
          <Typography>～</Typography>

          <TextField
            size="small"
            type="date"
            value={
              searchParams.endDate
                ? dayjs(searchParams.endDate).format('YYYY-MM-DD')
                : ''
            }
            onChange={(e) =>
              setSearchParams({
                ...searchParams,
                endDate: dayjs(e.target.value)
                  .startOf('day')
                  .format('YYYY/MM/DD HH:mm:ss'),
              })
            }
            sx={{ backgroundColor: 'white' }}
          />
          <TextField
            label="売上売価の合計"
            value={`${totalAmount.totalSalePrice.toLocaleString()}円`}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            size="small"
            sx={{
              width: 130,
              backgroundColor: 'white',
              '& .MuiInputBase-input': {
                color: 'red',
                textAlign: 'right',
                fontSize: '0.875rem',
              },
              '& .MuiInputLabel-root': {
                color: 'black',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
              },
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="委託手数料の合計"
            value={`${totalAmount.totalConsignmentCommissionPrice.toLocaleString()}円`}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            size="small"
            sx={{
              width: 130,
              backgroundColor: 'white',
              '& .MuiInputBase-input': {
                color: 'blue',
                textAlign: 'right',
                fontSize: '0.875rem',
              },
              '& .MuiInputLabel-root': {
                color: 'black',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
              },
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        {/* 販売履歴テーブル */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingX: 2,
          }}
        >
          <InfiniteScrollTable
            columns={columns}
            items={salesHistory}
            loadMoreItems={loadMoreItems}
            hasMore={hasMore}
            isLoading={loading || isLoading}
          />
        </Box>
      </Stack>
    </CustomModalWithIcon>
  );
};
