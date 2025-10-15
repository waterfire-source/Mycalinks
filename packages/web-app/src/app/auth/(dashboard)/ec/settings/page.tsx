'use client';

import { createClientAPI, CustomError } from '@/api/implement';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ConditionBindingSettings } from '@/feature/ec/setting/components/ConditionBindingSettings';
import { SpecialConditionBindingSettings } from '@/feature/ec/setting/components/SpecialConditionBindingSettings';
import { DeliverySettings } from '@/feature/ec/setting/components/DeliverySettings';
import { PaymentMethodSettings } from '@/feature/ec/setting/components/PaymentMethodSettings';
import { SaleSettings } from '@/feature/ec/setting/components/SaleSettings';
import { NotificationEmailSettings } from '@/feature/ec/setting/components/NotificationEmailSettings';
import { Box, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { $Enums } from '@prisma/client';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { TermsOfUseModal } from '@/feature/ec/setting/components/TermsOfUseModal';
import { OpenCloseAlertModal } from '@/feature/ec/setting/components/OpenCloseAlertModal';
import { HelpIcon } from '@/components/common/HelpIcon';

export interface ECSettingProps {
  autoListing?: boolean;
  autoStocking?: boolean;
  autoSellPriceAdjustment?: number;
  priceAdjustmentRoundRank?: number;
  priceAdjustmentRoundRule?: $Enums.RoundRule;
  reservedStockNumber?: number;
  enableSameDayShipping?: boolean;
  sameDayLimitHour?: number | null;
  shippingDays?: number | null;
  closedDay?: string;
  freeShippingPrice?: number | null;
  delayedPaymentMethod?: string;
  notificationEmail?: string | null;
}

export default function ECSettingsPage() {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const [ECSettings, setECSettings] = useState<
    ECSettingProps | null | undefined
  >(undefined);
  const { fetchStoreInfoNormal } = useStoreInfoNormal();
  const [isEditable, setIsEditable] = useState(false);
  const [isTermsOfUseModalOpen, setIsTermsOfUseModalOpen] = useState(false);
  const [isOpenCloseAlertModalOpen, setIsOpenCloseAlertModalOpen] =
    useState(false);

  const fetchECSettings = async () => {
    const res = await fetchStoreInfoNormal(store.id, false, true);
    if (res) {
      if (!res[0].ec_setting) setECSettings(null);
      else {
        setECSettings({
          autoListing: res[0].ec_setting.auto_listing,
          autoStocking: res[0].ec_setting.auto_stocking,
          autoSellPriceAdjustment: res[0].ec_setting.auto_sell_price_adjustment,
          priceAdjustmentRoundRank:
            res[0].ec_setting.price_adjustment_round_rank,
          priceAdjustmentRoundRule:
            res[0].ec_setting.price_adjustment_round_rule,
          reservedStockNumber: res[0].ec_setting.reserved_stock_number,
          enableSameDayShipping: res[0].ec_setting.enable_same_day_shipping,
          sameDayLimitHour: res[0].ec_setting.same_day_limit_hour,
          shippingDays: res[0].ec_setting.shipping_days,
          closedDay: res[0].ec_setting.closed_day,
          freeShippingPrice: res[0].ec_setting.free_shipping_price,
          delayedPaymentMethod: res[0].ec_setting.delayed_payment_method,
          notificationEmail: res[0].ec_setting.notification_email,
        });
      }
    }
  };
  useEffect(() => {
    fetchECSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isUpdating, setIsUpdating] = useState(false);

  // 紐づけ設定はコンポーネントの方で更新
  const updateECSettings = async () => {
    if (!ECSettings) {
      setAlertState({
        message: '設定を入力してください',
        severity: 'error',
      });
      return;
    }
    setIsUpdating(true);
    try {
      const res = await clientAPI.store.updateEcSetting({
        storeId: store.id,
        EcSetting: ECSettings,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
      }
      setAlertState({
        message: `EC設定を更新しました`,
        severity: 'success',
      });
      setIsEditable(false);
    } catch (error) {
      setAlertState({
        message: `EC設定を更新に失敗しました`,
        severity: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClickOpenButton = () => {
    if (!store.mycalinks_ec_terms_accepted) {
      setIsTermsOfUseModalOpen(true);
    } else {
      setIsOpenCloseAlertModalOpen(true);
    }
  };

  const confirmUpdate = async () => {
    await updateECSettings();
    fetchECSettings();
  };
  return (
    <>
      <ContainerLayout
        title="EC詳細設定"
        actions={
          <Stack
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
            direction="row"
          >
            {store.mycalinks_ec_enabled ? (
              <Box display="flex" alignItems="center" gap={1}>
                <SecondaryButton
                  onClick={() => setIsOpenCloseAlertModalOpen(true)}
                >
                  MycalinksMALLの全出品を取り下げる
                </SecondaryButton>
                <HelpIcon helpArchivesNumber={3691} />
              </Box>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <PrimaryButton onClick={handleClickOpenButton}>
                  ECを利用する
                </PrimaryButton>
                <HelpIcon helpArchivesNumber={3703} />
              </Box>
            )}

            {isEditable ? (
              <PrimaryButton onClick={confirmUpdate} loading={isUpdating}>
                変更を保存
              </PrimaryButton>
            ) : (
              <SecondaryButton onClick={() => setIsEditable(true)}>
                設定を変更
              </SecondaryButton>
            )}
          </Stack>
        }
      >
        <Box sx={{ overflow: 'auto' }}>
          <SaleSettings
            ECSettings={ECSettings}
            setECSettings={setECSettings}
            isEditable={isEditable}
          />
          <DeliverySettings
            ECSettings={ECSettings}
            setECSettings={setECSettings}
            isEditable={isEditable}
          />
          <PaymentMethodSettings
            ECSettings={ECSettings}
            setECSettings={setECSettings}
            isEditable={isEditable}
          />
          <ConditionBindingSettings isEditable={isEditable} />
          <SpecialConditionBindingSettings isEditable={isEditable} />
          <NotificationEmailSettings
            ECSettings={ECSettings}
            setECSettings={setECSettings}
            isEditable={isEditable}
          />
        </Box>
      </ContainerLayout>
      <TermsOfUseModal
        open={isTermsOfUseModalOpen}
        onClose={() => setIsTermsOfUseModalOpen(false)}
      />
      <OpenCloseAlertModal
        open={isOpenCloseAlertModalOpen}
        onClose={() => setIsOpenCloseAlertModalOpen(false)}
      />
    </>
  );
}
