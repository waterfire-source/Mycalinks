import { useState } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';

/**
 * パック開封のロールバック機能を提供するカスタムフック
 */
export const usePackRollback = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const [isLoadingRollback, setIsLoadingRollback] = useState(false);

  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  /**
   * パック開封のロールバックを実行
   * @param packOpenHistoryId - ロールバック対象のパック開封履歴ID
   * @param isDryRun - ドライラン実行フラグ（デフォルト: false）
   * @returns ロールバック結果、エラーの場合はundefined
   */
  const rollbackPackOpening = async (
    packOpenHistoryId: number,
    isDryRun: boolean = false
  ): Promise<{ ok: string } | undefined> => {
    setIsLoadingRollback(true);
    
    try {
      const response = await apiClient.product.rollbackPackOpening({
        storeId: store.id,
        packOpenHistoryId,
        requestBody: { isDryRun },
      });

      if (!isDryRun) {
        setAlertState({
          message: 'パック開封の取り消しを行いました。',
          severity: 'success',
        });
      }

      return response;
    } catch (error) {
      handleError(error);
      return undefined;
    } finally {
      setIsLoadingRollback(false);
    }
  };

  return {
    rollbackPackOpening,
    isLoadingRollback,
  };
};