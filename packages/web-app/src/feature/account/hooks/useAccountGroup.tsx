import { useState, useMemo, useCallback } from 'react';
import { AccountGroupApiRes } from '@/api/frontend/accountGroup/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

export type AccountGroupType = AccountGroupApiRes['listAllAccountGroups'][0];

export const useAccountGroup = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [accountGroups, setAccountGroups] = useState<AccountGroupType[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const { setAlertState } = useAlert();

  /**
   * @param accountGroupId アカウントグループID
   */
  const fetchAccountGroups = useCallback(async () => {
    setLoading(true);
    const res = await clientAPI.accountGroup.listAllAccountGroups();

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}: ${res.message}`,
        severity: 'error',
      });
      return;
    }
    setAccountGroups(res);

    setLoading(false);
    return res;
  }, [clientAPI.accountGroup, setAlertState]);

  return {
    accountGroups,
    loading,
    fetchAccountGroups,
  };
};
