'use client';
import { PointSetup } from '@/app/auth/setup/store/(setting)/point/components/PointSetup';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useStore } from '@/contexts/StoreContext';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import {
  StorePointSettingUpdateState,
  useUpdateStorePointInfo,
} from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Stack, Typography } from '@mui/material';
import { TransactionPaymentMethod } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

const PointPage = () => {
  const { push } = useRouter();
  const { storeInfoNormal, fetchStoreInfoNormal } = useStoreInfoNormal();
  const { store } = useStore();
  const { updatePointSetting } = useUpdateStorePointInfo();
  const [loading, setLoading] = useState<boolean>(false);

  const [pointSettings, setPointSettings] =
    useState<StorePointSettingUpdateState>({});

  // 文字列をカンマで分割して、TransactionPaymentMethodの配列に変換する関数
  const toPaymentMethodArray = (
    value?: string | null,
  ): TransactionPaymentMethod[] | undefined => {
    if (!value) return undefined;

    return value
      .split(',')
      .map((v) => v.trim())
      .filter((v): v is TransactionPaymentMethod =>
        Object.values(TransactionPaymentMethod).includes(
          v as TransactionPaymentMethod,
        ),
      );
  };

  useEffect(() => {
    const loadStoreInfo = async () => {
      await fetchStoreInfoNormal(store.id);
    };
    loadStoreInfo();
  }, [store.id, fetchStoreInfoNormal]);

  useEffect(() => {
    setPointSettings({
      pointEnabled: storeInfoNormal?.[0]?.point_enabled,
      visitPointEnabled: storeInfoNormal?.[0]?.visit_point_enabled,
      visitPointPer: storeInfoNormal?.[0]?.visit_point_per,
      visitPointAmount: storeInfoNormal?.[0]?.visit_point_amount,
      sellPointEnabled: storeInfoNormal?.[0]?.sell_point_enabled,
      sellPointPer: storeInfoNormal?.[0]?.sell_point_per,
      sellPointLimitEnabled: storeInfoNormal?.[0]?.sell_point_limit_enabled,
      sellPointLimitPer: storeInfoNormal?.[0]?.sell_point_limit_per,
      sellPointLimitAmount: storeInfoNormal?.[0]?.sell_point_limit_amount,
      sellPaymentMethod: toPaymentMethodArray(
        storeInfoNormal?.[0]?.sell_point_payment_method,
      ),
      buyPointEnabled: storeInfoNormal?.[0]?.buy_point_enabled,
      buyPointPer: storeInfoNormal?.[0]?.buy_point_per,
      buyPointLimitEnabled: storeInfoNormal?.[0]?.buy_point_limit_enabled,
      buyPointLimitPer: storeInfoNormal?.[0]?.buy_point_limit_per,
      buyPointLimitAmount: storeInfoNormal?.[0]?.buy_point_limit_amount,
      buyPaymentMethod: toPaymentMethodArray(
        storeInfoNormal?.[0]?.buy_point_payment_method,
      ),
      pointSpendLimitEnabled: storeInfoNormal?.[0]?.point_spend_limit_enabled,
      pointSpendLimitPer: storeInfoNormal?.[0]?.point_spend_limit_per,
      pointSpendLimitAmount: storeInfoNormal?.[0]?.point_spend_limit_amount,
      pointExpireEnabled: storeInfoNormal?.[0]?.point_expire_enabled,
      pointExpireDay: storeInfoNormal?.[0]?.point_expire_day,
    });
  }, [storeInfoNormal]);

  const handleUpdate = async () => {
    setLoading(true);
    await updatePointSetting(store.id, pointSettings);
    push(PATH.SETUP.store.category);
    setLoading(false);
  };
  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Stack gap={1} alignItems="center">
        <Typography variant="h1">ポイント設定</Typography>
        <Typography variant="body2">
          店舗でのポイント制度について設定してください
        </Typography>
      </Stack>
      <Stack width="80%" gap={3}>
        <PointSetup
          pointSettings={pointSettings}
          setPointSettings={setPointSettings}
        />
        <PrimaryButton onClick={handleUpdate} loading={loading}>
          カテゴリの追加に進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default PointPage;
