import { GenreAPIRes } from '@/api/frontend/genre/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { Item_Genre } from 'backend-core';
import { useCallback, useMemo, useState } from 'react';

export type Genres = { itemGenres: Array<Item_Genre> };

export const useGenre = (
  showHidden: boolean = false,
  ecAvailable: boolean = false,
) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [genre, setGenre] = useState<GenreAPIRes['getGenreAll']>();

  //ジャンルの取得
  const fetchGenreList = useCallback(
    async (fromTablet: boolean = false) => {
      const res = await clientAPI.genre.getGenreAll({
        storeID: store.id,
        fromTablet,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return null;
      }
      // 非表示ジャンルを表示する場合はそのまま表示、非表示ジャンルを表示しない場合は非表示ジャンルを除外して表示
      let visibleGenres = res;
      if (!showHidden) {
        visibleGenres = {
          ...res,
          itemGenres: res.itemGenres.filter((genre) => !genre.hidden),
        };
      }

      if (ecAvailable) {
        visibleGenres.itemGenres = visibleGenres.itemGenres.filter(
          (genre) => genre.ec_enabled,
        );
      }

      setGenre(visibleGenres);
      return visibleGenres;
    },
    [clientAPI.genre, setAlertState, store.id, showHidden],
  );

  // ジャンルを作成する
  const createGenre = useCallback(
    async ({
      mycaGenreId,
      displayName,
    }: {
      staffAccountId: number;
      mycaGenreId?: number;
      displayName?: string;
    }) => {
      if (!store?.id) return null;

      try {
        if (mycaGenreId) {
          const res = await clientAPI.genre.createMycaGenre({
            storeID: store.id,
            mycaGenreID: mycaGenreId,
          });
          if (res instanceof CustomError) {
            setAlertState({
              message: `${res.status}: ${
                res.message || 'ジャンルの作成に失敗しました'
              }`,
              severity: 'error',
            });
            return null;
          }

          return res;
        }
        if (displayName) {
          const res = await clientAPI.genre.createGenre({
            storeID: store.id,
            displayName,
          });
          if (res instanceof CustomError) {
            setAlertState({
              message: `${res.status}: ${
                res.message || 'ジャンルの作成に失敗しました'
              }`,
              severity: 'error',
            });
            return null;
          }

          return res;
        }
      } catch (error) {
        setAlertState({
          message:
            error instanceof Error
              ? error.message
              : 'ジャンルの作成に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI.genre, setAlertState, store?.id],
  );

  // ジャンルを更新する
  const updateGenre = useCallback(
    async ({
      itemGenreId,
      displayName,
      hidden,
      deleted,
      autoUpdate,
      order,
    }: {
      itemGenreId: number;
      displayName?: string;
      hidden?: boolean;
      deleted?: boolean;
      autoUpdate?: boolean;
      order?: number;
    }) => {
      if (!store?.id) return null;

      try {
        const res = await clientAPI.genre.updateGenre({
          storeID: store.id,
          itemGenreID: itemGenreId,
          displayName,
          hidden,
          deleted,
          autoUpdate,
          order_number: order,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${
              res.message || 'ジャンルの更新に失敗しました'
            }`,
            severity: 'error',
          });
          return null;
        }
        return res;
      } catch (error) {
        setAlertState({
          message:
            error instanceof Error
              ? error.message
              : 'ジャンルの更新に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI.genre, setAlertState, store?.id],
  );

  return {
    genre,
    setGenre,
    fetchGenreList,
    createGenre,
    updateGenre,
  };
};
