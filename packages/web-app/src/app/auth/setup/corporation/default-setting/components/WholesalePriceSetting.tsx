import { MenuItem, Radio, Select, Stack, Typography } from '@mui/material';
import { WholesalePriceKeepRule } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';
interface Props {
  wholesalePriceSetting: WholesalePriceKeepRule;
  setWholesalePriceSetting: Dispatch<SetStateAction<WholesalePriceKeepRule>>;
  outboundOrderSetting: 'newest' | 'oldest' | 'highest' | 'lowest';
  setOutboundOrderSetting: Dispatch<
    SetStateAction<'newest' | 'oldest' | 'highest' | 'lowest'>
  >;
}

export const WholesalePriceSetting = ({
  wholesalePriceSetting,
  setWholesalePriceSetting,
  outboundOrderSetting,
  setOutboundOrderSetting,
}: Props) => {
  return (
    <Stack gap={1}>
      <Typography variant="h1">仕入れ値設定</Typography>
      <Stack px={3} py={2}>
        <Stack gap={1}>
          <Typography variant="body1">仕入れ値表示設定</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Radio
              checked={
                wholesalePriceSetting === WholesalePriceKeepRule.individual
              }
              onChange={() =>
                setWholesalePriceSetting(WholesalePriceKeepRule.individual)
              }
              value={WholesalePriceKeepRule.individual}
            />
            <Typography variant="body1">個別</Typography>
            <Radio
              checked={wholesalePriceSetting === WholesalePriceKeepRule.average}
              onChange={() =>
                setWholesalePriceSetting(WholesalePriceKeepRule.average)
              }
              value={WholesalePriceKeepRule.average}
            />
            <Typography variant="body1">平均値</Typography>
          </Stack>
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">出庫順</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Select
              size="small"
              value={outboundOrderSetting}
              onChange={(e) =>
                setOutboundOrderSetting(
                  e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest',
                )
              }
              sx={{ width: '250px' }}
            >
              <MenuItem value="newest">仕入れ時期古い順(先入先出)</MenuItem>
              <MenuItem value="oldest">仕入れ時期新しい順(先入後出)</MenuItem>
              <MenuItem value="highest">仕入れ値高い順</MenuItem>
              <MenuItem value="lowest">仕入れ値低い順</MenuItem>
            </Select>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
