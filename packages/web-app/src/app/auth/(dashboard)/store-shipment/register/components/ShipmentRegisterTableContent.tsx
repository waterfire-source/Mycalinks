import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { CustomTabTable, ColumnDef } from '@/components/tabs/CustomTabTable';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { Typography, IconButton, Stack, Box } from '@mui/material';
import { ItemImage } from '@/feature/item/components/ItemImage';
import DeleteIcon from '@mui/icons-material/Delete';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';

type Props = {
  shipmentProducts: ShipmentProduct[];
  handleCountChange: (productId: number, value: number) => void;
  handleDelete: (productId: number) => void;
  handleTemporarySave: () => void;
  handleNextStage: () => void;
  handleReject: () => void;
  loading: boolean;
  buttonLoading: boolean;
};

export const ShipmentRegisterTableContent = ({
  shipmentProducts,
  handleCountChange,
  handleDelete,
  handleNextStage,
  handleReject,
  handleTemporarySave,
  loading,
  buttonLoading,
}: Props) => {
  const columns: ColumnDef<ShipmentProduct>[] = [
    {
      key: 'image_url',
      header: '商品画像',
      sx: { flex: 1, textAlign: 'center', minWidth: 100 },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <ItemImage imageUrl={row.image_url || ''} />
        </Box>
      ),
    },
    {
      key: 'displayNameWithMeta',
      header: '商品名',
      sx: { flex: 2.5, textAlign: 'left' },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {row.displayNameWithMeta}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'condition_option_display_name',
      header: '状態',
      sx: { flex: 1, textAlign: 'center', minWidth: 80 },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">
            {row.condition_option_display_name}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'average_wholesale_price',
      header: '平均仕入れ値',
      sx: { flex: 1, textAlign: 'center', minWidth: 120 },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">
            {row.average_wholesale_price
              ? `¥${row.average_wholesale_price.toLocaleString()}`
              : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'sell_price',
      header: '販売価格',
      sx: { flex: 1, textAlign: 'center', minWidth: 120 },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">
            {row.actual_sell_price
              ? `¥${row.actual_sell_price.toLocaleString()}`
              : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'stock_number',
      header: '在庫数',
      sx: { flex: 1, textAlign: 'center', minWidth: 80 },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">{row.stock_number}</Typography>
        </Box>
      ),
    },
    {
      key: 'itemCount',
      header: '出荷数',
      sx: { flex: 1, textAlign: 'center' },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            py: 1,
          }}
        >
          <NumericTextField
            value={row.itemCount || 0}
            onChange={(value) => handleCountChange(row.id, value)}
            min={0}
            max={row.stock_number}
            size="small"
          />
        </Box>
      ),
    },
    {
      key: 'delete',
      header: '削除',
      sx: { flex: 1, textAlign: 'center' },
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <IconButton onClick={() => handleDelete(row.id)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <CustomTabTable
      data={shipmentProducts}
      tabs={[{ label: '出荷商品' }]}
      columns={columns}
      rowKey={(item) => item.id.toString()}
      isLoading={loading}
      customFooter={
        <Box
          sx={{
            width: '100%',
            height: '100%',
            pr: '10px',
            pl: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <SecondaryButton
            onClick={handleTemporarySave}
            loading={buttonLoading}
          >
            一時保存する
          </SecondaryButton>
          <Stack direction="row" spacing={2}>
            <SecondaryButton onClick={handleReject} loading={buttonLoading}>
              出荷をやめる
            </SecondaryButton>
            <PrimaryButton onClick={handleNextStage} loading={buttonLoading}>
              この内容で出荷する
            </PrimaryButton>
          </Stack>
        </Box>
      }
    />
  );
};
