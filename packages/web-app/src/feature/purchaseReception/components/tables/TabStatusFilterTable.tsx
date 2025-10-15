import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TableContainer,
  Paper,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { useStore } from '@/contexts/StoreContext';
import { PurchaseReceptionDetailModal } from '@/feature/purchaseReception/components/modals/DetailModal';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import dayjs from 'dayjs';
import { DateRangeField } from '@/components/inputFields/DateRangeField';
import { TabStatusFilterTableBody } from '@/feature/purchaseReception/components/tables/TabStatusFilterTableBody';

export const TabStatusFilterTable: React.FC = () => {
  const { store } = useStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const {
    fetchAssessedTransactions,
    fetchUnassessedTransactions,
    fetchCompletedTransactions,
    assessedTransactions,
    unassessedTransactions,
    completedTransactions,
    isLoadingAssessed,
    isLoadingUnassessed,
    isLoadingCompleted,
  } = usePurchaseTransaction();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const [transactionStartDate, setTransactionStartDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );
  const [transactionEndDate, setTransactionEndDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );

  useEffect(() => {
    if (store.id) {
      const startDate = dayjs(transactionStartDate).startOf('day').toDate();
      const endDate = dayjs(transactionEndDate).endOf('day').toDate();
      fetchAssessedTransactions(store.id, startDate, endDate);
      fetchUnassessedTransactions(store.id, startDate, endDate);
      fetchCompletedTransactions(store.id, startDate, endDate);

      const intervalId = setInterval(() => {
        fetchAssessedTransactions(store.id, startDate, endDate);
        fetchUnassessedTransactions(store.id, startDate, endDate);
        fetchCompletedTransactions(store.id, startDate, endDate);
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [
    store.id,
    fetchAssessedTransactions,
    fetchUnassessedTransactions,
    fetchCompletedTransactions,
    transactionStartDate,
    transactionEndDate,
  ]);

  const allTransactions = [
    ...assessedTransactions.map((transaction) => ({
      ...transaction,
      displayStatus: '査定完了',
    })),
    ...unassessedTransactions.map((transaction) => ({
      ...transaction,
      displayStatus: '未査定',
    })),
    ...completedTransactions.map((transaction) => ({
      ...transaction,
      displayStatus: '会計済み',
    })),
  ];

  const filteredData = (() => {
    if (selectedTab === 0) {
      return unassessedTransactions.map((transaction) => ({
        ...transaction,
        displayStatus: '未査定',
      }));
    }
    if (selectedTab === 1) {
      return assessedTransactions.map((transaction) => ({
        ...transaction,
        displayStatus: '査定完了',
      }));
    }
    if (selectedTab === 2) {
      return completedTransactions.map((transaction) => ({
        ...transaction,
        displayStatus: '会計済み',
      }));
    }
    if (selectedTab === 3) {
      return allTransactions.sort((a, b) => {
        const aHasReception = a.reception_number != null;
        const bHasReception = b.reception_number != null;

        // 1. reception_number の有無で並べる（あるものを先に）
        if (aHasReception && !bHasReception) return -1;
        if (!aHasReception && bHasReception) return 1;

        // 2. どちらも同じなら created_at の降順
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
      });
    }
    return [];
  })();

  const isLoading =
    isLoadingAssessed || isLoadingUnassessed || isLoadingCompleted;

  const [transaction, setTransaction] =
    useState<BackendTransactionAPI[5]['response']['200']['transactions'][0]>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTransaction(undefined);
  };

  // バッジのコンポーネント
  const CustomBadge = ({ title, count }: { title: string; count: number }) => {
    return (
      <Stack direction="row" alignItems="center">
        <span>{title}</span>
        <span className="badge" style={{ marginRight: '0px' }}>
          {count > 99 ? '99+' : count}
        </span>
      </Stack>
    );
  };

  return (
    <Box sx={{ pt: 1 }} flex={1}>
      <Box
        sx={{
          borderBottom: '8px solid #b82a2a',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          TabIndicatorProps={{ style: { display: 'none' } }}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
        >
          <CustomTabTableStyle
            sx={{ width: '150px' }}
            label={
              unassessedTransactions.length > 0 ? (
                <CustomBadge
                  title="未査定"
                  count={unassessedTransactions.length}
                />
              ) : (
                <Typography>未査定</Typography>
              )
            }
          />
          <CustomTabTableStyle
            sx={{ width: '150px' }}
            label={
              assessedTransactions.length > 0 ? (
                <CustomBadge
                  title="査定完了"
                  count={assessedTransactions.length}
                />
              ) : (
                <Typography>査定完了</Typography>
              )
            }
          />
          <CustomTabTableStyle
            sx={{ width: '150px' }}
            label={
              completedTransactions.length > 0 ? (
                <CustomBadge
                  title="会計済み"
                  count={completedTransactions.length}
                />
              ) : (
                <Typography>会計済み</Typography>
              )
            }
          />
          <CustomTabTableStyle
            sx={{ width: '150px' }}
            label={
              allTransactions.length > 0 ? (
                <CustomBadge title="すべて" count={allTransactions.length} />
              ) : (
                <Typography>すべて</Typography>
              )
            }
          />
        </Tabs>
      </Box>

      <Box
        sx={{
          width: '100%',
          backgroundColor: 'white',
          padding: 2,
        }}
      >
        <DateRangeField
          startLabel="受付日時"
          endLabel=""
          startDate={transactionStartDate}
          endDate={transactionEndDate}
          setStartDate={(date) =>
            setTransactionStartDate(
              dayjs(date).startOf('day').format('YYYY-MM-DD'),
            )
          }
          setEndDate={(date) =>
            setTransactionEndDate(dayjs(date).endOf('day').format('YYYY-MM-DD'))
          }
        />
      </Box>

      <TableContainer component={Paper} sx={{ height: 'calc(100vh - 250px)' }}>
        {isLoading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', padding: '16px' }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <TabStatusFilterTableBody
            filteredData={filteredData}
            setTransaction={setTransaction}
            setIsModalOpen={setIsModalOpen}
            refetch={() => {
              const startDate = dayjs(transactionStartDate).startOf('day').toDate();
              const endDate = dayjs(transactionEndDate).endOf('day').toDate();
              fetchAssessedTransactions(store.id, startDate, endDate);
              fetchUnassessedTransactions(store.id, startDate, endDate);
              fetchCompletedTransactions(store.id, startDate, endDate);
            }}
          />
        )}
      </TableContainer>

      {transaction && (
        <PurchaseReceptionDetailModal
          open={isModalOpen}
          onClose={handleModalClose}
          transaction={transaction}
          onConfirmClick={() => {
            handleModalClose();
          }}
        />
      )}
    </Box>
  );
};
