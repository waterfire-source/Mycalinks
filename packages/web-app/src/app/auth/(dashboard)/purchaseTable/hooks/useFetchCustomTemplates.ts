import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';

export type CustomTemplate = {
  id: number;
  displayName: string;
  url: string | null;
};

/**
 * 設定でアップロード済みの買取表テンプレートを取得する
 */

export const useFetchCustomTemplates = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  // MycaPosApiClientインスタンスを作成
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );

  // テンプレート一覧を取得
  const fetchCustomTemplates = useCallback(async () => {
    if (!store?.id) return;

    try {
      const data = await apiClient.current.template.getTemplate({
        storeId: store.id,
        kind: 'PURCHASE_TABLE',
      });

      // APIレスポンスをTemplateインターフェースに変換
      const convertedTemplates: CustomTemplate[] = (data.templates || []).map(
        (template) => ({
          id: template.id,
          displayName: template.display_name,
          url: template.url,
        }),
      );

      setCustomTemplates(convertedTemplates);
    } catch (error) {
      handleError(error);
    }
  }, [handleError, store.id]);

  return { customTemplates, fetchCustomTemplates };
};
