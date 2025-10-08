import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { BackendCoreProductService } from '@/services/internal/product/main';
import {
  Bundle_Item_Product,
  Item,
  ItemCalculateKind,
  ItemCategoryHandle,
  ItemStatus,
  Product,
  ProductStockHistorySourceKind,
  Store,
} from '@prisma/client';

import { BackendCoreItemService } from '@/services/internal/item/main';
import { customDayjs } from 'common';

export class BackendCoreBundleService extends BackendService {
  constructor(itemId?: Item['id']) {
    super();
    this.setIds({
      itemId,
    });
  }

  //特定のバンドルを解体する関数（指定数だけ）
  @BackendService.WithTx
  @BackendService.WithIds(['itemId', 'storeId'])
  public release = async ({
    itemCount,
    specificProductId,
  }: {
    itemCount?: number;
    specificProductId?: Product['id'];
  }) => {
    const db = this.db;
    let productId = specificProductId;
    let releaseCount = itemCount;

    if (!productId || !itemCount) {
      const itemId = this.ids.itemId;
      if (!itemId)
        throw new BackendCoreError({
          internalMessage: 'バンドルの解体には商品マスタIDの指定が必要です',
          externalMessage: 'バンドルの解体には商品マスタIDの指定が必要です',
        });

      //全ての在庫を解体
      const thisProductInfo = await db.product.findFirstExists({
        where: {
          item_id: itemId,
        },
      });

      if (!thisProductInfo)
        throw new BackendCoreError({
          internalMessage: '解体する対象のバンドル在庫が見つかりませんでした',
          externalMessage: '解体する対象のバンドル在庫が見つかりませんでした',
        });

      this.setIds({
        itemId: thisProductInfo.item_id,
      });

      releaseCount = itemCount ?? thisProductInfo.stock_number;
      productId = thisProductInfo.id;
    }

    //解体を行う
    const thisProduct = new BackendCoreProductService(productId);
    this.give(thisProduct);

    const changeResult = await thisProduct.decreaseStock({
      source_kind: ProductStockHistorySourceKind.bundle_release,
      source_id: productId,
      decreaseCount: releaseCount!,
      description: `バンドル${productId}の解体処理で、在庫を${releaseCount}減らしました`,
    });

    if (!changeResult)
      throw new BackendCoreError({
        internalMessage: '無限商品が含まれています',
        externalMessage: '無限商品が含まれています',
      });

    return changeResult.stockHistory;
  };

  //バンドルの編集を行う関数（商品マスタのIDを保持したまま   売り出し前のみ可能　※まだDRAFTだったり、売り出し前のものに限る）
  @BackendService.WithTx
  @BackendService.WithIds(['itemId', 'storeId'])
  public edit = async ({
    newProducts,
  }: {
    newProducts: Array<{
      product_id: Product['id'];
      item_count: Bundle_Item_Product['item_count'];
    }>;
  }) => {
    const itemId = this.ids.itemId;

    const db = this.db;

    //まず編集できるか判断していく
    const thisItemInfo = await db.item.findUniqueExists({
      where: {
        id: itemId ?? 0,
      },
      include: {
        products: true,
      },
    });

    if (!thisItemInfo)
      throw new BackendCoreError({
        internalMessage: 'バンドルの編集には商品マスタIDの指定が必要です',
        externalMessage: 'バンドルの編集には商品マスタIDの指定が必要です',
      });

    //下書きじゃなくかつ、すでに売り出されていたらエラー
    if (
      thisItemInfo.status != ItemStatus.DRAFT &&
      thisItemInfo.products_stock_number != thisItemInfo.init_stock_number!
    ) {
      throw new BackendCoreError({
        internalMessage:
          'すでに売りに出されたバンドルを直接編集することはできません',
        externalMessage:
          'すでに売りに出されたバンドルを直接編集することはできません',
      });
    }

    //そうじゃなかったら、DRAFTだった場合は除いて一回解体する
    //解体されると商品マスタが論理削除されてしまうため、それを阻止する
    if (thisItemInfo.status != ItemStatus.DRAFT) {
      const releaseRes = await this.release({});

      await db.item.update({
        where: {
          id: itemId!,
        },
        data: {
          status: thisItemInfo.status,
        },
      });
    }

    //定義を新しくしていく
    await db.bundle_Item_Product.deleteMany({
      where: {
        item_id: itemId!,
      },
    });

    const createDefRes = await db.bundle_Item_Product.createMany({
      data: newProducts.map((e) => ({ ...e, item_id: itemId! })),
    });

    //DRAFTだった場合を除いて、在庫を生成し直す
    if (thisItemInfo.status != ItemStatus.DRAFT) {
      //定義ができたところで、バンドル在庫増加関数を実行

      const bundleProductService = new BackendCoreProductService(
        thisItemInfo.products[0].id,
      );
      this.give(bundleProductService);

      //在庫を増やす
      const changeResult = await bundleProductService.increaseStock({
        source_kind: ProductStockHistorySourceKind.bundle,
        source_id: thisItemInfo.id,
        increaseCount: thisItemInfo.init_stock_number!,
        description: `バンドル在庫${
          thisItemInfo.products[0].id
        }の在庫数を${thisItemInfo.init_stock_number!}増加させました`,
      });
    }

    //これで完了
  };

  //バンドルのステータスを更新する関数
  public updateStatus = async ({
    storeId,
    itemId,
  }: {
    storeId?: Store['id']; //特定の店舗の時
    itemId?: Item['id']; //特定の商品マスタの時
  }) => {
    //まずは現在時間を取得する

    const now = customDayjs();
    const today = now.tz().startOf('day');

    //txがある場合それを使う
    const db = this.db;

    //ステータスがDELETE以外のものを全て取得する
    const allBundleItems = await db.item.findMany({
      where: {
        store_id: storeId,
        id: itemId,
        category: {
          handle: ItemCategoryHandle.BUNDLE,
        },
        init_stock_number: {
          gt: 0,
        },
        status: {
          not: ItemStatus.DELETED,
        },
      },
      include: {
        products: true,
        store: {
          include: {
            ec_setting: true,
            accounts: true,
          },
        },
      },
    });

    //ログを残す
    const createLogResult = await db.item_Calculate_History.create({
      data: {
        kind: ItemCalculateKind.BUNDLE,
      },
    });

    let logText = `
    実行対象日:${today.format('YYYY-MM-DD')} ${
      storeId ? `対象ストア: ${storeId}` : ''
    }
    `;

    //全てのバンドル商品について見ていく
    for (const item of allBundleItems) {
      const startDate = item.start_at;
      const expireDate = item.expire_at;

      //storeを無理やりAPIに格納 [TODO] 見直したい
      if (!storeId) {
        this.setResources({
          store: item.store,
        });
        this.ids.itemId = item.id;
        this.ids.storeId = item.store_id;
      }

      //startDate <= today　かつPUBLISHじゃなかったらPUBLISHにして、在庫数を増やす　※ここでエラーが発生する可能性がある
      //expireDateがあって、 expireDate <= today - 1 day　だったら前解体する
      //なお、在庫数が

      try {
        //txがある場合そのトランザクションを使う
        await this.safeTransaction(async (tx) => {
          let currentStatus = item.status;

          //PUBLISHにできるかどうか
          if (
            startDate &&
            startDate.getTime() <= today.valueOf() &&
            currentStatus != ItemStatus.PUBLISH
          ) {
            const updateRes = await tx.item.update({
              where: {
                id: item.id,
              },
              data: {
                status: ItemStatus.PUBLISH,
              },
            });

            currentStatus = updateRes.status;
            logText += `
バンドル商品マスタ:${item.id} のステータスを${currentStatus}に変更しました
`;

            //在庫数を増やす
            //定義ができたところで、バンドル在庫増加関数を実行
            const bundleProductModel = new BackendCoreProductService(
              item.products[0].id,
            );
            this.give(bundleProductModel);

            //在庫を増やす
            const changeResult = await bundleProductModel.increaseStock({
              source_kind: ProductStockHistorySourceKind.bundle,
              source_id: item.id,
              increaseCount: item.init_stock_number!,
              description: `バンドル在庫${
                item.products[0].id
              }の在庫数を${item.init_stock_number!}増加させました`,
            });
          }

          //DELETEにできるかどうか
          if (
            expireDate &&
            expireDate.getTime() <= today.subtract(1, 'day').valueOf() &&
            currentStatus != ItemStatus.DELETED
          ) {
            currentStatus = ItemStatus.DELETED;
            logText += `
バンドル商品マスタ:${item.id} のステータスを${currentStatus}に変更しました
`;
            //解体する
            //（この商品マスタのために新しくインスタンスを作る）

            const thisItem = new BackendCoreItemService(item.id);

            //以下の処理で自動的にステータスがDELETEDになる
            await thisItem.bundle.release({});
          }
        });
      } catch (e: any) {
        console.log(e);
        logText += `
バンドル商品マスタ:${item.id} のステータス変更中にエラーが発生しました\n${e.message}
        `;

        //txがある場合エラーをスローする
        if (this.tx) {
          throw new BackendCoreError({
            internalMessage:
              '在庫が作成できませんでした。数量を確認してください',
            externalMessage:
              '在庫が作成できませんでした。数量を確認してください',
          });
        }
      }
    }

    //最後にログを更新する
    await db.item_Calculate_History.update({
      where: {
        id: createLogResult.id,
      },
      data: {
        log_text: logText,
      },
    });
  };
}
