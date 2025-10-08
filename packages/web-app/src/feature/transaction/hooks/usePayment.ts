import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const usePayment = (isBankChecked?: boolean) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  // 振込済みか否か
  const [bankChecked, setBankChecked] = useState(isBankChecked);

  useEffect(() => {
    setBankChecked(isBankChecked);
  }, [isBankChecked]);

  const putPayment = useCallback(
    async (storeId: number, transactionId: number, bankChecked: boolean) => {
      const res = await clientAPI.transaction.putPayment({
        storeId,
        transactionId,
        payment: {
          bank__checked: bankChecked,
        },
      });
      if (res instanceof CustomError) {
        console.error(`${res.status}:${res.message}`);
        setAlertState({
          message: '銀行振込状況の更新に失敗しました',
          severity: 'error',
        });
        return;
      }
      setAlertState({
        message: `銀行振込状況を更新しました`,
        severity: 'success',
      });
      setBankChecked(res.payment?.bank__checked ?? false);
      return res;
    },
    [clientAPI.transaction, setAlertState],
  );

  return { bankChecked, setBankChecked, putPayment };
};
