import { useState, useMemo, useCallback } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { TransactionKind, TransactionPaymentMethod } from '@prisma/client';

export type addPoint = {
  pointAmount: number; //付与できるポイント
  totalPointAmount: number; //付与したら何ポイントになるのか
};

// 追加可能ポイントの取得
export const useAddPoint = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  const [addPoint, setAddPoint] = useState<addPoint>();

  // 追加可能ポイントの取得
  const fetchAddPoint = useCallback(
    async (
      storeId: number,
      customerId: number,
      totalPrice: number,
      transactionKind?: TransactionKind,
      paymentMethod?: TransactionPaymentMethod,
    ) => {
      const res = await clientAPI.transaction.getAddPoint({
        storeId: storeId,
        customerId: customerId,
        totalPrice: totalPrice,
        transactionKind: transactionKind || 'sell',
        paymentMethod: paymentMethod || 'cash',
      });
      // エラー時はアラートを出して早期return
      if (res instanceof CustomError) {
        console.error('ポイントの取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setAddPoint(res);
    },
    [clientAPI.transaction, setAlertState],
  );

  // 完了した取引を更新する
  const putTransaction = useCallback(
    async (storeId: number, customerId: number, transactionId: number) => {
      const res = await clientAPI.transaction.putTransaction({
        storeId: storeId,
        customerId: customerId,
        transactionId: transactionId,
      });
      // エラー時はアラートを出して早期return
      if (res instanceof CustomError) {
        console.error('ポイントの付与に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
    },
    [clientAPI.transaction, setAlertState],
  );

  return {
    addPoint,
    fetchAddPoint,
    putTransaction,
  };
};
