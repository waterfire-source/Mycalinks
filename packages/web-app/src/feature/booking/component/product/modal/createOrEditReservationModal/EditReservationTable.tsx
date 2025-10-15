import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { Box, TextField } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import dayjs from 'dayjs';
import { ReservationsFormState, ReservationType } from '@/feature/booking';

interface Props {
  selectedReservation: ReservationType | null;
  formData: ReservationsFormState;
  setFormData: React.Dispatch<React.SetStateAction<ReservationsFormState>>;
}

export const EditReservationTable = ({
  selectedReservation,
  formData,
  setFormData,
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
      header: '販売価格',
      render: (item) => (
        <NumericTextField
          value={formData.item_sell_price}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              item_sell_price: val,
            }))
          }
          suffix="円"
          noSpin
          sx={{ width: '200px' }}
        />
      ),
      sx: { width: '200px' },
    },
    {
      header: '発売日',
      render: (item) => (
        <TextField
          type="date"
          size="small"
          value={
            formData.item_release_date
              ? dayjs(formData.item_release_date).format('YYYY-MM-DD')
              : ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              item_release_date: e.target.value,
            }))
          }
          sx={{ backgroundColor: 'white' }}
          InputLabelProps={{
            shrink: true,
            sx: {
              color: 'black',
            },
          }}
        />
      ),
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
        sx={{
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </Box>
  );
};
