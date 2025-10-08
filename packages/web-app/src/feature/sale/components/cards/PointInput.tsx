import { Typography, Box, Stack } from '@mui/material';

import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { useState } from 'react';
interface Props {
  customer: CustomerType;
}

export const PointInput = ({ customer }: Props) => {
  const { applyPoint, state } = useSaleCartContext();
  const [point, setPoint] = useState<number | undefined>(undefined);
  // 小計かポイントの上限のどちらか低い方
  const maxPoint = Math.min(state.subtotalPrice, customer.owned_point);
  return (
    <Stack flexDirection="column" gap={1}>
      <Typography sx={{ color: 'text.primary' }} variant="caption">
        ポイント利用 保有：
        <Box component="span" sx={{ color: 'primary.main' }}>
          {customer.owned_point.toLocaleString()}pt
        </Box>
      </Typography>
      <Stack flexDirection="row" gap={1} height="30px" alignItems="center">
        <NumericTextField
          suffix="pt"
          value={point}
          max={maxPoint}
          min={0}
          onChange={(value) => setPoint(value)}
        />
        <PrimaryButtonWithIcon
          sx={{
            flex: '0 0 auto',
            minWidth: '20px',
            height: '30px',
          }}
          onClick={() => applyPoint(point ?? 0)}
        >
          適用
        </PrimaryButtonWithIcon>
      </Stack>
    </Stack>
  );
};
