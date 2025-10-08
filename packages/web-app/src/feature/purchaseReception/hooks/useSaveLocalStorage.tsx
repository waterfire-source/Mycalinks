import { TransactionCartItem } from '@/feature/purchaseReception/hooks/useTransactionCart';

export const useSaveLocalStorage = () => {
  // localStorageに該当の取引のid、カートアイテムを保存
  const saveLocalStorageItem = (
    transactionId: number,
    cart_items: TransactionCartItem[],
  ): void => {
    try {
      const newEntry = { id: transactionId, cart_items };
      const existingDataString = localStorage.getItem('purchaseReception');
      let updatedArray: (typeof newEntry)[] = [];

      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (Array.isArray(parsed)) {
          updatedArray = parsed.filter((item) => item.id !== transactionId);
        }
      }

      updatedArray.push(newEntry);
      localStorage.setItem('purchaseReception', JSON.stringify(updatedArray));
    } catch (error) {
      console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
  };

  // 該当の取引のidを指定してlocalStorageからデータを削除
  const removeLocalStorageItemById = (transactionId: number): void => {
    try {
      const localDataString = localStorage.getItem('purchaseReception');
      if (!localDataString) return;

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return;

      const updated = parsed.filter((item) => item.id !== transactionId);
      localStorage.setItem('purchaseReception', JSON.stringify(updated));
    } catch (error) {
      console.warn('ローカルストレージの削除に失敗しました:', error);
    }
  };

  // localStorageから該当の取引のidが一致するカートアイテムを取得
  const getLocalStorageItem = (
    transactionId: number,
  ): TransactionCartItem[] => {
    try {
      const localDataString = localStorage.getItem('purchaseReception');
      if (!localDataString) return [];

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return [];

      const match = parsed.find((item) => item.id === transactionId);
      return Array.isArray(match?.cart_items) ? match.cart_items : [];
    } catch (error) {
      console.warn('ローカルストレージの読み込みに失敗しました:', error);
      return [];
    }
  };

  return {
    saveLocalStorageItem,
    removeLocalStorageItemById,
    getLocalStorageItem,
  };
};
