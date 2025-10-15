import SecondaryButton from '@/components/buttons/SecondaryButton';
import {
  Box,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { ECSettingProps } from '@/app/auth/(dashboard)/ec/settings/page';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  ECSettings: ECSettingProps | null | undefined;
  setECSettings: Dispatch<SetStateAction<ECSettingProps | null | undefined>>;
  isEditable: boolean;
}

export const DeliverySettings = ({
  ECSettings,
  setECSettings,
  isEditable,
}: Props) => {
  const router = useRouter();

  const dayOfTheWeek = ['日', '月', '火', '水', '木', '金', '土'];

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent,
  ) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;

    setECSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
            ? [
                ...(prev?.closedDay?.split(',').filter(Boolean) || []),
                value,
              ].join(',')
            : prev?.closedDay
                ?.split(',')
                .filter((day) => day !== value)
                .join(',')
          : value === 'true',
    }));
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h2">MycalinksMALL配送設定</Typography>
        <HelpIcon helpArchivesNumber={2686} />
      </Box>
      <Card
        sx={{ p: 2, width: '100%', flexDirection: 'column', display: 'flex' }}
      >
        <FormControl>
          <FormLabel sx={{ color: 'text.primary' }}>即日発送</FormLabel>
          <RadioGroup
            row
            name="enableSameDayShipping"
            value={
              ECSettings?.enableSameDayShipping === undefined
                ? ''
                : ECSettings.enableSameDayShipping
                ? 'true'
                : 'false'
            }
            onChange={handleChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio disabled={!isEditable} />}
              label="する"
            />
            <FormControlLabel
              value="false"
              control={<Radio disabled={!isEditable} />}
              label="しない"
            />
          </RadioGroup>
          <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
            <NumericTextField
              value={ECSettings?.sameDayLimitHour || undefined}
              disabled={!isEditable}
              min={0}
              max={23}
              onChange={(value) => {
                setECSettings((prev) => ({
                  ...prev,
                  sameDayLimitHour: value,
                }));
              }}
              sx={{ width: 120, mx: 1 }}
            />
            <Typography variant="body2">時までの注文</Typography>
          </Stack>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ color: 'text.primary', mt: 2 }}>
            発送までの日数
          </FormLabel>
          <Stack direction="row" alignItems="center">
            <NumericTextField
              name="ShippingDays"
              value={ECSettings?.shippingDays || 0}
              onChange={(value: number) => {
                setECSettings((prev) => ({
                  ...prev,
                  shippingDays: value,
                }));
              }}
              disabled={!isEditable}
              variant="outlined"
              size="small"
              sx={{ width: 80, mx: 1 }}
            />
            <Typography variant="body2">営業日以内</Typography>
          </Stack>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ color: 'text.primary', mt: 2 }}>定休日</FormLabel>
          <FormGroup row>
            {dayOfTheWeek.map((value, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={
                      ECSettings?.closedDay?.split(',').includes(value) ?? false
                    }
                    onChange={handleChange}
                    disabled={!isEditable}
                    name="closedDay"
                    value={value}
                  />
                }
                label={value}
              />
            ))}
          </FormGroup>
        </FormControl>
        <FormControl>
          <FormLabel sx={{ color: 'text.primary', mt: 1 }}>
            送料無料ライン
          </FormLabel>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2">
              商品合計（消費税・割引含む）
            </Typography>
            <NumericTextField
              name="FreeShippingBorder"
              value={ECSettings?.freeShippingPrice || 0}
              onChange={(value: number) => {
                setECSettings((prev) => ({
                  ...prev,
                  freeShippingPrice: value,
                }));
              }}
              disabled={!isEditable}
              variant="outlined"
              noSpin
              size="small"
              sx={{ width: 80, mx: 1 }}
            />
            <Typography variant="body2">円以上</Typography>
          </Stack>
        </FormControl>
        <SecondaryButton
          sx={{ width: '150px', mt: 1 }}
          onClick={() => router.push(`${PATH.EC.deliverySettings}`)}
        >
          配送方法の設定
        </SecondaryButton>
      </Card>
    </>
  );
};
