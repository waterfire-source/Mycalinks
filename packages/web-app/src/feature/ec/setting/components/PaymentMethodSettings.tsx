import { ECSettingProps } from '@/app/auth/(dashboard)/ec/settings/page';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { HelpIcon } from '@/components/common/HelpIcon';
import { CheckCircleOutline } from '@mui/icons-material';
import {
  Box,
  Card,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  ECSettings: ECSettingProps | null | undefined;
  setECSettings: Dispatch<SetStateAction<ECSettingProps | null | undefined>>;
  isEditable: boolean;
}

interface DelayedPaymentMethod {
  CONVENIENCE_STORE: boolean;
  BANK: boolean;
  CASH_ON_DELIVERY: boolean;
}

export const PaymentMethodSettings = ({
  ECSettings,
  setECSettings,
  isEditable,
}: Props) => {
  const handleClick = (value: keyof DelayedPaymentMethod) => {
    let settings = (ECSettings?.delayedPaymentMethod ?? '').split(',').reduce(
      (acc, method) => ({
        ...acc,
        [method]: true,
      }),
      { CONVENIENCE_STORE: false, BANK: false, CASH_ON_DELIVERY: false },
    ) as DelayedPaymentMethod;

    settings = {
      ...settings,
      [value]: !settings[value],
    };

    const updatedSettings = Object.entries(settings)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(',');

    setECSettings((prev) => ({
      ...prev,
      delayedPaymentMethod: updatedSettings,
    }));
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h2">MycalinksMALL決済方法設定</Typography>
        <HelpIcon helpArchivesNumber={2676} />
      </Box>
      <Card
        sx={{ p: 2, width: '100%', flexDirection: 'column', display: 'flex' }}
      >
        <FormControl>
          <FormLabel sx={{ color: 'text.primary', mb: 1 }}>
            許可する非即時決済
          </FormLabel>
          <Stack direction="row" alignItems="center">
            <SecondaryButtonWithIcon
              name="convenienceStore"
              onClick={
                isEditable ? () => handleClick('CONVENIENCE_STORE') : undefined
              }
              selected={(ECSettings?.delayedPaymentMethod ?? '')
                .split(',')
                .includes('CONVENIENCE_STORE')}
              icon={
                (ECSettings?.delayedPaymentMethod ?? '')
                  .split(',')
                  .includes('CONVENIENCE_STORE') && <CheckCircleOutline />
              }
              iconPosition="right"
              sx={{
                width: 'auto',
                minWidth: 'auto',
                alignSelf: 'flex-start',
                mr: 1,
              }}
            >
              コンビニ支払い
            </SecondaryButtonWithIcon>
            <SecondaryButtonWithIcon
              name="bankTransfer"
              onClick={isEditable ? () => handleClick('BANK') : undefined}
              selected={(ECSettings?.delayedPaymentMethod ?? '')
                .split(',')
                .includes('BANK')}
              icon={
                (ECSettings?.delayedPaymentMethod ?? '')
                  .split(',')
                  .includes('BANK') && <CheckCircleOutline />
              }
              iconPosition="right"
              sx={{
                width: 'auto',
                minWidth: 'auto',
                alignSelf: 'flex-start',
                mr: 1,
              }}
            >
              銀行振込
            </SecondaryButtonWithIcon>
            <SecondaryButtonWithIcon
              name="paymentOnDelivery"
              onClick={
                isEditable ? () => handleClick('CASH_ON_DELIVERY') : undefined
              }
              selected={(ECSettings?.delayedPaymentMethod ?? '')
                .split(',')
                .includes('CASH_ON_DELIVERY')}
              icon={
                (ECSettings?.delayedPaymentMethod ?? '')
                  .split(',')
                  .includes('CASH_ON_DELIVERY') && <CheckCircleOutline />
              }
              iconPosition="right"
              sx={{
                width: 'auto',
                minWidth: 'auto',
                alignSelf: 'flex-start',
              }}
            >
              代引き
            </SecondaryButtonWithIcon>
          </Stack>
        </FormControl>
      </Card>
    </>
  );
};
