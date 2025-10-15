import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import dayjs from 'dayjs';
import {
  ReservationsSearchState,
  ReservationStatusLabelMap,
  ReservationType,
} from '@/feature/booking';
import { ReservationStatus } from '@prisma/client';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  reservations: ReservationType[];
  selectedReservation: ReservationType | null;
  handleClickTableRow: (item: ReservationType | null) => void;
  isLoading: boolean;
  searchTotalCount: number;
  searchState: ReservationsSearchState;
  setSearchState: (
    value: React.SetStateAction<ReservationsSearchState>,
  ) => void;
}

export const ReservationProductTabTable = ({
  reservations,
  selectedReservation,
  handleClickTableRow,
  isLoading,
  searchTotalCount,
  searchState,
  setSearchState,
}: Props) => {
  // ------------------- カラム定義 -------------------
  // ソート条件が切り替わったとき
  const handleChangeSort = (
    value: string,
    direction: 'asc' | 'desc' | undefined,
  ) => {
    setSearchState((prev) => {
      if (direction === undefined) {
        const { orderBy, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        orderBy: `${direction === 'desc' ? '-' : ''}${value}`,
        searchCurrentPage: 0,
      };
    });
  };

  const columns: ColumnDef<ReservationType>[] = [
    {
      header: 'ステータス',
      key: 'status',
      render: (item) => ReservationStatusLabelMap[item.status],
    },
    {
      header: '商品画像',
      key: 'image_url',
      render: (item) => <ItemImage imageUrl={item.product.image_url} />,
    },
    {
      header: '商品',
      key: 'product_display_name',
      render: (item) => <ItemText text={item.product.displayNameWithMeta} />,
      isSortable: true,
      onSortChange: (direction) => {
        handleChangeSort('product_display_name', direction);
      },
    },
    {
      header: '発売日',
      key: 'release_date',
      render: (item) =>
        item.product.item.release_date
          ? dayjs(item.product.item.release_date).format('YYYY/MM/DD')
          : '-',
      isSortable: true,
      onSortChange: (direction) => {
        handleChangeSort('release_date', direction);
      },
    },
    {
      header: '',
      key: 'detail',
      render: () => <ArrowForwardIosIcon />,
    },
  ];

  // ------------------- タブ定義 (サーバーフィルタ用) -------------------
  const tabs: TabDef<ReservationType>[] = [
    {
      label: 'すべて',
      value: 'all',
    },
    {
      label: ReservationStatusLabelMap[ReservationStatus.NOT_STARTED],
      value: ReservationStatus.NOT_STARTED,
    },
    {
      label: ReservationStatusLabelMap[ReservationStatus.OPEN],
      value: ReservationStatus.OPEN,
    },
    {
      label: ReservationStatusLabelMap[ReservationStatus.CLOSED],
      value: ReservationStatus.CLOSED,
    },
    {
      label: ReservationStatusLabelMap[ReservationStatus.FINISHED],
      value: ReservationStatus.FINISHED,
    },
  ];
  // タブが切り替わったとき
  const handleTabChange = (value: string) => {
    handleClickTableRow(null);
    setSearchState((prev) => ({
      ...prev,
      status: value === 'all' ? undefined : (value as ReservationStatus),
      searchCurrentPage: 0,
    }));
  };

  // ------------------- ページネーション -------------------
  const handleRowPerPageChange = (newItemPerPage: number) => {
    setSearchState((prev) => {
      return {
        ...prev,
        searchItemPerPage: newItemPerPage,
        searchCurrentPage: 0,
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
    <CustomTabTable<ReservationType>
      isShowFooterArea
      currentPage={searchState.searchCurrentPage}
      rowPerPage={searchState.searchItemPerPage}
      totalRow={searchTotalCount}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      data={reservations}
      columns={columns}
      tabs={tabs}
      rowKey={(item) => item.id}
      onRowClick={handleClickTableRow}
      selectedRow={selectedReservation}
      onTabChange={handleTabChange}
      isLoading={isLoading}
      isSingleSortMode
      tableWrapperSx={{ height: 'calc(100% - 80px)' }}
      tabTableWrapperSx={{ flex: 1 }}
    />
  );
};
