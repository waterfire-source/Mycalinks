import { useState, useCallback } from 'react';
import { UseFormReset } from 'react-hook-form';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

interface ShopInfoForm {
  shop_pr: string;
  images: string[];
  about_shipping: string;
  about_shipping_fee: string;
  cancel_policy: string;
  return_policy: string;
}

export const useShopInfo = (
  storeId: string,
  reset: UseFormReset<ShopInfoForm>,
  setImageUrls: (urls: string[]) => void,
  setIsEditing: (editing: boolean) => void,
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  // 店舗情報を取得
  const fetchShopInfo = useCallback(async () => {
    try {
      const response = await clientAPI.ec.getEcStoreAboutUs({
        ecStoreId: Number(storeId),
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `店舗情報の取得に失敗しました: ${response.message}`,
          severity: 'error',
        });
        return;
      }

      const data = {
        shop_pr: response.shop_pr || '',
        images: response.images || [],
        about_shipping: response.about_shipping || '',
        about_shipping_fee: response.about_shipping_fee || '',
        cancel_policy: response.cancel_policy || '',
        return_policy: response.return_policy || '',
      };

      reset(data);
      setImageUrls(data.images.length > 0 ? data.images : ['']);
    } catch (error) {
      setAlertState({
        message: '店舗情報の取得に失敗しました',
        severity: 'error',
      });
    }
  }, [storeId, clientAPI, setAlertState, reset, setImageUrls]);

  // 店舗情報を保存
  const onSubmit = useCallback(
    (imageUrls: string[]) => async (data: ShopInfoForm) => {
      setIsSaving(true);
      try {
        // バリデーション: 画像以外の項目は必須
        const requiredFields = [
          { field: 'shop_pr', label: 'ショップPR' },
          { field: 'about_shipping', label: '商品の発送について' },
          { field: 'about_shipping_fee', label: '送料について' },
          { field: 'cancel_policy', label: 'キャンセルポリシー' },
          { field: 'return_policy', label: '返品ポリシー' },
        ];

        const emptyFields = requiredFields.filter(({ field }) => {
          const value = data[field as keyof ShopInfoForm] as string;
          return !value || value.trim() === '';
        });

        if (emptyFields.length > 0) {
          const missingFieldNames = emptyFields
            .map(({ label }) => label)
            .join('\n・');
          setAlertState({
            message: `以下の項目は必須入力です:\n・${missingFieldNames}`,
            severity: 'error',
          });
          setIsSaving(false);
          return;
        }

        // 空の画像URLを除去
        const validImageUrls = imageUrls.filter((url) => url.trim() !== '');

        const response = await clientAPI.store.updateEcAboutUs({
          storeId: Number(storeId),
          ...data,
          images: validImageUrls,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}: ${response.message}`,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: 'ショップ情報を更新しました',
            severity: 'success',
          });
          setIsEditing(false);
        }
      } catch (error) {
        setAlertState({
          message: 'ショップ情報の更新に失敗しました',
          severity: 'error',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [storeId, clientAPI, setAlertState, setIsEditing],
  );

  return {
    isSaving,
    fetchShopInfo,
    onSubmit,
  };
};
