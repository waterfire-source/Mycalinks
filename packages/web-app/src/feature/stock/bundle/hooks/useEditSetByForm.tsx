import { useAlert } from '@/contexts/AlertContext';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { useStore } from '@/contexts/StoreContext';
import { SetFormDataType } from '@/feature/stock/set/register/SetSetting/SetSetting';
import { ProductAPI } from '@/api/frontend/product/api';
import { useSetDeals } from '@/feature/stock/set/hooks/useSetDeals';
export const useEditSetByForm = () => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { updateSetDeal } = useSetDeals();

  // 割引値を計算する
  const calculateDiscount = (
    discount: number,
    discountUnit: string,
  ): string => {
    if (discount === 0) {
      return '0';
    } else if (discountUnit === 'JPY') {
      return `-${discount}`;
    } else {
      // 表記上で10%だった場合はAPIに渡すデータは90%になるので変換
      const absPercent = 100 - discount;
      return `${absPercent}%`;
    }
  };

  const updateSetByForm = async (
    formData: SetFormDataType,
    set: BundleSetProductType,
  ) => {
    let isValid = true;
    if (
      formData.setName === undefined ||
      formData.setName === null ||
      formData.setName === ''
    ) {
      setAlertState({
        message: '商品名が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.discount === null) {
      setAlertState({
        message: '割引額が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (formData.discountUnit === null) {
      setAlertState({
        message: '割引額単位が入力されていません',
        severity: 'error',
      });
      isValid = false;
    }
    if (!isValid || formData.setName === undefined) return;
    const payload: ProductAPI['updateSetDeal']['request'] = {
      setDealID: set.id,
      storeID: store.id,
      startAt: formData.startAt,
      expiredAt: formData.expiredAt,
      imageUrl: formData.imageUrl,
      products: set.products,
      displayName: formData.setName ?? '',
      discountAmount: calculateDiscount(
        formData.discount ?? 0,
        formData.discountUnit,
      ),
    };
    console.log('フォーム送信', payload);
    await updateSetDeal(payload); // formData.setNameについてnull,undefinedを回避しているがエラーがでる。原因不明。
  };
  return {
    updateSetByForm,
  };
};
