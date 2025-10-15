'use client';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';

export const useSaveLocalStorageRegister = () => {
  // localStorageに該当のid、productsを保存
  const saveLocalStorageItem = (
    registerId: number,
    taxType: 'include' | 'exclude',
    products: CustomArrivalProductSearchType[],
  ): void => {
    try {
      const newEntry = { id: registerId, taxType: taxType, products };
      const existingDataString = localStorage.getItem(
        'arrivalRegisterProducts',
      );
      let updatedArray: (typeof newEntry)[] = [];

      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (Array.isArray(parsed)) {
          updatedArray = parsed.filter(
            (item) => item.id !== registerId || item.taxType !== taxType,
          );
        }
      }

      updatedArray.push(newEntry);
      localStorage.setItem(
        'arrivalRegisterProducts',
        JSON.stringify(updatedArray),
      );
    } catch (error) {
      console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
  };

  // localStorageに新しいproductsをマージして保存
  const addLocalStorageItem = (
    registerId: number,
    taxType: 'include' | 'exclude',
    newProducts: CustomArrivalProductSearchType[],
  ): void => {
    try {
      const existingDataString = localStorage.getItem(
        'arrivalRegisterProducts',
      );
      let all: Array<{
        id: number;
        taxType: 'include' | 'exclude';
        products: CustomArrivalProductSearchType[];
      }> = [];
      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (Array.isArray(parsed)) {
          all = parsed;
        }
      }
      const existingEntry = all.find(
        (item) => item.id === registerId && item.taxType === taxType,
      );
      let mergedProducts = newProducts;
      if (existingEntry) {
        mergedProducts = [
          ...existingEntry.products,
          ...newProducts.filter(
            (p) => !existingEntry.products.some((ep) => ep.customId === p.customId),
          ),
        ];
      }
      const otherEntries = all.filter(
        (item) => item.id !== registerId || item.taxType !== taxType,
      );
      otherEntries.push({
        id: registerId,
        taxType: taxType,
        products: mergedProducts,
      });
      localStorage.setItem(
        'arrivalRegisterProducts',
        JSON.stringify(otherEntries),
      );
    } catch (error) {
      console.warn('ローカルストレージへの追加保存に失敗しました:', error);
    }
  };

  // 該当の取引のidとtaxTypeを指定してlocalStorageからデータを削除
  const removeLocalStorageItemById = (
    registerId: number,
    taxType: string,
  ): void => {
    try {
      const localDataString = localStorage.getItem('arrivalRegisterProducts');
      if (!localDataString) return;

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return;

      const updated = parsed.filter(
        (item) => item.id !== registerId || item.taxType !== taxType,
      );
      localStorage.setItem('arrivalRegisterProducts', JSON.stringify(updated));
    } catch (error) {
      console.warn('ローカルストレージの削除に失敗しました:', error);
    }
  };

  // localStorageから該当の取引のidが一致するカートアイテムを取得
  const getLocalStorageItem = (
    registerId: number,
    taxType: 'include' | 'exclude',
  ): CustomArrivalProductSearchType[] => {
    try {
      const localDataString = localStorage.getItem('arrivalRegisterProducts');
      if (!localDataString) return [];

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return [];

      const match = parsed.find(
        (item) => item.id === registerId && item.taxType === taxType,
      );
      return Array.isArray(match?.products) ? match.products : [];
    } catch (error) {
      console.warn('ローカルストレージの読み込みに失敗しました:', error);
      return [];
    }
  };

  // localStorageからoriginalPackProductsを削除
  const clearLocalStorageItem = (): void => {
    try {
      localStorage.removeItem('arrivalRegisterProducts');
    } catch (error) {
      console.warn('ローカルストレージの削除に失敗しました:', error);
    }
  };

  return {
    saveLocalStorageItem,
    addLocalStorageItem,
    removeLocalStorageItemById,
    getLocalStorageItem,
    clearLocalStorageItem,
  };
};;
