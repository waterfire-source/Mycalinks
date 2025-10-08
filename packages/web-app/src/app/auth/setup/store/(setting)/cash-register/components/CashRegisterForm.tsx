import {
  Checkbox,
  FormControlLabel,
  Radio,
  MenuItem,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { RegisterCheckTiming, TransactionPaymentMethod } from '@prisma/client';
import { palette } from '@/theme/palette';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { RegisterForm } from '@/app/auth/setup/store/(setting)/cash-register/hooks/useRegisterForm';
import { Dispatch, SetStateAction } from 'react';
import { mycaPosCommonConstants } from '@/constants/mycapos';

interface Props {
  registerForm: RegisterForm;
  setRegisterForm: Dispatch<SetStateAction<RegisterForm>>;
}

export const CashRegisterForm = ({ registerForm, setRegisterForm }: Props) => {
  const SELL_PAYMENT_METHODS =
    mycaPosCommonConstants.displayNameDict.transaction.payment_method.enum;
  // 買取時はcashとbankのみ
  const BUY_PAYMENT_METHODS = {
    cash: '現金',
    bank: '銀行振込',
  };
  return (
    <Stack width="80%" gap={3}>
      <Stack gap={1}>
        <Typography variant="body1">レジ名</Typography>
        <TextField
          sx={{ minWidth: '300px', maxWidth: '300px' }}
          size="small"
          type="text"
          value={registerForm.registerName}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              registerName: e.target.value,
            })
          }
        />
      </Stack>
      <Stack gap={1}>
        <Stack gap={3} direction="row" alignItems="center">
          <Typography variant="body1">販売時支払い方法</Typography>
        </Stack>
        <Stack gap={1} direction="row" flexWrap="wrap">
          {Object.entries(SELL_PAYMENT_METHODS).map(([key, value]) => (
            <Stack key={key} direction="row" gap={1} alignItems="center">
              <Checkbox
                value={value}
                size="small"
                sx={{
                  color: palette.grey[500],
                }}
                checked={registerForm.sellPaymentMethod.includes(
                  key as TransactionPaymentMethod,
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRegisterForm({
                      ...registerForm,
                      sellPaymentMethod: [
                        ...registerForm.sellPaymentMethod,
                        key as TransactionPaymentMethod,
                      ],
                    });
                  } else {
                    setRegisterForm({
                      ...registerForm,
                      sellPaymentMethod: registerForm.sellPaymentMethod.filter(
                        (method) =>
                          method !== (key as TransactionPaymentMethod),
                      ),
                    });
                  }
                }}
              />
              <Typography variant="body1">{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack gap={1}>
        <Stack gap={3} direction="row" alignItems="center">
          <Typography variant="body1">買取時支払い方法</Typography>
        </Stack>
        <Stack gap={1} direction="row" flexWrap="wrap">
          {Object.entries(BUY_PAYMENT_METHODS).map(([key, value]) => (
            <Stack key={key} direction="row" gap={1} alignItems="center">
              <Checkbox
                value={value}
                size="small"
                sx={{
                  color: palette.grey[500],
                }}
                checked={registerForm.buyPaymentMethod.includes(
                  key as TransactionPaymentMethod,
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRegisterForm({
                      ...registerForm,
                      buyPaymentMethod: [
                        ...registerForm.buyPaymentMethod,
                        key as TransactionPaymentMethod,
                      ],
                    });
                  } else {
                    setRegisterForm({
                      ...registerForm,
                      buyPaymentMethod: registerForm.buyPaymentMethod.filter(
                        (method) =>
                          method !== (key as TransactionPaymentMethod),
                      ),
                    });
                  }
                }}
              />
              <Typography variant="body1">{value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack gap={1} direction="row" alignItems="center">
        <Typography variant="body1" width="100px">
          レジ金点検
        </Typography>
        <Select
          size="small"
          sx={{ width: '100px' }}
          value={registerForm.registerCheckTiming}
          onChange={(e) =>
            setRegisterForm({
              ...registerForm,
              registerCheckTiming: e.target.value as RegisterCheckTiming,
            })
          }
        >
          <MenuItem value={RegisterCheckTiming.BEFORE_OPEN}>開店時</MenuItem>
          <MenuItem value={RegisterCheckTiming.BEFORE_CLOSE}>閉店時</MenuItem>
          <MenuItem value={RegisterCheckTiming.BOTH}>両方</MenuItem>
          <MenuItem value={RegisterCheckTiming.MANUAL}>手動</MenuItem>
        </Select>
      </Stack>

      <Stack gap={1} direction="row" alignItems="center">
        <Typography variant="body1">レジ金リセット</Typography>
        <RadioGroup
          row
          value={registerForm.cashReset}
          onChange={(e) => {
            if (e.target.value === 'true') {
              setRegisterForm({
                ...registerForm,
                cashReset: true,
              });
            } else {
              // 無効にする場合はリセット金額を0にする
              setRegisterForm({
                ...registerForm,
                cashReset: false,
                resetAmount: 0,
              });
            }
          }}
        >
          <FormControlLabel value={true} control={<Radio />} label="有効" />
          <FormControlLabel value={false} control={<Radio />} label="無効" />
        </RadioGroup>
      </Stack>
      {registerForm.cashReset && (
        <Stack gap={1} direction="row" alignItems="center">
          <Typography variant="body1" width="100px">
            リセット金額
          </Typography>
          <NumericTextField
            value={registerForm.resetAmount}
            onChange={(value) =>
              setRegisterForm({
                ...registerForm,
                resetAmount: value,
              })
            }
          />
          <Typography variant="body1">円</Typography>
        </Stack>
      )}

      <Stack gap={1} direction="row" alignItems="center">
        <Typography variant="body1">レシート自動印刷</Typography>
        <RadioGroup
          row
          value={registerForm.autoPrintReceiptEnabled}
          onChange={(e) => {
            if (e.target.value === 'true') {
              setRegisterForm({
                ...registerForm,
                autoPrintReceiptEnabled: true,
              });
            } else {
              // 無効にする場合はリセット金額を0にする
              setRegisterForm({
                ...registerForm,
                autoPrintReceiptEnabled: false,
              });
            }
          }}
        >
          <FormControlLabel value={true} control={<Radio />} label="有効" />
          <FormControlLabel value={false} control={<Radio />} label="無効" />
        </RadioGroup>
      </Stack>
    </Stack>
  );
};
