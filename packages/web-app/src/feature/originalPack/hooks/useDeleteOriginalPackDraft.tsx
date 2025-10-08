import { createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useState } from 'react';

export const useDeleteOriginalPackDraft = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const APIClient = createClientAPI();
  const { handleError } = useErrorAlert();

  const deleteDraft = async (itemId: number) => {
    setIsLoading(true);
    try {
      await APIClient.item.update({
        storeID: store.id,
        itemID: itemId,
        body: { delete: true },
      });

      setAlertState({ message: '削除に成功しました', severity: 'success' });

      return { ok: true };
    } catch (error) {
      handleError(error);
      return { ok: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deleteDraft };
};
