import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import React, { useMemo, useEffect } from 'react';
import { useAlert } from '@/contexts/AlertContext';

interface UsePackConfirmationStepParams {
  openNumber: number;
  wholesalePrice: BackendProductAPI[9]['response']['200'] | undefined;
  itemsToRegister: PackItemType[];
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  randomCardsPerPack: number;
  isRandomOnly: boolean;
  isFixedOnly: boolean;
}

/**
 * PackConfirmationStep専用カスタムフック
 */
export const usePackConfirmationStep = ({
  openNumber,
  wholesalePrice,
  itemsToRegister,
  setItemsToRegister,
  randomCardsPerPack,
  isRandomOnly,
  isFixedOnly,
}: UsePackConfirmationStepParams) => {
  const { setAlertState } = useAlert();

  // ==================== 計算値 ====================
  /* ---------  カード合計枚数  --------- */
  const totalCards = useMemo(() => {
    if (isRandomOnly) {
      return openNumber * randomCardsPerPack;
    } else {
      return itemsToRegister.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0,
      );
    }
  }, [itemsToRegister, openNumber, randomCardsPerPack, isRandomOnly]);

  /* ---------  登録枚数合計（未登録カード以外の枚数）  --------- */
  const totalRegisteredCards = useMemo(() => {
    return itemsToRegister.reduce((sum, item) => {
      return item.myca_item_id === -1 ? sum : sum + (item.quantity ?? 0);
    }, 0);
  }, [itemsToRegister]);

  /* ---------  未登録カードの枚数  --------- */
  const totalUnregisteredCardsQuantity = useMemo(() => {
    if (isRandomOnly) {
      return totalCards - totalRegisteredCards;
    } else {
      return randomCardsPerPack;
    }
  }, [isRandomOnly, randomCardsPerPack, totalCards, totalRegisteredCards]);

  /* ---------  全カード仕入れ値合計  --------- */
  const totalUnitWholesalePrice = useMemo(() => {
    return itemsToRegister.reduce((sum, item) => {
      return sum + (item.wholesale_price ?? 0) * (item.quantity ?? 0);
    }, 0);
  }, [itemsToRegister]);

  /* ---------  パック合計の仕入れ値[最終開封数とパック仕入れ単価]  --------- */
  const amount = useMemo(() => {
    if (!wholesalePrice || !openNumber) return 0;
    if (!wholesalePrice.totalItemCount || wholesalePrice.totalItemCount === 0)
      return 0;

    return Math.round(
      (wholesalePrice.totalWholesalePrice / wholesalePrice.totalItemCount) *
        openNumber,
    );
  }, [wholesalePrice, openNumber]);

  /* ---------  残り金額  --------- */
  const remainingAmount = useMemo(() => {
    return amount - totalUnitWholesalePrice;
  }, [amount, totalUnitWholesalePrice]);

  /* ---------  未登録カードの仕入れ値 --------- */
  const unregisterProductWholesalePrice = useMemo(() => {
    return (
      itemsToRegister.find((item) => item.myca_item_id === -1)
        ?.wholesale_price || 0
    );
  }, [itemsToRegister]);

  /* ---------  カード1枚あたりの仕入れ値 --------- */
  const unitWholesalePrice = useMemo(() => {
    if (!amount || !totalCards || totalCards === 0) return '0';
    return Math.round(amount / totalCards).toLocaleString();
  }, [amount, totalCards]);

  // ==================== 関数 ====================
  /* ---------  空欄に自動分配  --------- */
  const handleSplitWholesalePrice = () => {
    if (!isFixedOnly && !randomCardsPerPack) {
      setAlertState({
        message: 'ランダムカード封入枚数を入力してください',
        severity: 'error',
      });
      return;
    }
    if (remainingAmount <= 0) {
      setAlertState({
        message: '分配不可です',
        severity: 'error',
      });
      return;
    }

    // 仕入れ単価が未設定で quantity > 0 の商品
    const unsetItems = itemsToRegister.filter((item) => {
      const hasQuantity = (item.quantity ?? 0) > 0;
      const hasNoWholesalePrice =
        item.wholesale_price == null || item.wholesale_price === undefined;
      return hasQuantity && hasNoWholesalePrice;
    });

    // 仕入れ単価が未設定で quantity > 0 の商品の合計枚数
    const totalUnsetQuantity = unsetItems.reduce((sum, item) => {
      return sum + (item.quantity ?? 0);
    }, 0);

    // 余っている仕入れ値から分配する仕入れ値を算出
    const baseUnitPrice =
      totalUnsetQuantity === 0
        ? 0
        : Math.floor(remainingAmount / totalUnsetQuantity);

    setItemsToRegister((prevItems) =>
      prevItems.map((item) => {
        // 仕入れ単価が未設定で数量が1以上の商品に価格を設定
        if (
          (item.wholesale_price == null ||
            item.wholesale_price === undefined) &&
          (item.quantity ?? 0) > 0
        ) {
          return {
            ...item,
            wholesale_price: baseUnitPrice,
          };
        }
        return item;
      }),
    );
  };

  // ==================== 副作用 ====================

  // totalUnregisteredCardsQuantityが変化する度にitemsToRegisterの未登録カード数も更新
  useEffect(() => {
    setItemsToRegister((prevItems) =>
      prevItems.map((item) => {
        if (item.myca_item_id === -1) {
          return {
            ...item,
            quantity: totalUnregisteredCardsQuantity ?? 0,
          };
        }
        return item;
      }),
    );
  }, [totalUnregisteredCardsQuantity]);

  return {
    totalUnitWholesalePrice,
    totalUnregisteredCardsQuantity,
    amount,
    remainingAmount,
    handleSplitWholesalePrice,
    unregisterProductWholesalePrice,
    totalCards,
    totalRegisteredCards,
    unitWholesalePrice,
  };
};
