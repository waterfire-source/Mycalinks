import { ECSettingProps } from '@/app/auth/(dashboard)/ec/settings/page';
import { HelpIcon } from '@/components/common/HelpIcon';
import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  Box,
  Card,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { $Enums, RoundRule } from '@prisma/client';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  ECSettings: ECSettingProps | null | undefined;
  setECSettings: Dispatch<SetStateAction<ECSettingProps | null | undefined>>;
  isEditable: boolean;
}

export const SaleSettings = ({
  ECSettings,
  setECSettings,
  isEditable,
}: Props) => {
  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent,
  ) => {
    const { name, value } = event.target;
    setECSettings((prev) => ({
      ...prev,
      [name]:
        name === 'autoListing' || name === 'autoStocking'
          ? value === 'true'
          : name === 'priceAdjustmentRoundRank'
          ? Number(value)
          : value,
    }));
  };

  const roundResult = (price: number) => {
    if (!ECSettings?.priceAdjustmentRoundRank) return price;
    switch (ECSettings?.priceAdjustmentRoundRule) {
      case RoundRule.UP:
        return (
          Math.ceil(price / ECSettings.priceAdjustmentRoundRank) *
          ECSettings.priceAdjustmentRoundRank
        );
      case RoundRule.DOWN:
        return (
          Math.floor(price / ECSettings.priceAdjustmentRoundRank) *
          ECSettings.priceAdjustmentRoundRank
        );
      case RoundRule.ROUND:
        return (
          Math.round(price / ECSettings.priceAdjustmentRoundRank) *
          ECSettings.priceAdjustmentRoundRank
        );
      default:
        return price;
    }
  };

  return (
    <>
      <Typography variant="h2" mt={2} mb={1}>
        出品設定
      </Typography>
      <Card
        sx={{
          p: 2,
          width: '100%',
          flexDirection: 'column',
          display: 'flex',
        }}
      >
        <FormControl>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <FormLabel sx={{ color: 'text.primary' }}>出品価格</FormLabel>
            <HelpIcon helpArchivesNumber={2563} />
          </Box>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2">POS上販売価格の</Typography>
            <NumericTextField
              name="autoSellPriceAdjustment"
              value={ECSettings?.autoSellPriceAdjustment || 0}
              onChange={(newValue: number) => {
                setECSettings((prev) => ({
                  ...prev,
                  autoSellPriceAdjustment: newValue,
                }));
              }}
              disabled={!isEditable}
              variant="outlined"
              size="small"
              sx={{ width: 100, mx: 1 }}
            />
            <Typography variant="body2">%</Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              （後から個別に設定することができます）
            </Typography>
          </Stack>
        </FormControl>
        <FormControl>
          <Stack direction="column" gap={1}>
            <FormLabel sx={{ color: 'text.primary', mt: 1 }}>
              端数処理
            </FormLabel>
            <Stack direction="row" alignItems="center" gap={1}>
              <Select
                name="priceAdjustmentRoundRank"
                value={ECSettings?.priceAdjustmentRoundRank?.toString() || ''}
                onChange={handleChange}
                disabled={!isEditable}
                size="small"
              >
                <MenuItem value="10">1の位</MenuItem>
                <MenuItem value="100">10の位</MenuItem>
                <MenuItem value="1000">100の位</MenuItem>
              </Select>
              <Typography variant="body2">を</Typography>
              <Select
                name="priceAdjustmentRoundRule"
                value={ECSettings?.priceAdjustmentRoundRule || ''}
                onChange={handleChange}
                disabled={!isEditable}
                size="small"
              >
                <MenuItem value={$Enums.RoundRule.UP}>切り上げ</MenuItem>
                <MenuItem value={$Enums.RoundRule.DOWN}>切り捨て</MenuItem>
                <MenuItem value={$Enums.RoundRule.ROUND}>四捨五入</MenuItem>
              </Select>
              <Typography variant="body1">
                (555,555→{roundResult(555555).toLocaleString()}){' '}
              </Typography>
            </Stack>
          </Stack>
        </FormControl>
        <FormControl>
          <Stack direction="column" gap={1}>
            <Stack direction="row" alignItems="center">
              <FormLabel sx={{ color: 'text.primary', mt: 2 }}>
                店頭在庫数
              </FormLabel>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                <Typography variant="caption">
                  （店頭用に確保し、ECに出品しない在庫数です。個別に設定することも可能です）
                </Typography>
                <HelpIcon helpArchivesNumber={2629} />
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={1}>
              <NumericTextField
                name="reservedStockNumber"
                value={ECSettings?.reservedStockNumber || 0}
                onChange={(newValue: number) => {
                  setECSettings((prev) => ({
                    ...prev,
                    reservedStockNumber: newValue,
                  }));
                }}
                disabled={!isEditable}
                variant="outlined"
                size="small"
                sx={{ width: 80 }}
              />
              <Typography variant="body2">点</Typography>
            </Stack>
          </Stack>
        </FormControl>
      </Card>
    </>
  );
};
