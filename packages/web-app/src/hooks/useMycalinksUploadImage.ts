import { useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { MycaAppAPI } from '@/api/frontend/mycaApp/api';
import { useAppAuth } from '@/providers/useAppAuth';

interface UploadImageResult {
  success: boolean;
  data?: MycaAppAPI['uploadImage']['response'];
  error?: string;
}

export const useMycalinksUploadImage = () => {
  const [isUploading, setUploading] = useState(false);
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { getUserId } = useAppAuth();
  const { setAlertState } = useAlert();
  const [result, setResult] = useState<UploadImageResult | null>(null);

  const uploadImage = async (
    file: File,
    kind: 'item' | 'product' | 'transaction' | 'store',
  ) => {
    try {
      setUploading(true);
      setResult(null);
      const userId = await getUserId();
      const formDataForImage = new FormData();
      formDataForImage.append('user', userId?.toString() ?? '');
      formDataForImage.append('file', file);
      formDataForImage.append('kind', kind);
      if (!userId) {
        setAlertState({
          message: 'ユーザーが見つかりません',
          severity: 'error',
        });
        return;
      }
      const response = await clientAPI.mycaApp.uploadImage({
        body: { file: formDataForImage },
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      return response;
    } catch (error) {
      setAlertState({
        message: '画像のアップロード中にエラーが発生しました。',
        severity: 'error',
      });
      setResult({
        success: false,
        error: '画像のアップロード中にエラーが発生しました。',
      });
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, isUploading, result };
};
