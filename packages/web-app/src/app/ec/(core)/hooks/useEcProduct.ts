'use client';

import { createClientAPI } from '@/api/implement';
import type { EcAPI } from '@/api/frontend/ec/api';
import { ConditionOptionHandle } from '@prisma/client';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback } from 'react';

type Options = {
  conditionOption?: ConditionOptionHandle;
  hasStock?: boolean;
  orderBy?: string;
  minPrice?: number;
  maxPrice?: number;
};

/**
 * 商品詳細を取得するためのカスタムフック
 * @returns 商品詳細取得用の関数を含むオブジェクト
 */
export const useEcProduct = () => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();

  /**
   * 商品詳細を取得する
   * @param mycaItemId - 商品ID
   * @param options - 取得オプション
   * @returns 商品詳細情報、エラーの場合はnull
   */
  const getEcProduct = useCallback(
    async (
      mycaItemId: number,
      options?: Options,
      specialty?: string,
    ): Promise<Exclude<
      EcAPI['getEcProduct']['response'],
      CustomError
    > | null> => {
      try {
        const res = await clientAPI.ec.getEcProduct({
          mycaItemId: mycaItemId,
          conditionOption: options?.conditionOption,
          hasStock: options?.hasStock,
          specialty: specialty,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: '商品情報の取得に失敗しました',
            severity: 'error',
          });
          return null;
        }

        return res;
      } catch (error) {
        setAlertState({
          message: '商品情報の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [clientAPI, setAlertState],
  );

  return { getEcProduct };
};
