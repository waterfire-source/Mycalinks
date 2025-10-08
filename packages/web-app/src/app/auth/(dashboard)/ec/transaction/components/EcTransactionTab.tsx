import { Box, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';

import { Item_Genre } from '@prisma/client';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  EcOrderSearchState,
  platformKind,
  PlatformKindEnum,
  EcOrderByStoreInfoType,
} from '@/app/auth/(dashboard)/ec/transaction/type';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  transactions: EcOrderByStoreInfoType[];
  selectedTransaction: EcOrderByStoreInfoType | null;
  handleTransactionChange: (item: EcOrderByStoreInfoType | null) => void;
  totalCount: number;
  searchState: EcOrderSearchState;
  handleSortOrderedAt: (direction: 'asc' | 'desc' | undefined) => void;
  handleRowPerPageChange: (newItemPerPage: number) => void;
  handlePrevPagination: () => void;
  handleNextPagination: () => void;
  genre:
    | {
        itemGenres: Array<Item_Genre>;
      }
    | undefined;
  handleTabChange: (value: string) => void;
  handlePlatformChange: (platformValue: string) => void;
  isLoading: boolean;
}

export const EcTransactionTab = ({
  transactions,
  selectedTransaction,
  handleTransactionChange,
  totalCount,
  searchState,
  handleSortOrderedAt,
  handleRowPerPageChange,
  handlePrevPagination,
  handleNextPagination,
  genre,
  handleTabChange,
  handlePlatformChange,
  isLoading,
}: Props) => {
  // プラットフォーム変更
  const platformName = platformKind.map((item) => item.shopName);
  const getPlatformValue = (
    platformKey: PlatformKindEnum | '' | null,
  ): string => {
    return platformKind.find((item) => item.id === platformKey)?.initial ?? '';
  };

  // ------------------- カラム定義 -------------------
  const transactionColumns: ColumnDef<EcOrderByStoreInfoType>[] = [
    {
      header: '注文番号',
      key: 'id',
      render: (item) => <Typography>{item.order.id}</Typography>,
    },
    {
      header: '商品',
      key: 'transaction_item',
      render: (item) => (
        <Box
          sx={{
            display: 'flex',
            gap: '2px',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <ItemText
            text={
              item.products[0]?.displayNameWithMeta?.replace(/（/, '\n（') ?? ''
            }
            sx={{
              fontWeight: 'bold',
              whiteSpace: 'pre-line',
              textAlign: 'start',
            }}
          />
          <Typography
            sx={{
              backgroundColor: 'grey.300',
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            他{item.products.length - 1}商品
          </Typography>
        </Box>
      ),
    },
    {
      header: '合計金額',
      key: 'total_price',
      render: (item) => item.total_price.toLocaleString() + '円',
    },
    {
      header: '受注日時',
      key: 'ordered_at',
      render: (item) => (
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography>
            {dayjs(item.order.ordered_at).format('YYYY/MM/DD')}
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            {dayjs(item.order.ordered_at).format('HH:mm')}
          </Typography>
        </Box>
      ),
      isSortable: true,
      onSortChange: (direction: 'asc' | 'desc' | undefined) => {
        handleSortOrderedAt(direction);
      },
    },
    {
      header: 'プラットフォーム',
      key: 'platform',
      render: (item) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              color: 'primary.main',
              border: '1px solid',
              borderRadius: '50%',
            }}
          >
            <Box
              sx={{
                fontWeight: 'bold',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '6px',
              }}
            >
              {getPlatformValue(item.order.platform as PlatformKindEnum)}
            </Box>
          </Box>
        </Box>
      ),
      filterConditions: Object.values(platformName),
      filterDefaultValue: 'すべて',
      onFilterConditionChange: handlePlatformChange,
    },
    {
      header: '',
      key: 'detail',
      render: () => <ArrowForwardIosIcon />,
    },
  ];

  // ------------------------------------------
  // タブの定義
  // ------------------------------------------
  const productTabs: TabDef<EcOrderByStoreInfoType>[] = useMemo(() => {
    const tabs = [{ label: 'すべて', value: 'all' }];
    const genreOptions = genre?.itemGenres.map((genre) => ({
      label: genre.display_name,
      value: genre.id.toString(),
    }));
    return genreOptions ? tabs.concat(genreOptions) : tabs;
  }, [genre]);

  return (
    <CustomTabTable<EcOrderByStoreInfoType>
      data={transactions}
      columns={transactionColumns}
      tabs={productTabs}
      rowKey={(item) => item.order.id}
      onRowClick={handleTransactionChange}
      selectedRow={selectedTransaction}
      onTabChange={handleTabChange}
      isLoading={isLoading}
      variant="scrollable"
      scrollButtons={false}
      isShowFooterArea={true}
      currentPage={searchState.searchCurrentPage}
      rowPerPage={searchState.searchItemPerPage}
      totalRow={totalCount}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      tableWrapperSx={{ height: 'calc(100% - 160px)' }}
      tabTableWrapperSx={{ flex: 1 }}
    />
  );
};
