import { useState, useMemo, useCallback } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { AccountApiRes } from '@/api/frontend/account/api';

export type AccountType = AccountApiRes['listAllAccounts'][0];

export const useAccounts = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [accounts, setAccounts] = useState<AccountType[] | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const { setAlertState } = useAlert();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await clientAPI.account.listAllAccounts();
      if (res instanceof CustomError) {
        console.error('アカウント情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        return;
      }
      if (res) setAccounts(res);

      return res;
    } catch (error) {
      console.error('アカウント情報の取得に失敗しました。', error);
      setAlertState({
        message: 'アカウント情報の取得に失敗しました。',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [clientAPI.account, setAlertState]);

  /**
   * アカウントのパスワードを更新する
   * @param accountId アカウントID
   * @param currentPassword 現在のパスワード
   * @param newPassword 新しいパスワード
   */
  const updatePassword = useCallback(
    async (
      accountId: number,
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
          throw res;
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
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );
  /**
   * アカウント情報を作成する
   * @param display_name 名前
   * @param email メールアドレス
   * @param group_id グループID
   * @param store_ids 管理できる店舗ID
   * @param nick_name 表示名
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const createAccount = useCallback(
    async (
      displayName: string,
      email: string,
      groupId: number,
      storeIds: number[],
      nickName?: string,
    ) => {
      setLoading(true);

      try {
        const res = await clientAPI.account.createAccount({
          displayName,
          email,
          groupId,
          storeIds,
          nickName,
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${res.message}`,
            severity: 'error',
          });
          throw res;
        }

        setAlertState({
          message: 'アカウント情報の作成に成功しました',
          severity: 'success',
        });

        return res;
      } catch (error) {
        console.error('アカウント情報の作成に失敗しました。', error);
        setAlertState({
          message: 'アカウント情報の作成に失敗しました。',
          severity: 'error',
        });
        throw error;
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
   * @param options 更新オプション（email, displayName, groupId, storeIds）
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const updateAccount = useCallback(
    async (
      accountId: number,
      currentPassword: string,
      options: {
        email?: string;
        displayName?: string;
        groupId?: number;
        code?: number;
        nickName?: string;
        storeIds?: number[];
      },
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
          throw res;
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
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );

  /**
   * アカウント情報を削除する
   * @param accountId アカウントID
   * @returns 成功した場合はtrue、失敗した場合はfalse
   */
  const deleteAccount = useCallback(
    async (accountId: string | number) => {
      setLoading(true);

      try {
        const res = await clientAPI.account.deleteAccount({
          accountId: accountId.toString(),
        });

        if (res instanceof CustomError) {
          setAlertState({
            message: `${res.status}: ${res.message}`,
            severity: 'error',
          });
          throw res;
        }

        setAlertState({
          message: 'アカウント情報の削除に成功しました',
          severity: 'success',
        });

        return res;
      } catch (error) {
        console.error('アカウント情報の削除に失敗しました。', error);
        setAlertState({
          message: 'アカウント情報の削除に失敗しました。',
          severity: 'error',
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clientAPI.account, setAlertState],
  );

  return {
    accounts,
    loading,
    fetchAccounts,
    updatePassword,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
