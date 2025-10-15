'use client';

import { useCallback, useState } from 'react';
import { ecImplement } from '@/api/frontend/ec/implement';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { EcPaymentMethod, Gmo_Credit_Card } from '@prisma/client';
import { ConvenienceCode } from '@/app/ec/(core)/constants/convenience';

export type PaymentResult = {
  success: boolean;
  message?: string;
  redirectUrl?: string;
  orderId?: number;
};

/**
 * EC決済関連のカスタムフック
 */
export const useEcPayment = () => {
  const { setAlertState } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 注文を確定する
   * @param orderId 注文ID
   * @param paymentMethod 支払い方法
   * @param totalPrice 合計金額
   * @param cardToken クレジットカードトークン（カード決済の場合）
   * @param convenienceCode コンビニコード（コンビニ決済の場合）
   * @returns 決済結果
   */
  const confirmOrder = useCallback(
    async (
      orderId: number,
      paymentMethod: EcPaymentMethod,
      totalPrice: number,
      cardId?: Gmo_Credit_Card['id'],
      convenienceCode?: ConvenienceCode,
    ): Promise<PaymentResult> => {
      if (!orderId || !paymentMethod) {
        setAlertState({
          message: '注文情報が不完全です',
          severity: 'error',
        });
        return { success: false, message: '注文情報が不完全です' };
      }

      setIsProcessing(true);

      try {
        const result = await ecImplement().payEcOrder({
          orderId,
          body: {
            paymentMethod,
            totalPrice,
            cardId,
            convenienceCode,
          },
        });

        if (result instanceof CustomError) {
          setAlertState({
            message: '決済処理に失敗しました: ' + result.message,
            severity: 'error',
          });
          return {
            success: false,
            message: '決済処理に失敗しました: ' + result.message,
          };
        }

        // クレジットカード決済の場合、リダイレクトURLがあるかチェック
        if (
          paymentMethod === EcPaymentMethod.CARD &&
          result.cardPaymentInfo?.redirectUrl
        ) {
          return {
            success: true,
            message: '決済画面へリダイレクトします',
            redirectUrl: result.cardPaymentInfo.redirectUrl,
            orderId: result.id,
          };
        }

        return {
          success: true,
          message: '注文が確定しました',
          orderId: result.id,
        };
      } catch (error) {
        if (error instanceof CustomError) {
          setAlertState({
            message: error.message,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '決済処理中にエラーが発生しました',
            severity: 'error',
          });
        }
        return {
          success: false,
          message: '決済処理中にエラーが発生しました',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [setAlertState],
  );

  return {
    confirmOrder,
    isProcessing,
  };
};
