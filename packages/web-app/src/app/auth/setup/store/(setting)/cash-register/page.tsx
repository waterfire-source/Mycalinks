'use client';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useCreateRegister } from '@/feature/register/hooks/useCreateRegister';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { RegisterAPIRes } from '@/api/frontend/register/api';
import { CustomError } from '@/api/implement';
import { CashRegisterForm } from '@/app/auth/setup/store/(setting)/cash-register/components/CashRegisterForm';
import { useRegisterForm } from '@/app/auth/setup/store/(setting)/cash-register/hooks/useRegisterForm';
import { SquareConnectButton } from '@/app/auth/setup/store/(setting)/cash-register/components/SquareConnectButton';
import { useUpdateRegister } from '@/feature/register/hooks/useUpdateRegister';
export default function CashRegisterPage() {
  const { push } = useRouter();
  const { createRegister } = useCreateRegister();
  const { updateRegister } = useUpdateRegister();
  const { store, resetStore } = useStore();
  useEffect(() => {
    resetStore();
  }, []);
  const { setAlertState } = useAlert();
  // 取り扱いジャンル選択に進むボタンの時のローディング
  const [isLoading, setIsLoading] = useState(false);
  const [createdRegisterId, setCreatedRegisterId] = useState<number | null>(
    null,
  );

  const { registerForm, setRegisterForm, isValidate } = useRegisterForm();

  // レジ情報を作成
  const onCreateRegister = async (): Promise<
    RegisterAPIRes['createRegister']['response'] | undefined
  > => {
    const res = await createRegister({
      displayName: registerForm.registerName,
      cashResetPrice: registerForm.resetAmount,
      sellPaymentMethod: registerForm.sellPaymentMethod,
      buyPaymentMethod: registerForm.buyPaymentMethod,
      autoPrintReceiptEnabled: registerForm.autoPrintReceiptEnabled,
    });
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      throw res;
    }
    return res;
  };

  // 取り扱いジャンル選択に進むボタンを押した時
  const handleToCategorySelection = async () => {
    if (!isValidate()) {
      return;
    }
    try {
      setIsLoading(true);
      // 作成済みの場合は更新
      if (createdRegisterId) {
        await updateRegister({
          id: createdRegisterId,
          displayName: registerForm.registerName,
          cashResetPrice: registerForm.resetAmount,
          sellPaymentMethod: registerForm.sellPaymentMethod,
          buyPaymentMethod: registerForm.buyPaymentMethod,
          autoPrintReceiptEnabled: registerForm.autoPrintReceiptEnabled,
        });
      } else {
        await onCreateRegister();
      }
      push(PATH.SETUP.store.point);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Stack gap={1} alignItems="center">
        <Typography variant="h1">メインレジ設定</Typography>
        <Typography variant="body2">
          サブレジの作成は店舗アカウント作成後に行えます
        </Typography>
      </Stack>
      <CashRegisterForm
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
      />
      <Stack width="80%" gap={3}>
        {store.square_location_id && (
          <SquareConnectButton
            onCreateRegister={onCreateRegister}
            setCreatedRegisterId={setCreatedRegisterId}
          />
        )}
        <PrimaryButton onClick={handleToCategorySelection} loading={isLoading}>
          ポイント設定に進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}
