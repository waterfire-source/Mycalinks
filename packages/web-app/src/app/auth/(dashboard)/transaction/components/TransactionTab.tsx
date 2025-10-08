import { Box, Tooltip, Typography } from '@mui/material';
import TagLabel from '@/components/common/TagLabel';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { TransactionPaymentMethod, TransactionKind } from '@prisma/client';
import dayjs from 'dayjs';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { ListTransactionsSearchState } from '@/app/auth/(dashboard)/transaction/components/TransactionContentsCard';
import Image from 'next/image';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { getTransactionApi } from 'api-generator';
import z from 'zod';
import { useRegisters } from '@/app/hooks/useRegisters';

type GetTransactionResponse = z.infer<typeof getTransactionApi.response>;
type MycaPosTransactionItem = GetTransactionResponse['transactions'][number];
type BackendTransactionItem =
  BackendTransactionAPI[5]['response']['200']['transactions'][number];

interface TransactionTabProps {
  transactions: MycaPosTransactionItem[];
  selectedTransaction: BackendTransactionItem | null;
  setSelectedTransaction: (
    selectedTransaction: MycaPosTransactionItem | null,
  ) => void;
  setSelectedPaymentMethodKey: (
    newPaymentMethodKey: TransactionPaymentMethod | undefined,
  ) => void;
  onTabChange: (transactionKindKey: string) => void;
  isLoading: boolean;
  searchTotalCount: number;
  searchState: ListTransactionsSearchState;
  setSearchState: React.Dispatch<
    React.SetStateAction<ListTransactionsSearchState>
  >;
  onShowOriginalTransaction?: (
    originalTransactionId: number | undefined,
  ) => void;
}

export const TransactionTab = ({
  transactions,
  searchTotalCount,
  searchState,
  setSearchState,
  selectedTransaction,
  setSelectedTransaction,
  setSelectedPaymentMethodKey,
  onTabChange: handleTabChange,
  isLoading,
  onShowOriginalTransaction,
}: TransactionTabProps) => {
  const { registers } = useRegisters();

  // 支払い方法
  const paymentMethodKeyValue =
    mycaPosCommonConstants.displayNameDict.transaction.payment_method.enum;
  const getPaymentMethodValue = (
    paymentMethodKey: TransactionPaymentMethod | '' | null,
  ): string => {
    return paymentMethodKey ? paymentMethodKeyValue[paymentMethodKey] : '';
  };
  const getPaymentMethodKey = (
    paymentMethodValue: string,
  ): TransactionPaymentMethod | undefined => {
    const entry = Object.entries(paymentMethodKeyValue).find(
      ([_, value]) => value === paymentMethodValue,
    );
    return entry ? (entry[0] as TransactionPaymentMethod) : undefined;
  };
  // 支払い方法フィルタリング用
  const handlePaymentMethodKeyChange = (paymentMethodValue: string) => {
    setSearchState((prev) => ({
      ...prev,
      searchCurrentPage: 0,
    }));
    setSelectedPaymentMethodKey(getPaymentMethodKey(paymentMethodValue));
  };

  // 元取引を表示する関数
  const handleShowOriginalTransaction = (originalTransactionId: number) => {
    const originalTransaction = transactions.find(
      (t) => t.id === originalTransactionId,
    );
    if (originalTransaction) {
      setSelectedTransaction(originalTransaction);
    }
  };
  // ------------------- カラム定義 -------------------
  const transactionColumns: ColumnDef<MycaPosTransactionItem>[] = [
    {
      header: '取引ID',
      key: 'id',
      render: (item) => {
        const id = item.id;
        const receptionNumber = item.reception_number;
        return (
          <Typography>
            {id}
            {receptionNumber &&
              item.transaction_kind === TransactionKind.buy && (
                <Typography component="span" sx={{ ml: 1 }}>
                  ({receptionNumber})
                </Typography>
              )}
          </Typography>
        );
      },
    },
    {
      header: '取引種類',
      key: 'transaction_kind',
      render: (item) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            padding: '6px 12px',
          }}
        >
          <TagLabel
            backgroundColor={
              item.is_return || item.return_transaction_id !== null
                ? 'grey.700'
                : item.transaction_kind === 'sell'
                ? 'secondary.main'
                : 'primary.main'
            }
            color="white"
            width="100%"
            height="80%"
            fontSize="0.875rem"
            borderRadius="8px"
          >
            {item.transaction_kind.includes('sell') ? '販売' : '買取'}
          </TagLabel>
        </Box>
      ),
    },
    {
      header: '合計金額',
      key: 'total_price',
      onSortChange: (direction) => {
        setSearchState((prev) => ({
          ...prev,
          searchCurrentPage: 0,
          orderBy: {
            finishedAt: prev.orderBy?.finishedAt,
            totalPrice: direction,
          },
        }));
      },
      render: (item) => (
        <Typography
          sx={{
            color: item.is_return
              ? 'grey.700'
              : item.transaction_kind === 'sell'
              ? 'secondary.main'
              : 'primary.main',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {item.is_return ? '-' : ''}
          {(item.total_sale_price ?? item.total_price).toLocaleString() + '円'}
        </Typography>
      ),
      isSortable: true,
    },
    {
      header: '支払い方法',
      key: 'payment_method',

      render: (item) => {
        const inner = (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box>{getPaymentMethodValue(item.payment_method)}</Box>
            {item.payment_method === TransactionPaymentMethod.bank &&
              item.payment?.bank__checked && (
                <Image
                  width={16}
                  height={16}
                  style={{ alignSelf: 'center' }}
                  src="/images/ended_check.png"
                  alt="ended_check"
                />
              )}
          </Box>
        );
        return item.payment?.cash__recieved_price &&
          item.payment_method === TransactionPaymentMethod.bank ? (
          <Tooltip
            title={
              <>
                <Typography>
                  精算済　
                  {(item.payment?.cash__recieved_price ?? 0).toLocaleString()}円
                </Typography>
                <Typography>
                  残り　
                  {(
                    item.total_price - (item.payment?.cash__recieved_price ?? 0)
                  ).toLocaleString()}
                  円
                </Typography>
              </>
            }
          >
            {inner}
          </Tooltip>
        ) : (
          inner
        );
      },
      filterConditions: Object.values(paymentMethodKeyValue),
      filterDefaultValue: 'すべて',
      onFilterConditionChange: (condition) =>
        handlePaymentMethodKeyChange(condition),
    },
    {
      header: 'レジ',
      key: 'register',
      render: (item) => item.register_name ?? '-',
      filterConditions: [
        ...(registers
          ? registers
              .filter(
                (r) =>
                  typeof r.display_name === 'string' &&
                  r.display_name.length > 0,
              )
              .map((r) => r.display_name)
          : []),
      ],
      filterDefaultValue: 'すべて',
      onFilterConditionChange: (condition) => {
        const selectedRegister = registers?.find(
          (r) => r.display_name === condition,
        );
        setSearchState((prev) => ({
          ...prev,
          searchCurrentPage: 0,
          registerId: condition === 'すべて' ? undefined : selectedRegister?.id,
        }));
      },
    },
    {
      header: '返品ステータス',
      key: 'status',
      render: (item) =>
        item.return_transaction_id || item.is_return ? '返品済み' : '-',
      // filterConditions: Object.values(statusKeyValue),
      // filterDefaultValue: statusKeyValue[0],
      // onFilterConditionChange: (condition) => {
      //   handleStatusKeyChange(condition);
      // },
    },
    {
      header: '取引日時',
      key: 'finished_at',
      render: (item) => dayjs(item.finished_at).format('YYYY/MM/DD HH:mm:ss'),
      isSortable: true,
      onSortChange: (direction) => {
        setSearchState((prev) => ({
          ...prev,
          searchCurrentPage: 0,
          orderBy: {
            finishedAt: direction,
            totalPrice: prev.orderBy?.totalPrice,
          },
        }));
      },
    },
    {
      header: '',
      key: 'detail',
      render: () => <ArrowForwardIosIcon />,
    },
  ];

  // ------------------- タブ定義 (サーバーフィルタ用) -------------------
  const transactionTabs: TabDef<MycaPosTransactionItem>[] = [
    {
      label: 'すべて',
      value: 'all',
    },
    {
      label: '販売',
      value: 'sell',
    },
    {
      label: '買取',
      value: 'buy',
    },
    {
      label: '返品取引',
      value: 'return',
    },
  ];
  const handleRowPerPageChange = (newItemPerPage: number) => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchItemPerPage: newItemPerPage,
        searchCurrentPage: 0,
        orderBy: undefined,
      };
    });
  };
  const handlePrevPagination = () => {
    if (searchState.searchCurrentPage > 0) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage - 1,
        };
      });
    }
  };
  const handleNextPagination = () => {
    if (
      searchState.searchCurrentPage * searchState.searchItemPerPage <
      searchTotalCount
    ) {
      setSearchState((prev) => {
        return {
          ...prev,
          searchCurrentPage: prev.searchCurrentPage + 1,
        };
      });
    }
  };

  return (
    <CustomTabTable<MycaPosTransactionItem>
      isShowFooterArea={true}
      currentPage={searchState.searchCurrentPage}
      rowPerPage={searchState.searchItemPerPage}
      totalRow={searchTotalCount}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      data={transactions}
      columns={transactionColumns}
      tabs={transactionTabs}
      rowKey={(item) => item.id}
      onRowClick={(item) => setSelectedTransaction(item)}
      selectedRow={selectedTransaction}
      onTabChange={handleTabChange}
      isLoading={isLoading}
      tableWrapperSx={{
        minHeight: 0, // 最小高さを設定
      }}
      tabTableWrapperSx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0, // フレックスアイテムの縮小を許可
      }}
    />
  );
};
