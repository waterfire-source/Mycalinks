import { ColumnDef } from '@/components/tabs/CustomTabTable';
import dayjs from 'dayjs';
import { CustomerReservationReceptionType } from '@/feature/booking';
import { ItemText } from '@/feature/item/components/ItemText';
import { Box, Stack, Typography } from '@mui/material';
import { CustomTable } from '@/components/tables/CustomTable';

interface Props {
  receptions: CustomerReservationReceptionType[];
  selectedReception: CustomerReservationReceptionType | null;
  handleClickTableRow: (item: CustomerReservationReceptionType | null) => void;
  isLoading: boolean;
}

export const CustomerReceptionsTable = ({
  receptions,
  selectedReception,
  handleClickTableRow,
  isLoading,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<CustomerReservationReceptionType>[] = [
    {
      header: 'お客様氏名',
      render: (item) => item.full_name,
      sx: { width: '200px' },
    },
    {
      header: 'フリガナ',
      render: (item) => item.full_name_ruby,
      sx: { width: '200px' },
    },
    {
      header: '予約商品',
      render: (item) => {
        const totalItemCount = item.reservation_reception_products.length;
        return (
          <Stack>
            <ItemText
              text={
                item.reservation_reception_products[0]?.reservation.product
                  .display_name
              }
              wrap
            />
            {totalItemCount >= 2 && (
              <Typography
                sx={{
                  backgroundColor: 'grey.300',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  width: 'fit-content',
                }}
              >
                他{totalItemCount - 1}商品
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      header: '最終予約受付日',
      render: (item) => {
        const nonNullProducts = item.reservation_reception_products.filter(
          (p): p is typeof p & { created_at: string } => p.created_at !== null,
        );

        const latestReservation = nonNullProducts.reduce((latest, current) => {
          return new Date(current.created_at) > new Date(latest.created_at)
            ? current
            : latest;
        }, nonNullProducts[0] || null);

        return latestReservation?.created_at
          ? dayjs(latestReservation.created_at).format('YYYY/MM/DD')
          : '-';
      },

      sx: { width: '200px' },
    },
  ];

  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        height: '100%',
      }}
    >
      <CustomTable<CustomerReservationReceptionType>
        columns={columns}
        rows={receptions}
        rowKey={(item) => item.id}
        onRowClick={handleClickTableRow}
        selectedRow={selectedReception}
        isLoading={isLoading}
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
          height: 'calc(100% - 57px)',
          '@media (max-width: 1400px)': {
            height: 'calc(100% - 51px)',
          },
        }}
      />
      <Stack
        sx={{
          width: '100%',
          height: '57px',
          backgroundColor: 'common.white',
          boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
          '@media (max-width: 1400px)': {
            height: '51px',
          },
        }}
      />
    </Box>
  );
};
