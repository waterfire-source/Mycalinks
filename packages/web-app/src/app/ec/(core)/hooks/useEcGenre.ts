import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

/**
 * 設定定数関連のカスタムフック
 * MycaアプリのAPI呼び出しを行い、システム全体で使用される設定定数を取得する
 */
export const useEcGenre = () => {
  const { setAlertState } = useAlert();

  /**
   * 設定定数を取得する
   * MycaアプリのAPIから設定定数データを取得する
   */
  const getEcGenre = async () => {
    const clientAPI = createClientAPI();

    try {
      const result = await clientAPI.ec.getEcGenre();
      if (result instanceof CustomError) {
        setAlertState({
          message: 'ジャンルの取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
      if ('genres' in result) {
        return result.genres;
      }
      return null;
    } catch (error) {
      setAlertState({
        message: 'ジャンルの取得に失敗しました',
        severity: 'error',
      });
      return null;
    }
  };

  return {
    getEcGenre,
  };
};
