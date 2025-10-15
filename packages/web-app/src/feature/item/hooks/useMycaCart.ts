import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

// Myca から取得した情報を POS のアイテムに変換する型
export interface MycaAddItemType {
  myca_item_id: number;
  myca_pack_id?: number;
  myca_item_pack_id?: number;
  display_name?: string;
  display_name_ruby?: string;
  displayNameWithMeta?: string;
  price?: number;
  rarity?: string;
  pack_name?: string;
  description?: string;
  image_url?: string;
  department_id?: number | null;
  item_allowed_conditions?: Array<number>;
  genre_name?: string;
  displaytype1?: string;
}

// 商品登録を行うフック
export const useMycaCart = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cartMycaItems, setCartMycaItems] = useState<MycaAddItemType[]>([]);
  const { setAlertState } = useAlert();

  // 商品を追加する関数
  const addCartMycaItem = useCallback((newItem: MycaAddItemType) => {
    setCartMycaItems((prevItems) => [...prevItems, newItem]);
  }, []);

  // 商品を削除する関数
  const removeCartMycaItem = useCallback((mycaItemId: number) => {
    setCartMycaItems((prevItems) =>
      prevItems.filter((item) => item.myca_item_id !== mycaItemId),
    );
  }, []);

  // 商品登録用の関数
  const createItem = useCallback(
    async (storeID: number) => {
      if (cartMycaItems.length === 0) return;
      setIsLoading(true);

      const successfullyRegisteredItems: MycaAddItemType[] = [];

      try {
        for (const item of cartMycaItems) {
          try {
            const response = await clientAPI.item.create({
              storeID: storeID,
              myca_item_id: item.myca_item_id,
              // item_allowed_conditions: [],
              order_number: 0,
            });

            if (response instanceof CustomError) {
              console.error(item.display_name + ' 商品登録に失敗しました。');
              setAlertState({
                message: `${response.status}:${response.message}`,
                severity: 'error',
              });
            } else {
              console.log(item.display_name + ' 商品登録結果', response);
              successfullyRegisteredItems.push(item);
              setAlertState({
                message: `${item.display_name}の登録に成功しました。`,
                severity: 'success',
              });
            }
          } catch (error) {
            console.error(
              item.display_name + ' の登録中にエラーが発生しました。',
              error,
            );
          }
        }

        // 成功したアイテムをカートから削除
        setCartMycaItems((prevItems) =>
          prevItems.filter(
            (item) => !successfullyRegisteredItems.includes(item),
          ),
        );
      } catch (error) {
        console.error('商品登録中にエラーが発生しました。', error);
      } finally {
        setIsLoading(false);
      }
    },
    [cartMycaItems, clientAPI, setAlertState],
  );

  // パックの中身を追加する関数
  const createPackItem = useCallback(
    async (storeID: number) => {
      if (cartMycaItems.length === 0) return;
      setIsLoading(true);

      const successfullyRegisteredItems: MycaAddItemType[] = [];

      try {
        for (const item of cartMycaItems) {
          if (!item.myca_item_pack_id) return;

          try {
            const response = await clientAPI.item.createAllItemsFromPack({
              storeID: storeID,
              mycaPackID: item.myca_item_pack_id,
            });

            if (response instanceof CustomError) {
              console.error(
                item.display_name + ' ボックスの商品登録に失敗しました。',
              );
              setAlertState({
                message: `${response.status}:${response.message}`,
                severity: 'error',
              });
            } else {
              console.log(item.display_name + ' 商品登録結果', response);
              successfullyRegisteredItems.push(item);
              setAlertState({
                message: `${item.display_name}の登録を開始しました。`,
                severity: 'success',
              });
            }
          } catch (error) {
            console.error(
              item.display_name + ' の登録開始時にエラーが発生しました。',
              error,
            );
          }
        }

        // 成功したアイテムをカートから削除
        setCartMycaItems((prevItems) =>
          prevItems.filter(
            (item) => !successfullyRegisteredItems.includes(item),
          ),
        );
      } catch (error) {
        console.error('商品登録中にエラーが発生しました。', error);
      } finally {
        setIsLoading(false);
      }
    },
    [cartMycaItems, clientAPI, setAlertState],
  );

  return {
    createItem,
    createPackItem,
    cartMycaItems,
    addCartMycaItem,
    removeCartMycaItem,
    isLoading,
  };
};
