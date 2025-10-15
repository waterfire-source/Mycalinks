import { useEffect, useState } from 'react';
import { MycaPosApiClient, ApiError } from 'api-generator/client';
import { format, addHours } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ContractInfo {
  mainAccountFee: number;
  headquartersFee: number;
  mobileAppFee: number;
  initialCost: number;
}

interface UseContractInfoReturn {
  contractInfo: ContractInfo | null;
  loading: boolean;
  error: string | null;
}

export const useContractInfo = (
  token: string | null,
): UseContractInfoReturn => {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractInfo = async () => {
      // トークンが指定されていない場合はエラー
      if (!token) {
        setError('無効なアクセスです。正しいURLからアクセスしてください。');
        setLoading(false);
        return;
      }

      const apiClient = new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      });

      try {
        const response = await apiClient.contract.getContracts({ token });

        if (response) {
          // トークンの有効期限をチェック
          const expiresAt = new Date(response.token_expires_at);
          const now = new Date();

          if (expiresAt < now) {
            // 期限切れの場合、日本時間での有効期限を表示
            const jstDate = addHours(expiresAt, 9); // UTC+9 (JST)
            const formattedDate = format(jstDate, 'yyyy年MM月dd日 HH:mm', {
              locale: ja,
            });
            setError(
              `このURLの有効期限が切れています。\n有効期限: ${formattedDate}\n\n新しい登録URLの発行については、担当者にお問い合わせください。`,
            );
            return;
          }

          // APIから取得した料金情報を設定
          setContractInfo({
            mainAccountFee: response.main_account_monthly_fee,
            headquartersFee: response.corporation_management_account_fee,
            mobileAppFee: response.mobile_device_connection_fee,
            initialCost: response.initial_fee,
          });
        }
      } catch (e) {
        console.error('契約情報の取得に失敗しました:', e);
        if (e instanceof ApiError) {
          if (e.status === 404) {
            setError('契約情報が見つかりません。URLを確認してください。');
          } else {
            setError(
              '契約情報の取得に失敗しました。しばらく経ってから再度お試しください。',
            );
          }
        } else {
          setError('予期しないエラーが発生しました。');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContractInfo();
  }, [token]);

  return { contractInfo, loading, error };
};
