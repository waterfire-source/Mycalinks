import { useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendFunctionsAPI } from '@/app/api/store/[store_id]/functions/api';
import { FunctionsAPI } from '@/api/frontend/functions/api';

interface UploadImageResult {
  success: boolean;
  data?: FunctionsAPI['uploadImage']['response'];
  error?: string;
}

export const useUploadImage = () => {
  const [isUploading, setUploading] = useState(false);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [result, setResult] = useState<UploadImageResult | null>(null);

  const uploadImage = async (
    store_id: number,
    file: File,
    kind: 'item' | 'product' | 'transaction' | 'store',
  ) => {
    setUploading(true);
    setResult(null);
    try {
      const formDataForImage = new FormData();
      formDataForImage.append('file', file);
      formDataForImage.append('kind', kind);

      const response = await clientAPI.functions.uploadImage({
        store_id: store_id,
        body: { file, kind },
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return [];
      }
      const data: BackendFunctionsAPI[0]['response'] = await response;
      setResult({ success: true, data });
    } catch (error) {
      setAlertState({
        message: '画像のアップロード中にエラーが発生しました。',
        severity: 'error',
      });
      setAlertState;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, isUploading, result };
};
