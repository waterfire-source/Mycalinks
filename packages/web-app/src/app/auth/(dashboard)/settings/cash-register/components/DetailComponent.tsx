import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Radio,
  RadioGroup,
} from '@mui/material';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import {
  TransactionPaymentMethod,
  Register,
  RegisterStatus,
} from '@prisma/client';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import NumericTextField from '@/components/inputFields/NumericTextField';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { useSession } from 'next-auth/react';
import { DetailCard } from '@/components/cards/DetailCard';
import MultiSelectButtonGroup from '@/components/inputFields/MultiSelectButtonGroup';
import { useCorporation } from '@/feature/corporation/hooks/useCorporation';
import { SquareConnectButton } from '@/app/auth/(dashboard)/settings/cash-register/components/SquareConnectButton';

interface DetailComponentProps {
  selectedRegister?: Register | null;
  removeLocalRegister?: (id: number) => void;
}

// 送信用データの型
interface FormData {
  id: number;
  displayName: string; // レジ名
  paymentTerminal: string | null; // 接続端末
  sellPaymentMethod: TransactionPaymentMethod[]; // 販売支払方法
  buyPaymentMethod: TransactionPaymentMethod[]; // 買取支払方法
  cashResetPrice: number | null; // リセット金額
  autoPrintReceiptEnabled: boolean; // レシート自動印刷
}

export const DetailComponent = ({
  selectedRegister,
  removeLocalRegister,
}: DetailComponentProps) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const { resetRegister } = useRegister();
  const [formState, setFormState] = useState<FormData>();
  const { data: session } = useSession();

  // 販売支払方法の選択肢
  const sellPaymentMethodSelector = [
    { label: '現金', value: 'cash' },
    { label: 'カード', value: 'square' },
    { label: 'QR決済', value: 'paypay' },
    { label: '電子マネー', value: 'felica' },
    { label: '銀行振込', value: 'bank' },
  ];

  // 買取支払方法の選択肢
  const buyPaymentMethodSelector = [
    { label: '現金', value: 'cash' },
    { label: '銀行振込', value: 'bank' },
  ];

  // 法人情報を取得
  const { corporation, fetchCorporation } = useCorporation();
  useEffect(() => {
    fetchCorporation();
  }, [fetchCorporation]);

  // 新規登録かどうか
  const isNew = useMemo(
    () => selectedRegister?.id === 999999999,
    [selectedRegister?.id],
  );

  useEffect(() => {
    if (selectedRegister) {
      handleReset();
    }
  }, [selectedRegister]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormState((prev) => {
      if (!prev) return prev; // 安全対策
      return { ...prev, [field]: value };
    });
  };

  // 変更をリセット
  const handleReset = () => {
    if (!selectedRegister) return;

    setFormState({
      id: selectedRegister.id,
      displayName: selectedRegister.display_name || '',
      paymentTerminal: selectedRegister.square_device_id,
      cashResetPrice: selectedRegister.cash_reset_price,
      sellPaymentMethod: selectedRegister.sell_payment_method
        ? (selectedRegister.sell_payment_method
            .split(',')
            .map((item) => item.trim())
            .filter(
              (item): item is TransactionPaymentMethod => item !== '',
            ) as TransactionPaymentMethod[])
        : [],
      buyPaymentMethod: selectedRegister.buy_payment_method
        ? (selectedRegister.buy_payment_method
            .split(',')
            .map((item) => item.trim())
            .filter(
              (item): item is TransactionPaymentMethod => item !== '',
            ) as TransactionPaymentMethod[])
        : [],
      autoPrintReceiptEnabled: selectedRegister.auto_print_receipt_enabled,
    });
  };

  // 登録、更新処理
  const handleSave = async () => {
    let res;
    if (!formState) return;

    if (isNew) {
      // 新規登録
      res = await clientAPI.register.createRegister({
        storeId: store.id,
        displayName: formState!.displayName,
        buyPaymentMethod: formState!.buyPaymentMethod,
        sellPaymentMethod: formState!.sellPaymentMethod,
        cashResetPrice: formState!.cashResetPrice ?? undefined,
        autoPrintReceiptEnabled: formState!.autoPrintReceiptEnabled,
      });
    } else {
      // 更新処理
      res = await clientAPI.register.updateRegister({
        id: formState!.id,
        storeId: store.id,
        displayName: formState!.displayName,
        buyPaymentMethod: formState!.buyPaymentMethod,
        sellPaymentMethod: formState!.sellPaymentMethod,
        cashResetPrice: formState!.cashResetPrice ?? undefined,
        autoPrintReceiptEnabled: formState!.autoPrintReceiptEnabled,
      });
    }

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    } else {
      removeLocalRegister?.(formState.id);
    }

    setAlertState({
      message: isNew
        ? '新規レジが正常に登録されました。'
        : 'レジ情報が正常に更新されました。',
      severity: 'success',
    });
    resetRegister();
  };

  // 削除処理
  const handleDelete = async () => {
    const res = await clientAPI.register.deleteRegister({
      storeID: store.id,
      registerID: formState!.id,
    });

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAlertState({
      message: 'レジが正常に削除されました。',
      severity: 'success',
    });
    resetRegister();
  };

  // selectedRegisterが未選択の場合は案内文のみ表示
  if (!selectedRegister) {
    return (
      <DetailCard
        title="レジ詳細"
        content={
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.primary' }}>
            <Typography variant="body1">
              リストから選択して詳細を表示
            </Typography>
          </Box>
        }
      />
    );
  }

  return (
    <DetailCard
      title="レジ詳細"
      content={
        <Box sx={{ p: 2 }}>
          {/*  レジ名 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              レジ名
            </Typography>
            <TextField
              fullWidth
              value={formState?.displayName || ''}
              disabled={!selectedRegister}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              size="small"
            />
          </Box>

          {/* ステータス */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              ステータス
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: 2, // 要素間の適切な間隔を設定
              }}
            >
              <Typography variant="body1">
                {selectedRegister?.status === RegisterStatus.OPEN
                  ? '開店中'
                  : '閉店中'}
              </Typography>
            </Box>
          </Box>

          {/* Square端末 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              Square端末
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Typography variant="body1">
                  {selectedRegister?.square_device_id ? '接続' : '未接続'}
                </Typography>
              </Stack>

              {corporation?.square_available && (
                <SquareConnectButton selectedRegister={selectedRegister} />
              )}
            </Box>
          </Box>

          {/* 販売時支払方法 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              販売時支払方法
            </Typography>
            <Typography component="div" variant="body1">
              <MultiSelectButtonGroup
                options={sellPaymentMethodSelector}
                selectedValues={formState?.sellPaymentMethod ?? []}
                onChange={(selected) =>
                  handleInputChange('sellPaymentMethod', selected)
                }
              ></MultiSelectButtonGroup>
            </Typography>
          </Box>

          {/* 買取時支払方法 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              買取時支払方法
            </Typography>
            <Typography component="div" variant="body1">
              <MultiSelectButtonGroup
                options={buyPaymentMethodSelector}
                selectedValues={formState?.buyPaymentMethod ?? []}
                onChange={(selected) =>
                  handleInputChange('buyPaymentMethod', selected)
                }
              ></MultiSelectButtonGroup>
            </Typography>
          </Box>

          {/* リセット金額 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              リセット金額
            </Typography>

            <NumericTextField
              value={formState?.cashResetPrice || 0}
              placeholder="0"
              size="small"
              onChange={(e) => handleInputChange('cashResetPrice', e)}
              InputProps={{
                endAdornment: <Typography>円</Typography>,
              }}
              sx={{
                width: '100%',
                textAlign: 'right',
                '& input': {
                  textAlign: 'right',
                },
              }}
            />
          </Box>

          {/* レシート自動印刷 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 170 }}>
              お会計時レシート自動印刷
            </Typography>

            <RadioGroup
              defaultValue="condition"
              onChange={(e) =>
                handleInputChange(
                  'autoPrintReceiptEnabled',
                  e.target.value === 'true',
                )
              }
              value={formState?.autoPrintReceiptEnabled ? 'true' : 'false'}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Radio value="true" sx={{ fontSize: '16px' }} />
              <Typography>有効</Typography>
              <Radio value="false" sx={{ fontSize: '16px' }} />
              <Typography>無効</Typography>
            </RadioGroup>
          </Box>
        </Box>
      }
      bottomContent={
        <>
          <Box>
            {selectedRegister?.id !== Number(session?.user.register_id) && (
              <SecondaryButtonWithIcon
                disabled={!selectedRegister}
                onClick={handleDelete}
              >
                削除
              </SecondaryButtonWithIcon>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
            <TertiaryButtonWithIcon
              sx={{ marginRight: 1 }}
              disabled={!selectedRegister}
              onClick={handleReset}
            >
              変更をリセット
            </TertiaryButtonWithIcon>
            <PrimaryButtonWithIcon
              disabled={!selectedRegister}
              onClick={handleSave}
            >
              変更を保存
            </PrimaryButtonWithIcon>
          </Box>
        </>
      }
    />
  );
};
