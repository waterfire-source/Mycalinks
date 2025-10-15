import { useState, useMemo, useCallback } from 'react';
import { BackendAccountAPI } from '@/app/api/account/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

export const useAccount = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [account, setAccount] = useState<
    BackendAccountAPI['0']['response']['accounts'][0] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { setAlertState } = useAlert();

  /**
   * AccountIDから情報を取得してstateに保存
   * @param accountID アカウントID
   * @param accountKind アカウント種別
   * @param returnFlag trueなら呼び出し元に値を返す
   */
  const fetchAccountByID = useCallback(
    async (accountID: number, returnFlag = false) => {
      setLoading(true);

      try {
        const res = await clientAPI.account.getAccountById({
          id: accountID.toString(),
        });

        if (res instanceof CustomError) {
          console.error('アカウント情報の取得に失敗しました。');
          setAlertState({
            message: `${res.status}: ${res.message}`,
            severity: 'error',
          });
          return;
        }

        const fetchedAccount = res; // 配列の最初の要素を取得

        if (returnFlag) {
          setAccount(fetchedAccount);
          return fetchedAccount; // 呼び出し元に値を返す
        } else {
          setAccount(fetchedAccount);
        }
      } catch (error) {
        console.error('アカウント情報の取得に失敗しました。', error);
        setAlertState({
          message: 'アカウント情報の取得に失敗しました。',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );

  // すべてのアカウントを取得する
  const fetchAllAccounts = useCallback(async () => {
    const res = await clientAPI.account.listAllAccounts();
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return [];
    }
    return res ?? [];
  }, [clientAPI.account, setAlertState]);

  /**
   * アカウントのパスワードを更新する
   * @param accountId アカウントID
   * @param currentPassword 現在のパスワード
   * @param newPassword 新しいパスワード
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const updatePassword = useCallback(
    async (
      accountId: string | number,
      currentPassword: string,
      newPassword: string,
    ): Promise<boolean> => {
      setLoading(true);

      try {
        const res = await clientAPI.account.updateAccount({
          accountId: accountId.toString(),
          currentPassword,
          newPassword,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${res.message}`,
            severity: 'error',
          });
          return false;
        }

        setAlertState({
          message: 'パスワードの更新に成功しました',
          severity: 'success',
        });

        return true;
      } catch (error) {
        console.error('パスワード更新に失敗しました。', error);
        setAlertState({
          message: 'パスワード更新に失敗しました。',
          severity: 'error',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );

  /**
   * アカウント情報を更新する
   * @param accountId アカウントID
   * @param currentPassword 現在のパスワード
   * @param options 更新オプション（email, displayName, groupId）
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const updateAccount = useCallback(
    async (
      accountId: string | number,
      currentPassword: string,
      options: { email?: string; displayName?: string; groupId?: number },
    ) => {
      setLoading(true);

      try {
        const res = await clientAPI.account.updateAccount({
          accountId: accountId.toString(),
          currentPassword,
          ...options,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${res.message}`,
            severity: 'error',
          });
          return;
        }

        setAlertState({
          message: 'アカウント情報の更新に成功しました',
          severity: 'success',
        });

        return res;
      } catch (error) {
        console.error('アカウント情報の更新に失敗しました。', error);
        setAlertState({
          message: 'アカウント情報の更新に失敗しました。',
          severity: 'error',
        });
        return;
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );

  return {
    account,
    loading,
    fetchAccountByID,
    fetchAllAccounts,
    updatePassword,
    updateAccount,
  };
};
