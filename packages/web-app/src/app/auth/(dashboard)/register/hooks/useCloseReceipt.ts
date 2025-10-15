import { RegisterAPIRes } from '@/api/frontend/register/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useStore } from '@/contexts/StoreContext';
import { useState } from 'react';

export const useCloseReceipt = () => {
  const { ePosDev } = useEposDevice();
  const { store } = useStore();
  const { setAlertState } = useAlert();

  const [isLoading, setIsLoading] = useState(false);

  // 精算レシートの印刷
  const printCloseReceipt = async (
    settlement: RegisterAPIRes['listRegisterSettlement']['settlements'][0],
  ) => {
    if (!ePosDev && !store.register_cash_manage_by_separately) return;

    const settlementId = settlement?.id;

    const clientAPI = createClientAPI();

    if (!settlement?.register_id) return;

    setIsLoading(true);

    const getSettlementRes = await clientAPI.store.getSettlementDetails({
      storeID: store.id,
      registerID: settlement?.register_id,
      settlementID: settlementId,
    });

    if (getSettlementRes instanceof CustomError) {
      setAlertState({
        message: `レジ精算情報を取得できませんでした\n${getSettlementRes.status}:${getSettlementRes.message}`,
        severity: 'error',
      });
      return;
    }

    if (ePosDev) {
      await ePosDev.printWithCommand(getSettlementRes.receiptCommand, store.id);
      if (getSettlementRes.closeReceiptCommand) {
        await ePosDev.printWithCommand(
          getSettlementRes.closeReceiptCommand,
          store.id,
        );
      }
    }

    setIsLoading(false);
  };

  return { printCloseReceipt, isLoading };
};
