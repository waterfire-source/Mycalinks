import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';

export enum DeckAvailableProductsPriorityOption {
  COST = 'COST',
  SHIPPING_DAYS = 'SHIPPING_DAYS',
}

export const useEcDeck = () => {
  const { setAlertState } = useAlert();

  const clientAPI = useMemo(() => createClientAPI(), []);
  /**
   * デッキで指定された商品のうち、在庫があるものを取得する
   */
  const getEcDeckAvailableProducts = useCallback(
    async (
      anyRarity: boolean,
      anyCardnumber: boolean,
      deckId?: number,
      code?: string,
      conditionOption?: string,
      priorityOption?: DeckAvailableProductsPriorityOption,
    ) => {
      try {
        const response = await clientAPI.ec.getEcDeckAvailableProducts({
          deckId,
          code,
          anyRarity,
          anyCardnumber,
          conditionOption,
          priorityOption,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: '在庫の取得に失敗しました',
            severity: 'error',
          });
          return null;
        }

        return response;
      } catch (error) {
        setAlertState({
          message: '在庫の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [],
  );

  return {
    getEcDeckAvailableProducts,
  };
};
