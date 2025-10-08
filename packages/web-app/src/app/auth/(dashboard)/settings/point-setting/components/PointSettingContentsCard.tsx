import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Box } from '@mui/material';
import { PointFunction } from '@/app/auth/(dashboard)/settings/point-setting/components/PointFunction';
import { PointGrant } from '@/app/auth/(dashboard)/settings/point-setting/components/PointGrant';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { useEffect, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import {
  useUpdateStorePointInfo,
  StorePointSettingUpdateState,
} from '@/feature/store/hooks/useUpdateStorePointInfo';
import { TransactionPaymentMethod } from '@prisma/client';

export const PointSettingContentsCard = () => {
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
  }, [store.id, fetchStoreInfoNormal, updatePointSetting]);

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
    try {
      await updatePointSetting(store.id, pointSettings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerLayout
      title="ポイント設定"
      actions={
        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}
        >
          <PrimaryButton
            onClick={handleUpdate}
            sx={{ width: '150px', mr: 5 }}
            loading={loading}
          >
            変更を適用する
          </PrimaryButton>
        </Box>
      }
    >
      <Box sx={{ mr: 5 }}>
        <PointFunction
          pointEnabled={pointSettings.pointEnabled}
          setPointSettings={setPointSettings}
        />
        <PointGrant
          canEnableVisitPoint={pointSettings.visitPointEnabled}
          visitPointPer={pointSettings.visitPointPer}
          visitPointAmount={pointSettings.visitPointAmount}
          canEnableSellPoint={pointSettings.sellPointEnabled}
          sellPointPer={pointSettings.sellPointPer}
          canEnableSellPointLimit={pointSettings.sellPointLimitEnabled}
          sellPointLimitPer={pointSettings.sellPointLimitPer}
          sellPointLimitAmount={pointSettings.sellPointLimitAmount}
          canEnableBuyPoint={pointSettings.buyPointEnabled}
          buyPointPer={pointSettings.buyPointPer}
          canEnableBuyPointLimit={pointSettings.buyPointLimitEnabled}
          buyPointLimitPer={pointSettings.buyPointLimitPer}
          buyPointLimitAmount={pointSettings.buyPointLimitAmount}
          setPointSettings={setPointSettings}
          sellPaymentMethod={pointSettings.sellPaymentMethod}
          buyPaymentMethod={pointSettings.buyPaymentMethod}
        />
        {/* <PointUsage
          canEnablePointSpendLimit={pointSettings.pointSpendLimitEnabled}
          pointSpendLimitPer={pointSettings.pointSpendLimitPer}
          pointSpendLimitAmount={pointSettings.pointSpendLimitAmount}
          canEnablePointExpire={pointSettings.pointExpireEnabled}
          pointExpireDay={pointSettings.pointExpireDay}
          setPointSettings={setPointSettings}
        /> */}
      </Box>
    </ContainerLayout>
  );
};
