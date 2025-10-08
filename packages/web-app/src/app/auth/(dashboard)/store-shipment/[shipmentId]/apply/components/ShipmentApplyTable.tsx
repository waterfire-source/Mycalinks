'use client';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Box, Typography } from '@mui/material';
import { palette } from '@/theme/palette';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';

type Props = {
  shipmentInfo: ShipmentInfo | undefined;
  shipmentProducts: ShipmentProduct[];
  loading: boolean;
};

export const ShipmentApplyTable = ({ shipmentProducts, loading }: Props) => {
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
            {row.sell_price ? `¥${row.sell_price.toLocaleString()}` : '-'}
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
          <Typography textAlign="center">
            {row.stock_number.toLocaleString()}
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
    />
  );
};
