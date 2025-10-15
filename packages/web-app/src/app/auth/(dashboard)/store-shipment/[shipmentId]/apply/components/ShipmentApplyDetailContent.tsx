import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { DateField } from '@/components/inputFields/DateField';
import {
  Box,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { customDayjs } from 'common';

type Props = {
  shipmentStores: { id: number; displayName: string }[];
  shipmentInfo: ShipmentInfo | undefined;
  handleAbortShipment: () => void;
  handleReregisterShipment: () => void;
  handleApplyShipment: () => void;
  editShipmentInfo: (filed: string, value: any) => void;
  aborting: boolean;
  shipping: boolean;
};

export const ShipmentApplyDetailContent = ({
  shipmentStores,
  shipmentInfo,
  handleAbortShipment,
  handleApplyShipment,
  handleReregisterShipment,
  editShipmentInfo,
  aborting,
  shipping,
}: Props) => {
  const storeShipmentInfo = shipmentInfo?.storeShipments[0];

  return (
    <DetailCard
      title="出荷内容詳細"
      content={
        <Stack gap="12px">
          <Box sx={{ display: 'flex', gap: '30px' }}>
            <Stack>
              <Typography sx={{ fontWeight: 'bold' }}>仕入れ値合計</Typography>
              <Typography>
                {storeShipmentInfo?.total_wholesale_price}円
              </Typography>
            </Stack>
            <Stack>
              <Typography sx={{ fontWeight: 'bold' }}>販売価格合計</Typography>
              <Typography>{storeShipmentInfo?.total_sale_price}円</Typography>
            </Stack>
          </Box>
          <Typography sx={{ fontWeight: 'bold' }}>出荷先</Typography>
          <Select
            size="small"
            value={storeShipmentInfo?.to_store_id || ''}
            onChange={(e) => {
              editShipmentInfo('to_store_id', Number(e.target.value));
            }}
          >
            {shipmentStores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.displayName}
              </MenuItem>
            ))}
          </Select>
          <Typography sx={{ fontWeight: 'bold' }}>出荷日</Typography>
          <DateField
            value={
              customDayjs(storeShipmentInfo?.shipment_date)
                .tz()
                .format('YYYY-MM-DD') || ''
            }
            label=""
            onChange={(e) => {
              editShipmentInfo('shipment_date', e);
            }}
          />
          <Typography sx={{ fontWeight: 'bold' }}>メモ</Typography>
          <TextField
            value={storeShipmentInfo?.description}
            onChange={(e) => editShipmentInfo('description', e.target.value)}
            multiline
            rows={5}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '80px',
              },
            }}
          />
        </Stack>
      }
      bottomContent={
        <Stack
          direction="row"
          justifyContent="space-between"
          width="100%"
          gap="12px"
        >
          <SecondaryButton
            size="small"
            onClick={handleAbortShipment}
            loading={aborting}
          >
            出荷内容を破棄
          </SecondaryButton>
          <Stack direction="row" spacing={1}>
            <CancelButton size="small" onClick={handleReregisterShipment}>
              登録商品の登録に戻る
            </CancelButton>
            <PrimaryButton
              size="small"
              onClick={handleApplyShipment}
              loading={shipping}
            >
              出荷
            </PrimaryButton>
          </Stack>
        </Stack>
      }
    />
  );
};
