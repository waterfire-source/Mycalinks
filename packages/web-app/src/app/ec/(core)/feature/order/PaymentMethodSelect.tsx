import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
} from '@mui/material';
import { paymentMethods } from '@/app/ec/(core)/constants/payment';
import { EcPaymentMethod } from '@prisma/client';
import { useEffect } from 'react';
import {
  getLastPaymentMethod,
  savePaymentMethod,
} from '@/app/ec/(core)/utils/ecStorage';

interface PaymentMethodSelectProps {
  selectedMethod: EcPaymentMethod | null;
  onMethodChange: (method: EcPaymentMethod | null) => void;
  paymentMethodCandidates: EcPaymentMethod[];
  onNext?: () => void;
}

export const PaymentMethodSelect = ({
  selectedMethod,
  onMethodChange,
  paymentMethodCandidates,
  onNext,
}: PaymentMethodSelectProps) => {
  // 初期値設定：前回の決済方法を復元（候補がセットされてから実行）
  useEffect(() => {
    // paymentMethodCandidatesが空でない場合のみ処理を実行
    if (paymentMethodCandidates.length > 0) {
      // 既に選択されている場合はスキップ
      if (selectedMethod) return;

      const lastMethod = getLastPaymentMethod();
      if (lastMethod) {
        // 前回の決済方法が現在の候補に含まれているかチェック
        const isMethodAvailable = paymentMethodCandidates.includes(lastMethod);

        if (isMethodAvailable) {
          onMethodChange(lastMethod);
        }
      }
    }
  }, [selectedMethod, paymentMethodCandidates, onMethodChange]);

  // 選択されている決済方法が候補に含まれていない場合はクリア
  useEffect(() => {
    // paymentMethodCandidatesが空でない場合のみ処理を実行
    if (paymentMethodCandidates.length > 0 && selectedMethod) {
      const isMethodAvailable =
        paymentMethodCandidates.includes(selectedMethod);
      if (!isMethodAvailable) {
        onMethodChange(null); // 選択をクリア
      }
    }
  }, [selectedMethod, paymentMethodCandidates, onMethodChange]);

  // 決済方法変更時の処理
  const handleMethodChange = (method: EcPaymentMethod) => {
    // 決済方法を保存
    savePaymentMethod(method);
    onMethodChange(method);
  };

  const isDisabled = (method: EcPaymentMethod) => {
    if (method === EcPaymentMethod.CARD) {
      return false;
    }
    return !paymentMethodCandidates.includes(method);
  };

  return (
    <Box>
      <RadioGroup
        value={selectedMethod}
        onChange={(e) => {
          const method = e.target.value as EcPaymentMethod;
          handleMethodChange(method);
        }}
        sx={{ width: '100%' }}
      >
        {paymentMethods.map((method) => (
          <FormControlLabel
            key={method.value}
            value={method.value}
            control={<Radio />}
            label={
              method.value === EcPaymentMethod.CONVENIENCE_STORE
                ? `${method.label}（300,000円まで）`
                : method.value === EcPaymentMethod.CASH_ON_DELIVERY
                ? `${method.label}（300,000円まで）`
                : method.label
            }
            disabled={isDisabled(method.value)}
            sx={{
              width: '100%',
              margin: 0,
              padding: '12px',
              borderBottom:
                method.value !== EcPaymentMethod.CASH_ON_DELIVERY
                  ? '1px solid #eee'
                  : undefined,
              paddingBottom:
                method.value === EcPaymentMethod.CASH_ON_DELIVERY
                  ? '0px'
                  : '12px',
              opacity: isDisabled(method.value) ? 0.5 : 1,
            }}
          />
        ))}
      </RadioGroup>
      <Stack direction="column" sx={{ width: '100%', px: 2, pt: 2 }}>
        <Button
          onClick={onNext}
          variant="contained"
          color="primary"
          sx={{ borderRadius: '10px' }}
          disabled={!selectedMethod}
        >
          選択する
        </Button>
      </Stack>
    </Box>
  );
};
