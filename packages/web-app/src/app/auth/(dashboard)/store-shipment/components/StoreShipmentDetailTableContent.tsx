import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { palette } from '@/theme/palette';
import { Box, Stack, Typography } from '@mui/material';

type Props = {
  shipmentInfo: ShipmentInfo['storeShipments'][number] | undefined;
  shipmentProducts: ShipmentProduct[];
  loading: boolean;
  editStoreShipment: () => void;
};

export const StoreShipmentDetailTableContent = ({
  shipmentInfo,
  shipmentProducts,
  loading,
  editStoreShipment,
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
      key: 'average_wholesale_price',
      header: '仕入れ値',
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
          <Typography textAlign="center">
            {row.average_wholesale_price
              ? `¥${row.average_wholesale_price.toLocaleString()}`
              : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'itemCount',
      header: '出荷数',
      sx: { flex: 1, textAlign: 'center', minWidth: 80 },
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
          <Typography textAlign="center">{row.itemCount}</Typography>
        </Box>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      rows={shipmentProducts}
      rowKey={(item) => item.id.toString()}
      isLoading={loading}
      sx={{ borderTop: `6px solid ${palette.primary.main}` }}
      customFooter={
        shipmentInfo?.status === 'NOT_YET' ? (
          <Stack
            direction="row"
            width="100%"
            height="100%"
            justifyContent="right"
            alignItems="center"
          >
            <SecondaryButton onClick={editStoreShipment} sx={{ mr: '10px' }}>
              出荷内容編集
            </SecondaryButton>
          </Stack>
        ) : undefined
      }
    />
  );
};
