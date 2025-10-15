import { createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { PointOpportunity, TransactionPaymentMethod } from '@prisma/client';
import { useCallback, useMemo } from 'react';

export interface StorePointSettingUpdateState {
  visitPointEnabled?: boolean;
  visitPointPer?: PointOpportunity;
  visitPointAmount?: number;
  sellPointEnabled?: boolean;
  sellPointPer?: number;
  sellPointLimitEnabled?: boolean;
  sellPointLimitPer?: PointOpportunity;
  sellPointLimitAmount?: number;
  sellPaymentMethod?: TransactionPaymentMethod[];
  buyPointEnabled?: boolean;
  buyPointPer?: number;
  buyPointLimitEnabled?: boolean;
  buyPointLimitPer?: PointOpportunity;
  buyPointLimitAmount?: number;
  buyPaymentMethod?: TransactionPaymentMethod[];
  pointEnabled?: boolean;
  pointRate?: number;
  pointSpendLimitEnabled?: boolean;
  pointSpendLimitPer?: PointOpportunity;
  pointSpendLimitAmount?: number;
  pointExpireEnabled?: boolean;
  pointExpireDay?: number;
}

export const useUpdateStorePointInfo = () => {
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  const updatePointSetting = useCallback(
    async (storeId: number, updateState: StorePointSettingUpdateState) => {
      try {
        await clientAPI.store.updatePointSetting({
          storeId,
          body: {
            visit_point_enabled: updateState.visitPointEnabled,
            visit_point_per: updateState.visitPointPer,
            visit_point_amount: updateState.visitPointAmount,
            sell_point_enabled: updateState.sellPointEnabled,
            sell_point_per: updateState.sellPointPer,
            sell_point_limit_enabled: updateState.sellPointLimitEnabled,
            sell_point_limit_per: updateState.sellPointLimitPer,
            sell_point_limit_amount: updateState.sellPointLimitAmount,
            sell_point_payment_method: updateState.sellPaymentMethod?.length
              ? updateState.sellPaymentMethod.join(',')
              : undefined,
            buy_point_enabled: updateState.buyPointEnabled,
            buy_point_per: updateState.buyPointPer,
            buy_point_limit_enabled: updateState.buyPointLimitEnabled,
            buy_point_limit_per: updateState.buyPointLimitPer,
            buy_point_limit_amount: updateState.buyPointLimitAmount,
            buy_point_payment_method: updateState.buyPaymentMethod?.length
              ? updateState.buyPaymentMethod.join(',')
              : undefined,
            point_enabled: updateState.pointEnabled,
            point_rate: updateState.pointRate,
            point_spend_limit_enabled: updateState.pointSpendLimitEnabled,
            point_spend_limit_per: updateState.pointSpendLimitPer,
            point_spend_limit_amount: updateState.pointSpendLimitAmount,
            point_expire_enabled: updateState.pointExpireEnabled,
            point_expire_day: updateState.pointExpireDay,
          },
        });

        setAlertState({
          message: 'ポイントの設定を完了しました。',
          severity: 'success',
        });
      } catch (error) {
        handleError(error);
      }
    },
    [clientAPI.store, handleError, setAlertState],
  );

  return {
    updatePointSetting,
  };
};
