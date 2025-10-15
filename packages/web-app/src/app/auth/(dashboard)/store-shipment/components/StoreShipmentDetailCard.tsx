import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { DetailCard } from '@/components/cards/DetailCard';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { customDayjs } from 'common';

type Props = {
  storeShipmentInfo: ShipmentInfo['storeShipments'][number] | undefined;
  allStores: { display_name: string | null; id: number }[];
};

export const StoreShipmentDetailCard = ({
  storeShipmentInfo,
  allStores,
}: Props) => {
  const targetShipmentStore = allStores.find(
    (s) => s.id === storeShipmentInfo?.to_store_id,
  );
  const shipmentDate = storeShipmentInfo
    ? customDayjs(storeShipmentInfo?.shipment_date)
        .tz()
        .format('YYYY/MM/DD')
    : '-';

  return (
    <DetailCard
      title="出荷内容詳細"
      content={
        <Stack gap="12px">
          <Box sx={{ display: 'flex', gap: '30px' }}>
            <Stack>
              <Typography sx={{ fontWeight: 'bold' }}>仕入れ値合計</Typography>
              <Typography>
                {storeShipmentInfo?.total_wholesale_price?.toLocaleString()}円
              </Typography>
            </Stack>
            <Stack>
              <Typography sx={{ fontWeight: 'bold' }}>販売価格合計</Typography>
              <Typography>
                {storeShipmentInfo?.total_sale_price?.toLocaleString()}円
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Typography sx={{ fontWeight: 'bold' }}>出荷先</Typography>
            <Typography>{targetShipmentStore?.display_name || '-'}</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography sx={{ fontWeight: 'bold' }}>出荷日</Typography>
            <Typography>{shipmentDate || '-'}</Typography>
          </Stack>

          <Typography sx={{ fontWeight: 'bold' }}>メモ</Typography>
          <TextField
            value={storeShipmentInfo?.description || ''}
            multiline
            rows={5}
            disabled
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '80px',
              },
            }}
          />
        </Stack>
      }
    />
  );
};
