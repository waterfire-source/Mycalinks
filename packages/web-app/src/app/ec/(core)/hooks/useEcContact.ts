'use client';

import { createClientAPI } from '@/api/implement';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

/**
 * 問題報告のカスタムフック
 * @returns 問題報告関連の関数を含むオブジェクト
 */
export const useEcContact = () => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();

  /**
   * 問題を報告する
   * @param kind - 問題の種類
   * @param content - 問題の内容
   * @returns 成功時はtrue、失敗時はfalse
   */
  const reportProblem = async (
    kind: string,
    content: string,
    mycaItemId: number,
  ) => {
    try {
      const res = await clientAPI.ec.submitEcContact({
        body: { kind, content, mycaItemId },
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: '問題の報告に失敗しました',
          severity: 'error',
        });
        return false;
      }

      // 成功時のアラート表示
      setAlertState({
        message: '問題が報告されました',
        severity: 'success',
      });

      return true;
    } catch (error) {
      setAlertState({
        message: '問題の報告に失敗しました',
        severity: 'error',
      });
      return false;
    }
  };

  return { reportProblem };
};
