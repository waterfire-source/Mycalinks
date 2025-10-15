import { useAlert } from '@/contexts/AlertContext';
import { CustomError, createClientAPI } from '@/api/implement';
/**
 * 設定定数関連のカスタムフック
 * MycaアプリのAPI呼び出しを行い、システム全体で使用される設定定数を取得する
 */
export const useISettingConstant = () => {
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  /**
   * 設定定数を取得する
   * MycaアプリのAPIから設定定数データを取得する
   */
  const getSettingConstants = async () => {
    try {
      const response = await clientAPI.ec.getAppSettingConstants();
      if (response instanceof CustomError) {
        setAlertState({
          message: '設定定数の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
      return response;
    } catch (error) {
      setAlertState({
        message: '設定定数の取得に失敗しました',
        severity: 'error',
      });
      return null;
    }
  };

  return {
    getSettingConstants,
  };
};
