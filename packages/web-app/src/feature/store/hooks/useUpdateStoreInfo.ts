import { StoreAPI } from '@/api/frontend/store/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useCallback, useMemo } from 'react';

//店舗の詳細情報を更新する
export const useUpdateStoreInfo = () => {
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  interface UpdateStoreInfoParams
    extends Omit<
      StoreAPI['updateStoreInfo']['request'],
      'storeID' | 'opened'
    > {}

  const updateStoreInfo = useCallback(
    async (updateParams: UpdateStoreInfoParams, storeID?: number) => {
      const res = await clientAPI.store.updateStoreInfo({
        storeID: storeID || store.id,
        ...updateParams,
      });
      if (res instanceof CustomError) {
        console.error('店舗情報の更新に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      return res;
    },
    [clientAPI.store, setAlertState, store.id],
  );

  // 開店処理
  // const openStore = useCallback(
  //   async (storeID?: number) => {
  //     // const res = await clientAPI.store.updateStoreInfo({
  //     //   storeID: storeID || store.id,
  //     //   opened: true,
  //     // });
  //     // if (res instanceof CustomError) {
  //     //   console.error('店舗の開店に失敗しました。');
  //     //   setAlertState({
  //     //     message: `${res.status}:開店登録に失敗しました。`,
  //     //     severity: 'error',
  //     //   });
  //     //   return null;
  //     // }
  //     // return res;
  //   },
  //   [clientAPI.store, setAlertState, store.id],
  // );

  // 閉店処理
  // const closeStore = useCallback(
  //   async (storeID?: number) => {
  //     const res = await clientAPI.store.updateStoreInfo({
  //       storeID: storeID || store.id,
  //       opened: false,
  //     });
  //     if (res instanceof CustomError) {
  //       console.error('店舗の開店に失敗しました。');
  //       setAlertState({
  //         message: `${res.status}:閉店登録に失敗しました。`,
  //         severity: 'error',
  //       });
  //       return null;
  //     }
  //     return res;
  //   },
  //   [clientAPI.store, setAlertState, store.id],
  // );

  return { updateStoreInfo };
};
