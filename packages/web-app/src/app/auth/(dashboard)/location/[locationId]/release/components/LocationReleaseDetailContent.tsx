import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { Box, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  totalWholesalePrice: number;
  totalSalePrice: number;
  setTotalSalePrice: Dispatch<SetStateAction<number>>;
  grossProfit: number;
  grossProfitRate: number;
  rejectRelease: () => void;
  releaseLocation: () => void;
  releasing: boolean;
};

export const LocationReleaseDetailContent = ({
  totalWholesalePrice,
  totalSalePrice,
  setTotalSalePrice,
  grossProfit,
  grossProfitRate,
  rejectRelease,
  releaseLocation,
  releasing,
}: Props) => {
  return (
    <DetailCard
      title="解体結果"
      content={
        <Stack sx={{ width: '100%', height: '100%' }}>
          <Box sx={{ width: '100%' }}>
            <Typography>合計仕入れ値：</Typography>
            <Typography>¥{totalWholesalePrice.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography>売上合計：</Typography>
            <NumericTextField
              size="small"
              min={0}
              suffix="円"
              sx={{ width: '100%' }}
              value={totalSalePrice}
              onChange={(e) => setTotalSalePrice(e)}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography>粗利益：</Typography>
            <Typography>¥{grossProfit.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography>粗利率：</Typography>
            <Typography>{grossProfitRate}%</Typography>
          </Box>
        </Stack>
      }
      bottomContent={
        <Stack direction="row" justifyContent="space-between" sx={{ flex: 1 }}>
          <SecondaryButton onClick={rejectRelease}>
            解体をやめる
          </SecondaryButton>
          <PrimaryButton onClick={releaseLocation} loading={releasing}>
            解体結果を登録
          </PrimaryButton>
        </Stack>
      }
    />
  );
};
