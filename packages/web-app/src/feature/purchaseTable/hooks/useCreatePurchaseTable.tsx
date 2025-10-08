import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo } from 'react';
import { MycaPosApiClient } from 'api-generator/client';
import { PurchaseTableFormat, PurchaseTableOrder } from '@prisma/client';

export interface CreatePurchaseTable {
  title: string;
  format: PurchaseTableFormat;
  order: PurchaseTableOrder;
  showStoreName: boolean;
  showTitle?: boolean;
  color: string;
  background_text_color?: string;
  cardname_and_price_text_color?: string;
  customTemplateImageUrl?: string;
  comment?: string;
  items: Array<{
    itemId: number;
    displayPrice: number;
    anyModelNumber: boolean;
  }>;
}

export const useCreatePurchaseTable = () => {
  const { setAlertState } = useAlert();
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );

  const createPurchaseTable = useCallback(
    async (storeId: number, createPurchaseTable: CreatePurchaseTable) => {
      try {
        const response =
          await mycaPosApiClient.purchaseTable.createPurchaseTable({
            storeId: storeId,
            requestBody: {
              title: createPurchaseTable.title,
              format: createPurchaseTable.format,
              order: createPurchaseTable.order,
              show_store_name: createPurchaseTable.showStoreName,
              show_title: createPurchaseTable.showTitle,
              color: createPurchaseTable.color,
              background_text_color:
                createPurchaseTable.background_text_color ?? undefined,
              cardname_and_price_text_color:
                createPurchaseTable.cardname_and_price_text_color ?? undefined,
              custom_template_image_url:
                createPurchaseTable.customTemplateImageUrl ?? undefined,
              comment: createPurchaseTable.comment ?? undefined,
              items: createPurchaseTable.items.map((item) => ({
                item_id: item.itemId,
                display_price: item.displayPrice,
                any_model_number: item.anyModelNumber,
              })),
            },
          });

        setAlertState({
          message: `登録に成功しました。`,
          severity: 'success',
        });
        return { success: true, response };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setAlertState({
          message: `エラーが発生しました: ${errorMessage}`,
          severity: 'error',
        });

        return { success: false };
      }
    },
    [mycaPosApiClient, setAlertState],
  );

  return {
    createPurchaseTable,
  };
};
