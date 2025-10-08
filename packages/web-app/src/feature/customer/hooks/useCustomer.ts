import { createClientAPI, CustomError } from '@/api/implement';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export type CustomerType =
  | BackendCustomerAPI[0]['response']['200']
  | BackendCustomerAPI[1]['response']['200'][0];

export const useCustomer = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  // 顧客のstate
  const [customer, setCustomer] = useState<CustomerType | undefined>(undefined);

  // stateを初期化
  const resetCustomer = () => setCustomer(undefined);

  // CustomerIDから顧客を取得してstateに保存
  const fetchCustomerByCustomerID = useCallback(
    async (
      storeID: number,
      customerID: number,
      includesTransactionStats?: true,
    ) => {
      const res = await clientAPI.customer.getCustomerByID({
        store_id: storeID,
        customer_id: customerID,
        includesTransactionStats: includesTransactionStats,
      });
      // エラー時はアラートを出して早期return
      if (res instanceof CustomError) {
        console.error('顧客情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setCustomer(res);
    },
    [clientAPI.customer, setAlertState],
  );

  // mycaID, mycaBarCodeから顧客を取得してstateに保存
  const fetchCustomerByMycaID = useCallback(
    async (storeID: number, mycaID?: number, mycaBarCode?: string) => {
      const res = await clientAPI.customer.getCustomerByMycaID({
        store_id: storeID,
        myca_user_id: mycaID,
        mycaBarCode: mycaBarCode,
      });
      // エラー時はアラートを出して早期return
      if (res instanceof CustomError) {
        console.error('顧客情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setCustomer(res);
    },
    [clientAPI.customer, setAlertState],
  );

  const updateMemo = useCallback(
    async (storeID: number, memo: string) => {
      if (!customer) {
        setAlertState({
          message: '顧客情報が取得できていません。',
          severity: 'error',
        });
        return;
      }
      const response = await clientAPI.customer.updateCustomer({
        store_id: storeID,
        customer_id: customer.id,
        memo,
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return response;
      }
      return response;
    },
    [clientAPI.customer, setAlertState, customer],
  );

  return {
    customer,
    resetCustomer,
    fetchCustomerByCustomerID,
    fetchCustomerByMycaID,
    updateMemo,
  };
};
