import { AvailableAction } from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';

interface BoxCategoryConvert {
  sourceProductId: string;
  targetProductId: string;
  type: AvailableAction['type'];
  sourceQuantity: number; // 消費された数量
  targetQuantity: number; // 生成された数量
}

interface BoxCategoryConvertData {
  boxCategoryConvert: BoxCategoryConvert[];
}

export const useLocalStorageBoxCategory = () => {
  const storageKey = 'boxCategoryConvert';

  const saveBoxCategoryConvert = (convertData: BoxCategoryConvert): void => {
    try {
      const existingDataString = localStorage.getItem(storageKey);
      let currentData: BoxCategoryConvertData = { boxCategoryConvert: [] };

      if (existingDataString) {
        const parsed = JSON.parse(existingDataString);
        if (parsed && Array.isArray(parsed.boxCategoryConvert)) {
          currentData = parsed;
        }
      }

      const updatedConversions = currentData.boxCategoryConvert.filter(
        (item) =>
          !(item.sourceProductId === convertData.sourceProductId && 
            item.type === convertData.type)
      );
      updatedConversions.push(convertData);

      const updatedData: BoxCategoryConvertData = {
        boxCategoryConvert: updatedConversions,
      };

      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.warn('BoxCategory変換データの保存に失敗しました:', error);
    }
  };

  const getBoxCategoryConvert = (
    sourceProductId: string,
    type: AvailableAction['type'],
  ): BoxCategoryConvert | null => {
    try {
      const existingDataString = localStorage.getItem(storageKey);
      if (!existingDataString) return null;

      const parsed = JSON.parse(existingDataString);
      if (!parsed || !Array.isArray(parsed.boxCategoryConvert)) return null;

      const found = parsed.boxCategoryConvert.find(
        (item: BoxCategoryConvert) =>
          item.sourceProductId === sourceProductId && item.type === type,
      );

      return found || null;
    } catch (error) {
      console.warn('BoxCategory変換データの取得に失敗しました:', error);
      return null;
    }
  };

  const getAllBoxCategoryConverts = (): BoxCategoryConvert[] => {
    try {
      const existingDataString = localStorage.getItem(storageKey);
      if (!existingDataString) return [];

      const parsed = JSON.parse(existingDataString);
      if (!parsed || !Array.isArray(parsed.boxCategoryConvert)) return [];

      return parsed.boxCategoryConvert;
    } catch (error) {
      console.warn('BoxCategory変換データの全取得に失敗しました:', error);
      return [];
    }
  };

  const removeBoxCategoryConvert = (sourceProductId: string): void => {
    try {
      const existingDataString = localStorage.getItem(storageKey);
      if (!existingDataString) return;

      const parsed = JSON.parse(existingDataString);
      if (!parsed || !Array.isArray(parsed.boxCategoryConvert)) return;

      const updatedConversions = parsed.boxCategoryConvert.filter(
        (item: BoxCategoryConvert) => item.sourceProductId !== sourceProductId,
      );

      const updatedData: BoxCategoryConvertData = {
        boxCategoryConvert: updatedConversions,
      };

      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.warn('BoxCategory変換データの削除に失敗しました:', error);
    }
  };

  const clearAllBoxCategoryConverts = (): void => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('BoxCategory変換データの全削除に失敗しました:', error);
    }
  };

  return {
    saveBoxCategoryConvert,
    getBoxCategoryConvert,
    getAllBoxCategoryConverts,
    removeBoxCategoryConvert,
    clearAllBoxCategoryConverts,
  };
};
