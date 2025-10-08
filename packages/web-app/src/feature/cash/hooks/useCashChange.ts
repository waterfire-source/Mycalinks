import { useCallback, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import { useAlert } from '@/contexts/AlertContext';

export interface ChangeRegisterCashInfo {
  inputAmount: number;
  reason: string | null;
  type: ChangeRegisterKind;
}

// レジ現金操作を行うカスタムフック
export const useCashChange = (
  storeId: number,
  cashRegisterId: number | null,
) => {
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  const [changeRegisterCashInfo, setChangeRegisterCashInfo] =
    useState<ChangeRegisterCashInfo>({
      inputAmount: 0,
      reason: null,
      type: ChangeRegisterKind.export,
    });

  // 実行条件を保存する関数
  const handlerChangeRegisterInfo = useCallback(
    (prop: keyof typeof changeRegisterCashInfo, eventTarget: any | number) => {
      setChangeRegisterCashInfo({
        ...changeRegisterCashInfo,
        [prop]: eventTarget.value || eventTarget,
      });
    },
    [changeRegisterCashInfo],
  );

  //レジ現金操作の実行
  const submitChangeRegisterCash = useCallback(async () => {
    const changeAmount =
      (changeRegisterCashInfo.type == 'export' ? -1 : 1) *
      changeRegisterCashInfo.inputAmount;

    if (!cashRegisterId) {
      setAlertState({
        message: 'レジが未選択です',
        severity: 'error',
      });
      return;
    }

    //レジ現金の入出金を行う

    const res = await clientAPI.register.changeRegisterCash({
      storeID: storeId || 0,
      registerID: cashRegisterId,
      changeAmount: changeAmount,
      toAmount: undefined,
      reason: changeRegisterCashInfo.reason,
      kind: changeRegisterCashInfo.type,
    });
    if (res instanceof CustomError) {
      throw res;
    }
  }, [
    cashRegisterId,
    changeRegisterCashInfo,
    clientAPI.register,
    setAlertState,
    storeId,
  ]);

  return {
    changeRegisterCashInfo,
    handlerChangeRegisterInfo,
    submitChangeRegisterCash,
  };
};
