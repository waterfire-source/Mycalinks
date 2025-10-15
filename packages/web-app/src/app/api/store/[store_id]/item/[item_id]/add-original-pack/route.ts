import { BackendAPI } from '@/api/backendApi/main';
import {
  ItemCategoryHandle,
  ItemStatus,
  ProductStockHistorySourceKind,
} from '@prisma/client';

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { addOriginalPackApi } from 'api-generator';
//オリパ補充
export const POST = BackendAPI.create(
  addOriginalPackApi,
  async (API, { params, body }) => {
    const { additionalProducts, additionalStockNumber } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const txResult = await API.transaction(async (tx) => {
      //既存の情報を取得
      const currentInfo = await tx.item.findUnique({
        where: {
          id: params.item_id,
          store_id: params.store_id,
          status: ItemStatus.PUBLISH, //公開されているものに限る
          category: {
            handle: {
              in: [
                ItemCategoryHandle.ORIGINAL_PACK,
                ItemCategoryHandle.LUCKY_BAG,
                ItemCategoryHandle.DECK,
              ],
            },
          }, //オリパに限る
        },
        include: {
          products: true,
        },
      });

      if (!currentInfo || !currentInfo.products.length)
        throw new ApiError('notExist');

      //商品マスタ情報を更新
      const updateRes = await tx.item.update({
        where: {
          id: currentInfo.id,
        },
        data: {
          init_stock_number: {
            increment: additionalStockNumber, //初期在庫数も増やす
          },
          original_pack_products: {
            create: additionalProducts.map((e) => ({
              process_id: String(API.processId),
              product_id: e.product_id,
              item_count: e.item_count,
              staff_account_id,
            })),
          },
        },
      });

      //Productに補充する
      const thisProductInfo = currentInfo.products[0];

      const thisProduct = new BackendApiProductService(API, thisProductInfo.id);

      //在庫を増やす
      // 追加する値が0なら追加しない
      if (additionalStockNumber > 0) {
        await thisProduct.core.increaseStock({
          source_kind: ProductStockHistorySourceKind.original_pack,
          source_id: currentInfo.id,
          increaseCount: additionalStockNumber,
          description: `オリパ${currentInfo.id} の追加補充を行いました`,
        });
      }

      //最終的な値を取得する
      const finalRes = await tx.item.findUnique({
        where: {
          id: currentInfo.id,
        },
        include: {
          original_pack_products: {
            include: {
              staff_account: {
                select: {
                  display_name: true,
                  id: true,
                  // kind: true,
                },
              },
            },
          },
          products: true,
        },
      });

      return finalRes!;
    });

    return txResult;
  },
);
