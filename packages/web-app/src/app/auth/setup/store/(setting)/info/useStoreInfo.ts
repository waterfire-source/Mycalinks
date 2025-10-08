import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAlert } from '@/contexts/AlertContext';
import { useAccount } from '@/feature/account/hooks/useAccount';
export const useAccountBySession = () => {
  // セッションのuserの中に入っているのが法人のアカウントID
  const { data } = useSession();
  const { setAlertState } = useAlert();
  const { account, fetchAccountByID } = useAccount();
  useEffect(() => {
    if (!data?.user.id) {
      return;
    }
    fetchAccountByID(Number(data?.user.id), true);
  }, [data?.user.id, fetchAccountByID, setAlertState]);
  return { account };
};
