'use client';

import { useCallback, useState } from 'react';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Gmo_Credit_Card } from '@prisma/client';
import { ecImplement } from '@/api/frontend/ec/implement';

/**
 * ECクレジットカード関連のカスタムフック
 */
export const useEcCreditCard = () => {
  const { setAlertState } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditCardList, setCreditCardList] = useState<Gmo_Credit_Card[]>([]);

  /**
   * カード取得
   */
  const fetchCreditCardList = useCallback(async (): Promise<void> => {
    setIsProcessing(true);

    try {
      const response = await ecImplement().getEcUserCreditCard();

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }

      setCreditCardList(response.cards);
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [setAlertState]);

  /**
   * カード登録
   */
  const registerCreditCard = useCallback(
    async (cardToken: string): Promise<Gmo_Credit_Card | null> => {
      setIsProcessing(true);

      try {
        const response = await ecImplement().registerEcUserCreditCard({
          token: cardToken,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return null;
        }

        setAlertState({
          message: 'クレジットカードを登録しました。',
          severity: 'success',
        });
        return response;
      } catch (error) {
        if (error instanceof CustomError) {
          setAlertState({
            message: `${error.status}:${error.message}`,
            severity: 'error',
          });
        }
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [setAlertState],
  );

  return {
    fetchCreditCardList,
    registerCreditCard,
    creditCardList,
    isProcessing,
  };
};
