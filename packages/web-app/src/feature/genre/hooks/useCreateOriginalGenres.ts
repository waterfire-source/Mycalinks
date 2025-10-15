import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export const useCreateOriginalGenres = () => {
  const clientApi = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { data: session } = useSession();
  const { setAlertState } = useAlert();

  const createOriginalGenres = async (genreNames: string[]) => {
    if (!store.id || !session?.user.id) {
      setAlertState({
        message: 'アカウント情報が取得できませんでした',
        severity: 'error',
      });
      return;
    }
    const res = await Promise.all(
      genreNames.map((name) => {
        clientApi.genre.createGenre({
          storeID: store.id,
          displayName: name,
        });
      }),
    );
    if (res instanceof CustomError) {
      setAlertState({
        message: res.message,
        severity: 'error',
      });
      console.error(res);
      throw new CustomError(res.message, res.status);
    }
    return res;
  };

  return { createOriginalGenres };
};
