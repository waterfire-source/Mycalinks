import { createClientAPI, CustomError } from '@/api/implement';
import { getAppGenreWithPosGenre } from '@/app/api/store/[store_id]/myca-item/def';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export const useAppGenre = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [appGenre, setAppGenre] =
    useState<typeof getAppGenreWithPosGenre.response>();

  //ジャンルの取得
  const fetchAppGenreList = useCallback(
    async (storeID: number) => {
      const res = await clientAPI.genre.getAppGenreAll({
        storeID: storeID,
      });

      console.info('アプリジャンル一覧', res);

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setAppGenre(res);
    },
    [clientAPI.genre, setAlertState],
  );

  return {
    appGenre,
    setAppGenre,
    fetchAppGenreList,
  };
};
