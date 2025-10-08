import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { ReservationType } from '@/feature/booking';

interface Props {
  selectedReservation: ReservationType | null;
  isLoading: boolean;
}

export const ReservationStatusItemTable = ({
  selectedReservation,
  isLoading,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<ReservationType>[] = [
    {
      header: '商品画像',
      render: (item) => (
        <ItemImage imageUrl={item.product.image_url} height={80} />
      ),
    },
    {
      header: '商品名',
      render: (item) => (
        <ItemText
          sx={{ maxWidth: 530 }}
          text={item.product.displayNameWithMeta}
        />
      ),
    },
    {
      header: '状態',
      render: (item) => item.product.condition_option.display_name ?? '-',
      sx: { width: '200px' },
    },
    {
      header: '発売日',
      render: (item) =>
        item.product.item.release_date
          ? dayjs(item.product.item.release_date).format('YYYY/MM/DD')
          : '-',
      sx: { width: '200px' },
    },
    {
      header: '前金',
      render: (item) => `${item.deposit_price?.toLocaleString()}円`,
      sx: { width: '200px' },
    },
    {
      header: '残金',
      render: (item) => `${item.remaining_price?.toLocaleString()}円`,
      sx: { width: '200px' },
    },
  ];

  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        minHeight: '160px',
      }}
    >
      <CustomTable<ReservationType>
        columns={columns}
        rows={selectedReservation ? [selectedReservation] : []}
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
