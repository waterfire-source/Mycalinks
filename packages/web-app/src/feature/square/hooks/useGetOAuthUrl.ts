import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useCallback, useMemo } from 'react';
import { SquareAPI } from '@/api/frontend/square/api';
import { useRouter } from 'next/navigation';
export const useGetOAuthUrl = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { push } = useRouter();

  // ここで渡すパラメータの定義
  const getOAuthUrl = useCallback(
    /**
     * @param succeedCallbackUrl - 成功した時の遷移先URL(渡す時は相対パスでok(ex. '/setup/corporation/1/info'))
     * @param failedCallbackUrl - 失敗した時の遷移先URL(渡す時は相対パスでok(ex. '/setup/corporation/1/info'))
     * @returns {url: string} - OAuth同意画面のURL
     */
    async (params: SquareAPI['getSquareOAuthUrl']['request']) => {
      const res = await clientAPI.square.getSquareOAuthUrl({
        succeedCallbackUrl:
          process.env.NEXT_PUBLIC_ORIGIN + params.succeedCallbackUrl,
        failedCallbackUrl:
          process.env.NEXT_PUBLIC_ORIGIN + params.failedCallbackUrl,
      });
      if (res?.url) {
        push(res.url);
      }
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}: ${res.message}`,
          severity: 'error',
        });
        throw res;
      }
      return res;
    },
    [clientAPI.square, push, setAlertState],
  );

  return { getOAuthUrl };
};
