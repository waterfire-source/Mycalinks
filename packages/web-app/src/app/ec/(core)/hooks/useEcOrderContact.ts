'use client';

import { useCallback } from 'react';
import { ecImplement } from '@/api/frontend/ec/implement';
import { EcAPI } from '@/api/frontend/ec/api';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

type EcOrderContactData = Exclude<
  EcAPI['getEcOrderContact']['response'],
  CustomError
>;

/**
 * ECオーダーコンタクト関連のカスタムフック
 * @returns ECオーダーコンタクト関連の関数を含むオブジェクト
 */
export const useEcOrderContact = () => {
  const { setAlertState } = useAlert();

  /**
   * オーダーコンタクトを取得する
   * @param code - オーダーコード
   * @param options - 取得オプション
   * @returns オーダーコンタクトの情報、エラーの場合はnull
   */
  const getOrderContact = useCallback(
    async (
      code?: string,
      options?: {
        skip?: number;
        take?: number;
        includesMessages?: boolean;
      },
    ): Promise<EcOrderContactData | null> => {
      try {
        const response = await ecImplement().getEcOrderContact({
          code,
          skip: options?.skip,
          take: options?.take,
          includesMessages: options?.includesMessages,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: '問い合わせ情報の取得に失敗しました',
            severity: 'error',
          });
          return null;
        }

        return response;
      } catch (error) {
        setAlertState({
          message: '問い合わせ情報の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
    },
    [setAlertState],
  );

  /**
   * オーダーコンタクトを作成する
   * @param code - オーダーコード
   * @param params - コンタクト作成のパラメータ
   * @returns 成功時はtrue、失敗時はfalse
   */
  const createOrderContact = useCallback(
    async (
      code: string,
      params: {
        kind?: string;
        title?: string;
        content?: string;
      },
    ): Promise<boolean> => {
      try {
        if (!code) return false;

        const response = await ecImplement().createEcOrderContact({
          body: {
            code,
            kind: params.kind,
            title: params.title,
            content: params.content,
          },
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: 'メッセージの送信に失敗しました',
            severity: 'error',
          });
          return false;
        }

        setAlertState({
          message: 'メッセージを送信しました',
          severity: 'success',
        });
        return true;
      } catch (error) {
        setAlertState({
          message: 'メッセージの送信に失敗しました',
          severity: 'error',
        });
        return false;
      }
    },
    [setAlertState],
  );

  return { getOrderContact, createOrderContact };
};
