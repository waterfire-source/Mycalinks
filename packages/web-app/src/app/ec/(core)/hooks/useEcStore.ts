import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';

export type GetEcStoreResponse = Awaited<
  ReturnType<MycaPosApiClient['ec']['getEcStore']>
>['stores'];

/**
 * ECストア関連のカスタムフック
 * ECを利用しているストアの一覧を取得する
 */
export const useEcStore = () => {
  const { setAlertState } = useAlert();

  /**
   * ECを利用しているストアの一覧を取得する
   * ECサイトで利用可能なストア情報を取得する
   */
  const getEcStore = async (): Promise<GetEcStoreResponse | null> => {
    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_EC_ORIGIN}/api`,
    });

    try {
      const result = await apiClient.ec.getEcStore();
      if (result instanceof CustomError) {
        setAlertState({
          message: 'ストア情報の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
      if ('stores' in result) {
        const sortedStores = [...result.stores].sort((a, b) =>
          (a.display_name ?? '').localeCompare(
            b.display_name ?? '',
            'ja',
            { numeric: true, sensitivity: 'base' },
          ),
        );
        return sortedStores;
      }
      return null;
    } catch (error) {
      setAlertState({
        message: 'ストア情報の取得に失敗しました',
        severity: 'error',
      });
      return null;
    }
  };

  return {
    getEcStore,
  };
};
