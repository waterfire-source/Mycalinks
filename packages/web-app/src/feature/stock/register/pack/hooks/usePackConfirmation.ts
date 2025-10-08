import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { useState } from 'react';

/**
 * 開封結果確認のカスタムフック
 */
export const usePackConfirmation = () => {
  // 開封結果登録カード情報
  const [itemsToRegister, setItemsToRegister] = useState<PackItemType[]>([]);
  // ランダムカード封入枚数
  const [randomCardsPerPack, setRandomCardsPerPack] = useState(0);
  // 履歴復元時のコンディションオプション
  const [restoredConditionOptionId, setRestoredConditionOptionId] = useState<
    number | null
  >(null);

  return {
    itemsToRegister,
    setItemsToRegister,
    randomCardsPerPack,
    setRandomCardsPerPack,
    restoredConditionOptionId,
    setRestoredConditionOptionId,
  };
};
