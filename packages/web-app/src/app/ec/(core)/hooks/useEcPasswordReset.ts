import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { forgetPasswordDef } from '@/app/api/ec/def';
import { CustomCrypto } from '@/utils/crypto';
import { setAppStorageData } from '@/app/ec/(core)/utils/appStorage';

/**
 * ECパスワードリセット関連のカスタムフック
 */
export const useEcPasswordReset = () => {
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  /**
   * パスワード再発行APIを呼び出す
   */
  const forgetPassword = async (
    request: typeof forgetPasswordDef.request.body,
  ): Promise<typeof forgetPasswordDef.response | null> => {
    try {
      const result = await clientAPI.ec.forgetPassword(request);
      if (result instanceof CustomError) {
        setAlertState({
          message: result.message || 'パスワード再発行に失敗しました',
          severity: 'error',
        });
        return null;
      }
      return result;
    } catch (error) {
      setAlertState({
        message: 'パスワード再発行中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  /**
   * パスワード変更APIを呼び出す
   */
  const changePassword = async ({
    user,
    password,
  }: {
    user: number;
    password: string;
  }): Promise<{ ok: string } | CustomError | null> => {
    const hashedPassword = CustomCrypto.sha256(password);
    try {
      const result = await clientAPI.ec.changePassword({
        user,
        hashed_password: hashedPassword,
      });
      if (result instanceof CustomError) {
        setAlertState({
          message: result.message || 'パスワード変更に失敗しました',
          severity: 'error',
        });
        return null;
      }
      // 正常系は { ok: string } の形式
      if (result && typeof result === 'object' && 'ok' in result) {
        return result as { ok: string };
      } else {
        setAlertState({
          message: 'パスワード変更に失敗しました',
          severity: 'error',
        });
        return null;
      }
    } catch (error) {
      setAlertState({
        message: 'パスワード変更中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  /**
   * アプリケーションログインAPIを呼び出す
   */
  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<
    | { id: string; role: string | null; created: string; longToken: string }[]
    | null
  > => {
    const hashedPassword = CustomCrypto.sha256(password);
    try {
      const result = await clientAPI.ec.appLogin({ email, hashedPassword });
      const thisUserInfo = result[0];

      // ログインかパスワードが間違っているときは204でresultが空配列
      if (result.length === 0) {
        setAlertState({
          message: 'ログインかパスワードが間違っています',
          severity: 'error',
        });
        return null;
      }

      setAppStorageData({
        longToken: thisUserInfo.longToken,
      });

      return result;
    } catch (error) {
      setAlertState({
        message: 'サインイン中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  return {
    forgetPassword,
    changePassword,
    signIn,
  };
};
