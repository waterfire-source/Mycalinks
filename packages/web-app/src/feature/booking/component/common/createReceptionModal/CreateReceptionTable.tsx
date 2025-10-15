import { Box, Stack } from '@mui/material';
import { CreateReceptionTableSearch } from '@/feature/booking/component/common/createReceptionModal/CreateReceptionTableSearch';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import {
  CreateCustomerReservationReception,
  ReservationsSearchState,
  ReservationType,
} from '@/feature/booking';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import dayjs from 'dayjs';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';

interface Props {
  reservations: ReservationType[];
  isLoading?: boolean;
  searchState?: ReservationsSearchState;
  setSearchState?: React.Dispatch<
    React.SetStateAction<ReservationsSearchState>
  >;
  itemCount: CreateCustomerReservationReception[];
  handleCountChange: (
    newCount: number,
    reservationId: number,
    maxQuantity: number,
  ) => void;
  handleAddProduct: (reservation: ReservationType) => void;
  hasSearchField?: boolean;
}

export const CreateReceptionTable = ({
  reservations,
  isLoading,
  searchState,
  setSearchState,
  itemCount,
  handleCountChange,
  handleAddProduct,
  hasSearchField = true,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<ReservationType>[] = [
    {
      header: '商品画像',
      render: (item) => <ItemImage imageUrl={item.product.image_url} />,
    },
    {
      header: '商品',
      render: (item) => <ItemText text={item.product.displayNameWithMeta} />,
    },
    {
      header: '発売日',
      render: (item) =>
        item.product.item.release_date
          ? dayjs(item.product.item.release_date).format('YYYY/MM/DD')
          : '-',
    },
    {
      header: '前金',
      render: (item) => `${item.deposit_price.toLocaleString()}円`,
    },
    {
      header: '上限数',
      render: (item) => item.limit_count_per_user,
    },
    {
      header: '予約数',
      render: (item) => (
        <Stack direction="row" alignItems="center" pl="12px">
          <QuantityControlField
            quantity={
              itemCount.find((i) => i.reservationId === item.id)?.itemCount ?? 0
            }
            onQuantityChange={(newCount) => {
              handleCountChange(newCount, item.id, item.limit_count_per_user);
            }}
            maxQuantity={item.limit_count_per_user}
          />
        </Stack>
      ),
      sx: {
        width: '100px',
      },
    },
    {
      header: '',
      render: (item) => (
        <SecondaryButtonWithIcon
          onClick={() => {
            handleAddProduct(item);
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          追加
        </SecondaryButtonWithIcon>
      ),
      sx: { width: '100px' },
    },
  ];

  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        width: '100%',
      }}
    >
      {hasSearchField && (
        <CreateReceptionTableSearch
          searchState={searchState}
          setSearchState={setSearchState}
        />
      )}

      <CustomTable<ReservationType>
        columns={columns}
        rows={reservations}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </Box>
  );
};
