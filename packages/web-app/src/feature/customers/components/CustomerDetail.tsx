// TODO: カテゴリごとの取引回を表示する（バックエンド待ち）
'use client';
import { Box, Typography } from '@mui/material';
import { CustomError, createClientAPI } from '@/api/implement';
import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { CustomerData } from '@/app/auth/(dashboard)/customers/page';
import { CustomerTransactionModal } from '@/components/modals/customers/CustomerTransactionModal';
import { TransactionStatus, TransactionKind } from '@prisma/client';
import {
  // CustomerDetailPaper,
  TransactionCounts,
  TotalAmount,
  DepartmentTransactionKind,
} from '@/feature/customers/components/CustomerDetailPaper';
import { CustomerBasicInformation } from '@/feature/customers/components/CustomerBasicInformation';
import { CustomerTransactionInformation } from '@/feature/customers/components/CustomerTransactionInformation';
import { CustomerVisitInformation } from '@/feature/customers/components/CustomerVisitInformation';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CustomerMemoInformation } from '@/feature/customers/components/CustomerMemoInformation';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';

interface Props {
  customer: CustomerData | null;
  fetchCustomerData: () => Promise<void>;
}

export const CustomerDetail = ({ customer, fetchCustomerData }: Props) => {
  const clientAPI = createClientAPI();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [isCustomerTransactionModalOpen, setIsCustomerTransactionModalOpen] =
    useState<boolean>(false);

  const [totalAmount, setTotalAmount] = useState<TotalAmount>({
    buy: 0,
    sell: 0,
  });
  const [transactionCounts, setTransactionCounts] = useState<TransactionCounts>(
    {
      visit: 0,
      sell: 0,
      buy: 0,
    },
  );
  const [stats, setStats] = useState<{
    groupByItemGenreTransactionKind?: Array<DepartmentTransactionKind>;
  }>({});

  const handleCloseCustomerTransactionModal = () => {
    setIsCustomerTransactionModalOpen(false);
  };

  const handleSaveMemo = async (memo: string) => {
    if (!customer) return;

    const response = await clientAPI.customer.updateCustomer({
      store_id: store.id,
      customer_id: customer.id,
      memo,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    setAlertState({
      message: 'メモを更新しました',
      severity: 'success',
    });
    fetchCustomerData();
  };

  const fetchTransactionData = async () => {
    if (!customer) return;
    setStats({});

    const response = await clientAPI.transaction.listTransactions({
      store_id: store.id,
      customer_id: customer.id,
      includeSales: true,
      status: TransactionStatus.completed,
      includeStats: true,
      take: -1,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }
    const { totals } = response.sales.reduce(
      (acc: any, { transaction_kind, total_price = 0 }: any) => {
        if (transaction_kind === TransactionKind.buy) {
          acc.totals.buy += total_price;
        }
        if (transaction_kind === TransactionKind.sell) {
          acc.totals.sell += total_price;
        }
        return acc;
      },
      { totals: { buy: 0, sell: 0 } },
    );

    const counts = response.transactions.reduce(
      (acc: any, { transaction_kind }: any) => {
        if (transaction_kind === TransactionKind.buy) {
          acc.buy++;
        }
        if (transaction_kind === TransactionKind.sell) {
          acc.sell++;
        }
        acc.visit++;
        return acc;
      },
      { visit: 0, buy: 0, sell: 0 },
    );

    setTotalAmount(totals);
    setTransactionCounts(counts);
    setStats(response.stats);
  };

  const transactionDetailTitle = `会員名: ${customer?.full_name ?? ''}${
    customer?.full_name_ruby ? ` (${customer.full_name_ruby})` : ''
  } 取引一覧`;

  useEffect(() => {
    fetchTransactionData();
    // 顧客ごとにデータを取得するため、customerが変更されたらデータを取得する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const { pushQueue } = useLabelPrinterHistory();

  const handleClickPrintCustomerCard = () => {
    if (!customer) return;

    pushQueue({
      template: 'customer',
      data: customer.id,
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          textAlign: 'left',
          height: '60px',
          width: '100%',
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography
          sx={{
            textAlign: 'left',
            ml: 2.5,
            fontWeight: 'bold',
          }}
        >
          顧客詳細
        </Typography>
      </Box>

      {customer ? (
        <>
          <Box sx={{ m: 2, flexGrow: 1, overflow: 'auto', pb: 2 }}>
            <CustomerBasicInformation customer={customer} />
            <CustomerVisitInformation
              customer={customer}
              transactionCounts={transactionCounts}
              totalAmount={totalAmount}
            />
            <CustomerTransactionInformation stats={stats} />
            <CustomerMemoInformation
              customer={customer}
              onSave={handleSaveMemo}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              boxShadow: '0 -3px 6px rgba(0, 0, 0, 0.1)',
              py: 1,
              px: 1.5,
              alignItems: 'center',
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Box>
              {!customer.myca_user_id ? (
                <SecondaryButton
                  onClick={handleClickPrintCustomerCard}
                  sx={{ py: 0.7, px: 1.5 }}
                >
                  仮会員証印刷
                </SecondaryButton>
              ) : undefined}
            </Box>
            <PrimaryButton
              sx={{ py: 0.7, px: 1.5 }}
              onClick={() => {
                setIsCustomerTransactionModalOpen(true);
              }}
            >
              取引詳細
            </PrimaryButton>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mt: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ ml: 0.5 }}>選択して詳細を表示</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              height: '60px',
              width: '100%',
              minHeight: '50px',
              boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.2)',
              marginTop: 'auto',
            }}
          ></Box>
        </>
      )}
      <CustomerTransactionModal
        open={isCustomerTransactionModalOpen}
        onClose={handleCloseCustomerTransactionModal}
        customerId={customer?.id || 0}
        title={transactionDetailTitle}
      />
    </Box>
  );
};
