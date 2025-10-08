// 過去の棚卸に対して仕入れ値を注入する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { InventoryStatus } from '@prisma/client';
import { injectInventoryWholesalePriceApi } from 'api-generator';

export const POST = BackendAPI.create(
  injectInventoryWholesalePriceApi,
  async (API, { params, body }) => {
    const { store_id, inventory_id } = params;

    let { wholesalePriceList } = body;

    //棚卸を取得する
    const thisInventoryInfo = await API.db.inventory.findUnique({
      where: {
        store_id,
        id: inventory_id,
        status: InventoryStatus.FINISHED,
      },
    });

    if (!thisInventoryInfo) throw new ApiError('notExist');

    //injectする対象になりうるProductを取得
    const targetInventoryProducts = await API.db.inventory_Products.findMany({
      where: {
        inventory_id,
        wholesale_price_history_id: {
          not: null,
        },
        wholesale_price_injected: false,
      },
    });

    //なかったらエラー
    if (targetInventoryProducts.length === 0)
      throw new ApiError({
        status: 400,
        messageText: `すでに全ての仕入れ値が注入されています`,
      });

    const txResult = await API.transaction(async (tx) => {
      let wholesalePriceIncrement = 0;

      for (const wholesaleInfo of wholesalePriceList) {
        //該当レコードを取得する
        const targetProducts = targetInventoryProducts.filter(
          (e) =>
            e.product_id === wholesaleInfo.product_id &&
            e.wholesale_price_history_id ===
              wholesaleInfo.wholesale_price_history_id,
        );

        //なかったらエラー
        if (targetProducts.length === 0)
          throw new ApiError({
            status: 400,
            messageText: `注入する対象の在庫が見つかりませんでした`,
          });

        //過去の仕入れ値レコードを更新する形で注入する
        const productService = new BackendApiProductService(
          API,
          wholesaleInfo.product_id,
        );

        try {
          const updateRes =
            await productService.core.wholesalePrice.updateRecord(
              wholesaleInfo.wholesale_price_history_id!,
              wholesaleInfo.unit_price,
            );

          //在庫履歴IDがあるかどうか
          const productStockHistoryId =
            targetProducts[0].product_stock_history_id;

          //あったらこちらにも注入する
          if (productStockHistoryId) {
            await tx.product_Stock_History.update({
              where: {
                id: productStockHistoryId,
              },
              data: {
                unit_price: wholesaleInfo.unit_price,
              },
            });
          }

          console.log(`注入完了`, updateRes);
        } catch (e) {
          //エラーを吐くときは、すでに注入されていたり、売れるなどしてすでに別の場所に仕入れ値レコードが移動していたときなどであり、APIエラーとしてthrowする必要はない
          console.error(`注入失敗 すでに売却されたりしている可能性があります`);

          //[TODO] 失敗数とかをカウントした方が良さそう
        }

        //該当のレコードを取得する
        const targetRecords = await tx.inventory_Products.findMany({
          where: {
            inventory_id,
            product_id: wholesaleInfo.product_id,
          },
        });

        for (const record of targetRecords) {
          await tx.inventory_Products.update({
            where: {
              inventory_id_staff_account_id_shelf_id_product_id: {
                inventory_id: record.inventory_id,
                staff_account_id: record.staff_account_id,
                shelf_id: record.shelf_id,
                product_id: record.product_id,
              },
            },
            data: {
              wholesale_price_injected: true,
              input_total_wholesale_price:
                record.item_count * wholesaleInfo.unit_price,
            },
          });

          wholesalePriceIncrement +=
            record.item_count * wholesaleInfo.unit_price;
        }
      }

      //棚卸自体の入力仕入れ値をインクリメントする
      await tx.inventory.update({
        where: {
          id: inventory_id,
        },
        data: {
          total_item_wholesale_price: {
            increment: wholesalePriceIncrement,
          },
        },
      });
    });
  },
);
