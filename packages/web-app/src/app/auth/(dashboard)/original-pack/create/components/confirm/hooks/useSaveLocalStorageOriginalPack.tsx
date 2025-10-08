import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { OriginalPackProduct } from '@/app/auth/(dashboard)/original-pack/page';

export const useSaveLocalStorageOriginalPack = () => {
  // localStorageに該当のid、productsを保存
  const saveLocalStorageItem = (
    originalPackId: number,
    products: EnclosedProduct[] | OriginalPackProduct[],
  ): void => {
    try {
      const newEntry = { id: originalPackId, products };
      const existingDataString = localStorage.getItem('originalPackProducts');
      let updatedArray: (typeof newEntry)[] = [];

      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (Array.isArray(parsed)) {
          updatedArray = parsed.filter((item) => item.id !== originalPackId);
        }
      }

      updatedArray.push(newEntry);
      localStorage.setItem(
        'originalPackProducts',
        JSON.stringify(updatedArray),
      );
    } catch (error) {
      console.warn('ローカルストレージへの保存に失敗しました:', error);
    }
  };

  // localStorageに新しいproductsをマージして保存
  const addLocalStorageItem = (
    originalPackId: number,
    newProducts: EnclosedProduct[] | OriginalPackProduct[],
  ): void => {
    try {
      const existingDataString = localStorage.getItem('originalPackProducts');
      let all: Array<{ id: number; products: any[] }> = [];
      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (Array.isArray(parsed)) {
          all = parsed;
        }
      }
      const existingEntry = all.find((item) => item.id === originalPackId);
      let mergedProducts = newProducts;
      if (existingEntry) {
        mergedProducts = [
          ...existingEntry.products,
          ...newProducts.filter(
            (p) => !existingEntry.products.some((ep) => ep.id === p.id),
          ),
        ];
      }
      const otherEntries = all.filter((item) => item.id !== originalPackId);
      otherEntries.push({ id: originalPackId, products: mergedProducts });
      localStorage.setItem(
        'originalPackProducts',
        JSON.stringify(otherEntries),
      );
    } catch (error) {
      console.warn('ローカルストレージへの追加保存に失敗しました:', error);
    }
  };

  // 該当の取引のidを指定してlocalStorageからデータを削除
  const removeLocalStorageItemById = (originalPackId: number): void => {
    try {
      const localDataString = localStorage.getItem('originalPackProducts');
      if (!localDataString) return;

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return;

      const updated = parsed.filter((item) => item.id !== originalPackId);
      localStorage.setItem('originalPackProducts', JSON.stringify(updated));
    } catch (error) {
      console.warn('ローカルストレージの削除に失敗しました:', error);
    }
  };

  // localStorageから該当の取引のidが一致するカートアイテムを取得
  const getLocalStorageItem = (
    originalPackId: number,
  ): (EnclosedProduct | OriginalPackProduct)[] => {
    try {
      const localDataString = localStorage.getItem('originalPackProducts');
      if (!localDataString) return [];

      const parsed = JSON.parse(localDataString);
      if (!Array.isArray(parsed)) return [];

      const match = parsed.find((item) => item.id === originalPackId);
      return Array.isArray(match?.products) ? match.products : [];
    } catch (error) {
      console.warn('ローカルストレージの読み込みに失敗しました:', error);
      return [];
    }
  };

  // localStorageからoriginalPackProductsを削除
  const clearLocalStorageItem = (): void => {
    try {
      localStorage.removeItem('originalPackProducts');
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
};
