//仕入れの適用

import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import {
  InventoryStatus,
  Product,
  ProductStockHistorySourceKind,
} from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { WholesalePriceRecord } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

//棚卸の確定を行うAPI
//それぞれの商品の単価とそこから計算される合計価格などを格納する

export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, inventory_id } = API.params;

    const { adjust } = API.body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //あるか確認すると同時に商品情報まで取得
    const currentInventoryInfo = await API.db.inventory.findUnique({
      where: {
        store_id: parseInt(store_id),
        id: parseInt(inventory_id),
        status: InventoryStatus.DRAFT,
      },
      select: {
        id: true,
      },
    });

    if (!currentInventoryInfo) throw new ApiError('notExist');

    const updateResult = await API.transaction(async (tx) => {
      const accountModel = new BackendApiAccountService(API);

      //Inventoryの方を更新する
      const updateResult = await tx.inventory.update({
        where: {
          id: currentInventoryInfo.id,
        },
        data: {
          staff_account: await accountModel.getStaffQuery(),
          status: InventoryStatus.FINISHED,
          finished_at: new Date(),
          adjusted: adjust,
        },
        include: {
          item_categories: true,
          item_genres: true,
          products: true,
        },
      });

      return updateResult;
    });

    //adjustするなら、その対象を確認していく
    if (adjust) {
      //product_idで束ねる
      const productMap: Map<
        Product['id'],
        {
          product_id: Product['id'];
          item_count: number;
          sell_price: number;
          current_stock_number: Product['stock_number'];
        }
      > = new Map();

      for (const product of updateResult.products) {
        const thisProduct = productMap.get(product.product_id);
        if (thisProduct) {
          thisProduct.item_count += product.item_count;
        } else {
          productMap.set(product.product_id, {
            product_id: product.product_id,
            item_count: product.item_count,
            sell_price: product.unit_price ?? 0,
            current_stock_number: product.current_stock_number ?? 0,
          });
        }
      }

      const lossProducts: Array<{
        product_id: Product['id'];
        item_count: number;
        sell_price: number;
      }> = [];

      const increaseProducts: Array<{
        product_id: Product['id'];
        item_count: number;
        current_stock_number: number;
      }> = [];

      for (const product of productMap.values()) {
        //ロスに登録する必要があるか確認 実際の方が少なかったら
        if (product.item_count < product.current_stock_number) {
          lossProducts.push({
            product_id: product.product_id,
            item_count: product.current_stock_number - product.item_count,
            sell_price: product.sell_price,
          });
        } else if (product.item_count > product.current_stock_number) {
          const increaseCount =
            product.item_count - product.current_stock_number;

          increaseProducts.push({
            product_id: product.product_id,
            item_count: increaseCount,
            current_stock_number: product.current_stock_number,
          });
        }
      }

      await API.transaction(async (tx) => {
        //ロスがある場合、ロスを作成（そろそろロスは関数化したい）
        if (lossProducts.length > 0) {
          const lossInsertResult = await tx.loss.create({
            data: {
              store_id: Number(store_id),
              datetime: new Date(),
              reason: '棚卸での調整',
              staff_account_id,
              total_item_count: lossProducts.reduce(
                (acc, p) => acc + p.item_count,
                0,
              ),
              total_sell_price: lossProducts.reduce(
                (acc, p) => acc + p.item_count * p.sell_price,
                0,
              ),
              products: {
                create: lossProducts.map((p) => ({
                  product_id: p.product_id,
                  item_count: p.item_count,
                })),
              },
            },
          });

          for (const lossProduct of lossProducts) {
            const decreaseCount = lossProduct.item_count;

            const thisProduct = new BackendApiProductService(
              API,
              lossProduct.product_id,
            );
            await thisProduct.core.decreaseStock({
              decreaseCount,
              source_kind: ProductStockHistorySourceKind.loss,
              source_id: lossInsertResult.id,
              description: `棚卸での調整による在庫数の減少`,
            });
          }
        }
      });

      //増やす方に関しては基本エラーが発生しないためトランザクションを貼らないことにする
      if (increaseProducts.length > 0) {
        for (const product of increaseProducts) {
          const thisProduct = new BackendApiProductService(
            API,
            product.product_id,
          );

          const wholesalePrice =
            await thisProduct.core.wholesalePrice.getRecords({
              item_count: 1,
              reverse: true,
            });
          await API.transaction(async (tx) => {
            const thisWholesaleRecord: WholesalePriceRecord = {
              unit_price: wholesalePrice.totalWholesalePrice ?? 0,
              item_count: product.item_count,
              product_id: product.product_id,
            };

            const changeRes = await thisProduct.core.increaseStock({
              increaseCount: product.item_count,
              source_kind: ProductStockHistorySourceKind.product,
              wholesaleRecords: [thisWholesaleRecord],
              description: `棚卸での調整による在庫数の増加`,
            });

            const createdRecords = changeRes.createdRecords;
            const stockHistory = changeRes.stockHistory;

            if (
              product.current_stock_number === 0 &&
              wholesalePrice.nothingCount
            ) {
              const thisRecord = createdRecords[0];

              if (thisRecord && stockHistory) {
                await API.db.inventory_Products.updateMany({
                  where: {
                    inventory_id: currentInventoryInfo.id,
                    product_id: product.product_id,
                  },
                  data: {
                    wholesale_price_history_id: thisRecord.id,
                    product_stock_history_id: stockHistory.id,
                    wholesale_price_injected: false,
                  },
                });
                console.log(
                  `0→1を検出したので仕入れ値レコードIDを保持しました`,
                );
              }
            }
          });
        }
      }
    }

    //この時点での仕入れ値平均等を算出して格納する
    const resultInventoryInfo = await API.db.inventory.findUnique({
      where: {
        id: currentInventoryInfo.id,
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                average_wholesale_price: true,
                minimum_wholesale_price: true,
                maximum_wholesale_price: true,
                total_wholesale_price: true,
              },
            },
          },
        },
      },
    });

    //広範囲に及ぶロックを避けるためトランザクション外で実行する
    await Promise.all(
      resultInventoryInfo!.products.map(async (product) => {
        await API.db.inventory_Products.update({
          where: {
            inventory_id_staff_account_id_shelf_id_product_id: {
              inventory_id: product.inventory_id,
              staff_account_id: product.staff_account_id,
              shelf_id: product.shelf_id,
              product_id: product.product_id,
            },
          },
          data: {
            average_wholesale_price: product.product.average_wholesale_price,
            minimum_wholesale_price: product.product.minimum_wholesale_price,
            maximum_wholesale_price: product.product.maximum_wholesale_price,
            total_wholesale_price: product.product.total_wholesale_price,
          },
        });
      }),
    );

    //この時点で作成・更新通知を出す
    // const apiEvent = new ApiEvent({
    //   type: 'inventory',
    //   service: API,
    //   specificResourceId: result.id,
    //   obj: result,
    // });

    // await apiEvent.emit();

    return API.status(200).response({ data: updateResult });
  },
);
