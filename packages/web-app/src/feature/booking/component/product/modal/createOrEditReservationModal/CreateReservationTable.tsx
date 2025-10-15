import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import dayjs from 'dayjs';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { ReservationsFormState } from '@/feature/booking';

interface Props {
  targetItem: ItemAPIRes['get']['items'][0] | undefined;
  targetProduct: ItemAPIRes['get']['items'][0]['products'][0] | undefined;
  isLoading: boolean;
  formData: ReservationsFormState;
  setFormData: React.Dispatch<React.SetStateAction<ReservationsFormState>>;
}

export const CreateReservationTable = ({
  targetItem,
  targetProduct,
  isLoading,
  formData,
  setFormData,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<ItemAPIRes['get']['items'][0]>[] = [
    {
      header: '商品画像',
      render: (item) => <ItemImage imageUrl={item.image_url} height={80} />,
    },
    {
      header: '商品名',
      render: (item) => (
        <ItemText sx={{ maxWidth: 530 }} text={item.displayNameWithMeta} />
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
      {!isLoading && !targetProduct ? (
        <TableContainer
          sx={{
            borderBottomRightRadius: '8px',
            borderBottomLeftRadius: '8px',
          }}
        >
          <Table
            sx={{
              width: '100%',
              minHeight: '160px',
            }}
          >
            <TableBody
              sx={{
                backgroundColor: 'white',
              }}
            >
              <TableRow>
                <TableCell colSpan={columns.length}>
                  予約可能な新品の商品が見つかりませんでした。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <CustomTable<ItemAPIRes['get']['items'][0]>
          columns={columns}
          rows={targetItem ? [targetItem] : []}
          rowKey={(item) => item.id}
          isLoading={isLoading || !targetItem}
          sx={{
            borderBottomRightRadius: '8px',
            borderBottomLeftRadius: '8px',
          }}
        />
      )}
    </Box>
  );
};
