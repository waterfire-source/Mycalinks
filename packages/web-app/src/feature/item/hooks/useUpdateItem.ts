import { useCallback, useState } from 'react';
import { createClientAPI } from '@/api/implement';
import { FormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { useAlert } from '@/contexts/AlertContext';

export const useUpdateItem = () => {
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const updateItem = useCallback(
    async (storeID: number, item: FormattedItem): Promise<boolean> => {
      setIsLoading(true);
      try {
        const updateRes = await clientAPI.item.update({
          storeID: storeID,
          itemID: item.id,
          body: {
            display_name: item.displayName,
            display_name_ruby: item.displayNameRuby,
            sell_price: item.sellPrice,
            buy_price: item.buyPrice,
            rarity: item.rarity,
            pack_name: item.packName,
            description: item.description,
            is_buy_only: item.isBuyOnly,
            order_number: item.orderNumber,
            readonly_product_code: item.readonlyProductCode,
            image_url: item.imageUrl,
            hide: item.hide,
            release_date: item.releaseDate,
          },
        });

        console.log('アップデート結果', updateRes);
        setAlertState({
          message: '情報の更新が完了しました',
          severity: 'success',
        });
        return true;
      } catch (error) {
        console.error('更新失敗', error);
        setAlertState({
          message: '情報の更新に失敗しました',
          severity: 'error',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI, setAlertState],
  );

  const updateMultipleItems = useCallback(
    async (
      storeID: number,
      items: Array<{ itemId: number; sellPrice: number; buyPrice: number }>,
    ): Promise<boolean> => {
      setIsLoading(true);
      try {
        // 全てのアイテムに対してupdate APIリクエストを順次実行
        const updatePromises = items.map(({ itemId, sellPrice, buyPrice }) =>
          clientAPI.item.update({
            storeID: storeID,
            itemID: itemId,
            body: {
              sell_price: sellPrice,
              buy_price: buyPrice,
            },
          }),
        );

        // 全てのリクエストが成功するまで待機
        await Promise.all(updatePromises);

        setAlertState({
          message: '情報の更新が完了しました',
          severity: 'success',
        });
        return true;
      } catch (error) {
        console.error('複数アイテムの更新失敗', error);
        setAlertState({
          message: '情報の更新に失敗しました',
          severity: 'error',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI, setAlertState],
  );

  return { updateItem, updateMultipleItems, isLoading };
};
