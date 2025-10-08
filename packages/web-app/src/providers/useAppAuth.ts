import { createClientAPI, CustomError, getAppUserId } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { CustomCrypto } from '@/utils/crypto';
import { useCallback } from 'react';
import { setAppStorageData } from '@/app/ec/(core)/utils/appStorage';

/**
 * アプリ側認証系のカスタムフック
 */
export const useAppAuth = () => {
  const { setAlertState } = useAlert();

  /**
   * ログインする
   */
  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const hashedPassword = CustomCrypto.sha256(password);

      const apiClient = createClientAPI();
      const res = await apiClient.ec.appLogin({
        email,
        hashedPassword,
      });

      if (res.length != 1)
        setAlertState({
          severity: 'error',
          message: 'ログインに失敗しました',
        });

      const thisUserInfo = res[0];

      setAppStorageData({
        longToken: thisUserInfo.longToken,
      });

      const appUserId = await getAppUserId();

      return {
        appUserId,
      };
    },
    [],
  );

  /**
   * アプリ新規会員登録
   */
  const signUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const hashedPassword = CustomCrypto.sha256(password);

      const apiClient = createClientAPI();

      try {
        const res = await apiClient.ec.appRegister({
          email,
          hashedPassword,
        });

        setAlertState({
          severity: 'success',
          message: '会員登録が完了しました',
        });
        return res;
      } catch (e: unknown) {
        if (e instanceof CustomError) {
          switch (e.status) {
            case 210:
              setAlertState({
                severity: 'error',
                message: 'メールアドレスまたはパスワードが入力されていません',
              });
              throw e;
            case 211:
              setAlertState({
                severity: 'error',
                message: 'このメールアドレスはすでに登録されています',
              });
              throw e;
            default:
              setAlertState({
                severity: 'error',
                message: '不明なエラー',
              });
              throw e;
          }
        }
      }
    },
    [],
  );

  /**
   * アプリアカウント情報を取得する
   */
  const getAccountInfo = useCallback(async () => {
    const apiClient = createClientAPI();

    try {
      const res = await apiClient.ec.getAppAccountInfo();
      return res;
    } catch (e: unknown) {
      if (e instanceof CustomError) {
        switch (e.status) {
          case 401:
            setAlertState({
              severity: 'error',
              message: '認証エラーが発生しました。再度ログインしてください。',
            });
            break;
          case 404:
            setAlertState({
              severity: 'error',
              message: 'アカウント情報が見つかりません',
            });
            break;
          default:
            setAlertState({
              severity: 'error',
              message: 'アカウント情報の取得中にエラーが発生しました',
            });
        }
        throw e;
      }
      // 予期しないエラーの場合
      setAlertState({
        severity: 'error',
        message: '予期しないエラーが発生しました',
      });
      throw e;
    }
  }, []);

  /**
   * 会員情報を更新する
   */
  const updateUserInfo = useCallback(
    async (userInfo: {
      displayName?: string;
      birthday?: string;
      gender?: string;
      career?: string;
      fullName?: string;
      fullNameRuby?: string;
      phoneNumber?: string;
      password?: string;
      address?: string;
      address2?: string;
      city?: string;
      prefecture?: string;
      building?: string;
      zipCode?: string;
      deviceId?: number;
      mail?: string;
    }) => {
      const apiClient = createClientAPI();

      const updateData = { ...userInfo };
      if (updateData.password) {
        updateData.password = CustomCrypto.sha256(updateData.password);
      }

      try {
        const res = await apiClient.ec.updateAppAccountInfo(updateData);

        setAlertState({
          severity: 'success',
          message: '会員情報が更新されました',
        });
        return res;
      } catch (e: unknown) {
        if (e instanceof CustomError) {
          switch (e.status) {
            case 210:
              setAlertState({
                severity: 'error',
                message: '必須項目が入力されていません',
              });
              throw e;
            case 220:
              setAlertState({
                severity: 'error',
                message: 'ユーザーが見つかりません',
              });
              throw e;
            case 230:
              setAlertState({
                severity: 'error',
                message: 'メールアドレスは既に使用されています',
              });
              throw e;
            default:
              setAlertState({
                severity: 'error',
                message: '更新中にエラーが発生しました',
              });
              throw e;
          }
        }
        // 予期しないエラーの場合
        setAlertState({
          severity: 'error',
          message: '予期しないエラーが発生しました',
        });
        throw e;
      }
    },
    [],
  );

  /**
   * アプリのユーザーIDを取得する。ログインしてなかったらnull
   */
  const getUserId = useCallback(async () => {
    try {
      return getAppUserId();
    } catch (e) {
      return null;
    }
  }, []);

  /**
   * アプリのサインアウト。トークンを消すだけ
   */
  const signOut = useCallback(async () => {
    setAppStorageData({});
    return await getUserId();
  }, []);

  return {
    signIn,
    getUserId,
    getAccountInfo,
    signUp,
    signOut,
    updateUserInfo,
  };
};
