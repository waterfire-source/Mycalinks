// パック開封のロールバック

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import {
  ItemCategoryHandle,
  PackOpenStatus,
  ProductStockHistorySourceKind,
} from '@prisma/client';
import { rollbackPackOpeningApi } from 'api-generator';

export const POST = BackendAPI.create(
  rollbackPackOpeningApi,
  async (API, { params, body }) => {
    const { store_id, pack_open_history_id } = params;

    let { description, isDryRun } = body;

    const alreadyInfo = await API.db.pack_Open_History.findUnique({
      where: {
        id: pack_open_history_id,
        status: PackOpenStatus.FINISHED,
        //オリパの解体は今の所非対応
        from_product: {
          item: {
            category: {
              handle: {
                notIn: [
                  ItemCategoryHandle.ORIGINAL_PACK,
                  ItemCategoryHandle.LUCKY_BAG,
                  ItemCategoryHandle.DECK,
                ],
              },
            },
          },
          store_id,
        },
      },
      include: {
        to_products: true,
      },
    });

    if (!alreadyInfo) throw new ApiError('notExist');

    try {
      const txResult = await API.transaction(async (tx) => {
        //元商品のロールバックを行う
        const fromProduct = new BackendApiProductService(
          API,
          alreadyInfo.from_product_id,
        );

        await fromProduct.core.increaseStock({
          increaseCount: alreadyInfo.item_count!,
          source_kind: ProductStockHistorySourceKind.pack_opening_rollback,
          source_id: alreadyInfo.id,
          description,
        });

        //開封先のロールバックを行う こちらは減らす形
        for (const toProduct of alreadyInfo.to_products) {
          const toProductService = new BackendApiProductService(
            API,
            toProduct.product_id,
          );
          await toProductService.core.decreaseStock({
            decreaseCount: toProduct.item_count!,
            source_kind: ProductStockHistorySourceKind.pack_opening_rollback,
            source_id: alreadyInfo.id,
            description,
          });
        }

        //未登録の商品のロールバックを行う
        if (alreadyInfo.unregister_item_count) {
          //在庫IDを指定されていたらそれでロールバック
          if (alreadyInfo.unregister_product_id) {
            const unregisterProductService = new BackendApiProductService(
              API,
              alreadyInfo.unregister_product_id,
            );

            await unregisterProductService.core.decreaseStock({
              decreaseCount: alreadyInfo.unregister_item_count!,
              source_kind:
                ProductStockHistorySourceKind.pack_opening_unregister_rollback,
              source_id: alreadyInfo.id,
              description,
            });
          }

          //ここまで上手くいったら、dryRunモードだったときは計画的にロールバックする
          if (isDryRun) {
            throw new ApiError({
              status: 400,
              messageText: 'dryRun',
            });
          }

          //ロスだった時は特に処理しなくて大丈夫

          await API.db.pack_Open_History.update({
            where: {
              id: pack_open_history_id,
            },
            data: {
              status: PackOpenStatus.ROLLBACK,
            },
          });
        }
      });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.messageText === 'dryRun') {
          return;
        }
      }
      throw e;
    }
  },
);
