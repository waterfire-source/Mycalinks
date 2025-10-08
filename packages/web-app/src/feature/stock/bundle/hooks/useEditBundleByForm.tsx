import { ItemAPI } from '@/api/frontend/item/api';
import { useAlert } from '@/contexts/AlertContext';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { useBundles } from '@/feature/stock/bundle/hooks/useBundles';
import { BundleFormDataType } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import { useStore } from '@/contexts/StoreContext';
export const useEditBundleByForm = () => {
  const { updateBundle } = useBundles();
  const { store } = useStore();
  const { setAlertState } = useAlert();

  const updateBundleByForm = async (
    formData: BundleFormDataType,
    bundle: BundleSetProductType,
  ) => {
    let isValid = true;
    if (formData.bundleStockNumber === null) {
      setAlertState({
        message: '在庫数が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.bundleName === null) {
      setAlertState({
        message: '商品名が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.bundleStockNumber === null) {
      setAlertState({
        message: '在庫数が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.bundleStockNumber === null) {
      setAlertState({
        message: '在庫数が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.sellPrice === null) {
      setAlertState({
        message: '販売価格が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (!isValid) return;
    const payload: ItemAPI['updateBundle']['request'] = {
      id: bundle.id,
      storeID: store.id,
      initStockNumber: formData.bundleStockNumber ?? 0,
      displayName: formData.bundleName ?? '',
      sellPrice: formData.sellPrice ?? 0,
      startAt: formData.startAt,
      expiredAt: formData.expiredAt,
      genreID: formData.genreID,
      imageUrl: formData.imageUrl,
      products: bundle.products,
    };
    await updateBundle(payload);
  };
  return {
    updateBundleByForm,
  };
};
