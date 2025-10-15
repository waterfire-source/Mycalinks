'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import dayjs from 'dayjs';
import { TransactionStatus } from '@prisma/client';
import TransactionKindRadioGroup from '@/feature/transaction/components/transactionList/TransactionKindRadioGroup';
import { AssignmentTurnedIn as AssignmentTurnedInIcon } from '@mui/icons-material';
import theme from '@/theme';
import { TransactionDetailModal } from '@/feature/transaction/components/TransactionDetailModal';
import { TransactionItem } from '@/feature/transaction/components/TransactionItem';

interface Props {
  customerId?: number;
  isShow?: boolean; //情報を見せるか見せないか
}

export default function MobileTransactionContentsCard({
  customerId,
  isShow = true,
}: Props) {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const [transactions, setTransactions] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions']
  >([]);
  const [selectTransaction, setSelectTransaction] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'][0] | null
  >(null);

  const [totalAmount, setTotalAmount] = useState({
    buy: 0,
    sell: 0,
  });
  const [status, setStatus] = useState<TransactionStatus | ''>('completed');
  const searchParams = useSearchParams();
  const transaction_kind = searchParams.get('transaction_kind');
  const [transactionKind, setTransactionKind] = useState<'buy' | 'sell' | ''>(
    () => {
      return transaction_kind === 'buy' || transaction_kind === 'sell'
        ? transaction_kind
        : '';
    },
  );

  const [transactionID, setTransactionID] = useState<string>(''); // 取引IDの状態を追加
  const [searchDate, setSearchDate] = useState({
    startDate: isShow
      ? dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss')
      : '', // 現在の日の00:00:00を初期値として設定
    endDate: dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'), // 現在の日の23:59:59を初期値として設定
  });
  const [searchProductName, setSearchProductName] = useState<string>(''); //商品名で検索

  //一覧検索処理
  const fetchTransactionData = useCallback(async () => {
    const response = await clientAPI.transaction.listTransactions({
      id: Number(transactionID) || undefined,
      store_id: store.id,
      status: status || undefined,
      transaction_kind: transactionKind || undefined,
      finishedAtStart: searchDate.startDate
        ? new Date(searchDate.startDate)
        : undefined,
      finishedAtEnd: searchDate.endDate
        ? new Date(searchDate.endDate)
        : undefined,
      includeSales: true,
      productName: searchProductName || undefined,
      customer_id: customerId || undefined,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    setTransactions(response.transactions);

    //合計額を計算
    if (response.sales.length > 0) {
      const totals = response.sales.reduce(
        (acc: any, { transaction_kind, total_price = 0 }: any) => {
          if (transaction_kind === 'buy') acc.buy += total_price;
          if (transaction_kind === 'sell') acc.sell += total_price;
          return acc;
        },
        { buy: 0, sell: 0 },
      );

      setTotalAmount(totals);
    } else {
      setTotalAmount({ buy: 0, sell: 0 });
    }
  }, [
    clientAPI.transaction,
    setAlertState,
    store.id,
    status,
    transactionKind,
    transactionID,
    searchDate,
    searchProductName,
    customerId,
  ]);

  useEffect(() => {
    if (store) {
      fetchTransactionData();
    }
  }, [fetchTransactionData, store]);

  const handleTransactionKindChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTransactionKind(event.target.value as 'buy' | 'sell' | '');
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prevState) => {
        return {
          ...prevState,
          startDate: dayjs(selectedDate)
            .startOf('day')
            .format('YYYY/MM/DD HH:mm:ss'),
        };
      });
    } else {
      setSearchDate((prevState) => {
        return {
          ...prevState,
          startDate: '',
        };
      });
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      setSearchDate((prevState) => {
        return {
          ...prevState,
          endDate: dayjs(selectedDate)
            .endOf('day')
            .format('YYYY/MM/DD HH:mm:ss'),
        };
      });
    } else {
      setSearchDate((prevState) => {
        return {
          ...prevState,
          endDate: '',
        };
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectTransaction(null);
  };

  return (
    <Stack
      flexDirection={'column'}
      gap={1}
      width={'100%'}
      height={'100%'}
      padding={'10px'}
    >
      <Stack
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Stack direction={'row'} gap={0}>
          <AssignmentTurnedInIcon sx={{ color: theme.palette.grey[700] }} />
          <Typography variant="body1">取引一覧</Typography>
        </Stack>
        <TransactionKindRadioGroup
          transactionKind={transactionKind}
          handleTransactionKindChange={handleTransactionKindChange}
          isShowLabel={false}
        />
      </Stack>

      <Stack flexDirection={'column'} gap={1}>
        <Stack flexDirection={'row'} gap={2}>
          <TextField
            label="取引ID"
            type="number"
            size="small"
            value={transactionID}
            onChange={(event) => setTransactionID(event.target.value)}
            sx={{ flex: 1, backgroundColor: 'white' }}
            InputLabelProps={{
              sx: {
                color: 'black',
                fontSize: '0.8rem',
              },
            }}
            InputProps={{
              sx: {
                height: '35px',
                fontSize: '0.8rem',
              },
            }}
          />
          <Stack flexDirection={'row'} gap={0} alignItems={'center'}>
            <TextField
              label="取引日時"
              type="date"
              size="small"
              value={
                searchDate.startDate
                  ? dayjs(searchDate.startDate).format('YYYY-MM-DD')
                  : ''
              }
              onChange={handleStartDateChange}
              sx={{ width: 100, backgroundColor: 'common.white' }}
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'common.black',
                  fontSize: '0.8rem',
                },
              }}
              InputProps={{
                sx: {
                  height: '35px',
                  fontSize: '0.6rem',
                },
              }}
            />
            <Typography>~</Typography>
            <TextField
              type="date"
              size="small"
              value={
                searchDate.endDate
                  ? dayjs(searchDate.endDate).format('YYYY-MM-DD')
                  : ''
              }
              onChange={handleEndDateChange}
              sx={{ width: 100, backgroundColor: 'common.white' }}
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'common.black',
                  fontSize: '0.8rem',
                },
              }}
              InputProps={{
                endAdornment: null,
                sx: {
                  height: '35px',
                  fontSize: '0.6rem',
                },
              }}
            />
          </Stack>
        </Stack>

        <TextField
          label="商品名"
          size="small"
          value={searchProductName}
          onChange={(event) => setSearchProductName(event.target.value)}
          sx={{ width: '100%', backgroundColor: 'white' }}
          InputLabelProps={{
            sx: {
              color: 'black',
              fontSize: '0.8rem',
            },
          }}
          InputProps={{
            sx: {
              height: '35px',
              fontSize: '0.8rem',
            },
          }}
        />

        <Stack
          flexDirection={'row'}
          gap={2}
          alignItems={'center'}
          marginTop={1}
        >
          <TextField
            label={'販売合計'}
            size="small"
            value={totalAmount.sell.toLocaleString() + '円'}
            onChange={handleStartDateChange}
            sx={{
              backgroundColor: 'common.white',
              color: 'primary.main',
              width: '100%',
            }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'common.black',
                fontSize: '0.8rem',
              },
            }}
            InputProps={{
              readOnly: true,
              sx: {
                color: 'secondary.main',
                height: '35px',
                fontSize: '0.6rem',
              },
            }}
          />

          <TextField
            label={'買取合計'}
            size="small"
            value={totalAmount.buy.toLocaleString() + '円'}
            onChange={handleStartDateChange}
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              width: '100%',
            }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'common.black',
                fontSize: '0.8rem',
              },
            }}
            InputProps={{
              readOnly: true,
              sx: {
                color: 'primary.main',
                height: '35px',
                fontSize: '0.6rem',
              },
            }}
          />
        </Stack>
      </Stack>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'common.black',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          overflowY: 'auto',
        }}
      >
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onDetailClick={() => {
                setSelectTransaction(transaction);
                setIsModalOpen(true);
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            取引データがありません。
          </Typography>
        )}
      </Box>

      {selectTransaction && (
        <TransactionDetailModal
          open={isModalOpen}
          onClose={handleModalClose}
          transactionID={selectTransaction.id}
        />
      )}
    </Stack>
  );
}
