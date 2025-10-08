import { ColumnDef } from '@/components/tables/DraggableTable';
import { CustomTabTable } from '@/components/tabs/CustomTabTable';
import { Location } from '@/feature/location/hooks/useLocation';
import { IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dispatch, SetStateAction } from 'react';
import { customDayjs } from 'common';

type Props = {
  locations: Location[];
  currentPage?: number;
  rowPerPage?: number;
  totalRow?: number;
  handleRowPerPageChange?: (newTake: number) => void;
  handlePrevPagination?: () => void;
  handleNextPagination?: () => void;
  setWhichLocationDeleteModalIsOpen: Dispatch<
    SetStateAction<Location | undefined>
  >;
  onClickRow: (location: Location) => void;
  fetching: boolean;
};

export const LocationTableContent = ({
  locations,
  currentPage,
  rowPerPage,
  totalRow,
  handleRowPerPageChange,
  handlePrevPagination,
  handleNextPagination,
  setWhichLocationDeleteModalIsOpen,
  onClickRow,
  fetching,
}: Props) => {
  const columns: ColumnDef<Location>[] = [
    {
      header: 'ロケーション名',
      key: 'locationName',
      render: (location) => <Typography>{location.display_name}</Typography>,
    },
    {
      header: '作成日時',
      key: 'createdAt',
      render: (location) => (
        <Typography>
          {customDayjs(location.created_at).tz().format('YYYY/MM/DD')}
        </Typography>
      ),
    },
    {
      header: '登録商品数',
      key: 'registerCount',
      render: (location) => (
        <Typography>{location.total_item_count || 0}</Typography>
      ),
    },
    {
      header: '販売額合計',
      key: 'sellPriceSum',
      render: (location) => (
        <Typography>
          ¥{location.expected_sales?.toLocaleString() || 0}
        </Typography>
      ),
    },
    {
      header: '仕入れ値合計',
      key: 'wholesalePriceSum',
      render: (location) => (
        <Typography>
          ¥{location.total_wholesale_price?.toLocaleString() || 0}
        </Typography>
      ),
    },
    {
      header: '備考',
      key: 'description',
      render: (location) => <Typography>{location.description}</Typography>,
    },
    {
      header: '',
      key: 'delete',
      render: (location) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation(); // 行クリックイベントの伝播を防止
            setWhichLocationDeleteModalIsOpen(location);
          }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const tabs = [
    {
      label: 'すべて',
      filterFn: (data: Location[]) => data,
    },
    {
      label: '確保中',
      filterFn: (data: Location[]) =>
        data.filter((location) => location.status === 'CREATED'),
    },
    {
      label: '解体済み',
      filterFn: (data: Location[]) =>
        data.filter((location) => location.status === 'FINISHED'),
    },
  ];

  return (
    <CustomTabTable<Location>
      data={locations}
      columns={columns}
      rowKey={(location) => location.id}
      tabs={tabs}
      isLoading={fetching}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalRow={totalRow}
      handleRowPerPageChange={handleRowPerPageChange}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      onRowClick={onClickRow}
      isShowFooterArea={true}
    />
  );
};
