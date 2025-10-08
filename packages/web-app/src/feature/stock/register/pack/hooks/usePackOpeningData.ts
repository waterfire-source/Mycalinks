import { useState, useEffect } from 'react';
import { usePackItems } from '@/feature/item/hooks/useIPackItems';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { PackOpeningDataState } from '@/feature/stock/register/pack/types';

/**
 * パック開封データ管理のカスタムフック
 */
export const usePackOpeningData = (
  storeId: number,
  selectedPackItemId?: number,
  registerParamsIsFixedPack?: boolean,
): PackOpeningDataState => {
  const { packItems, fetchPackItems } = usePackItems();
  const [items, setItems] = useState<PackItemType[]>([]);
  const [openNumber, setOpenNumber] = useState<number>(0);
  const [isDisabledEditOpenNumber, setIsDisabledEditOpenNumber] =
    useState<boolean>(false);

  // パックの商品を取得する
  useEffect(() => {
    if (selectedPackItemId) {
      fetchPackItems(storeId, selectedPackItemId);
    }
  }, [selectedPackItemId, fetchPackItems, storeId]);

  // パックのカードに数量を追加してstateに保存
  useEffect(() => {
    if (!packItems) return;
    if (Array.isArray(packItems)) {
      const itemsWithQuantity: PackItemType[] = packItems.map((item) => ({
        ...item,
        quantity:
          ((registerParamsIsFixedPack && item.pack_item_count) ?? 0) *
          (openNumber ?? 1),
      }));
      setItems(itemsWithQuantity);
    }
  }, [packItems, openNumber, registerParamsIsFixedPack]);

  // openNumberが変更された時に数量を更新
  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        quantity:
          item.pack_item_count && registerParamsIsFixedPack
            ? (item.pack_item_count ?? 0) * (openNumber ?? 1)
            : item.quantity,
      })),
    );
  }, [openNumber, registerParamsIsFixedPack]);

  return {
    packItems,
    fetchPackItems,
    items,
    setItems,
    openNumber,
    setOpenNumber,
    isDisabledEditOpenNumber,
    setIsDisabledEditOpenNumber,
  };
};
