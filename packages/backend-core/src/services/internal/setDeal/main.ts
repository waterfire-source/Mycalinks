import { BackendService } from '@/services/internal/main';
import {
  Set_Deal,
  SetDealStatus,
  Store,
  Transaction_Cart,
} from '@prisma/client';
import { customDayjs } from 'common';

//バックエンドのセット販売

import { PriceUtil } from 'common';
import { BackendCoreError } from '@/error/main';

export class BackendCoreSetDealService extends BackendService {
  constructor() {
    super();
    // this.setIds({
    //   saleId,
    // });
  }

  //指定の組み合わせからセット販売を見つける関数
  @BackendService.WithIds(['storeId'])
  public async findFromCarts(
    carts: Array<{
      product_id: Transaction_Cart['product_id'];
      item_count: Transaction_Cart['item_count'];
      unit_price: Transaction_Cart['unit_price'];
    }>,
  ) {
    //このストアのセット販売を全て取得する
    //有効期限が切れてなくて削除もされていないもの
    const targetSetDeals = await this.db.set_Deal.findMany({
      where: {
        status: {
          not: SetDealStatus.DELETED,
        },
        store_id: Number(this.ids.storeId!),
      },
      include: {
        products: true,
      },
    });

    let newCarts: typeof carts = structuredClone(carts);

    const availableSetDeals: Array<{
      setDealId: Set_Deal['id'];
      applyCount: number; //適用回数
      totalDiscountPrice: number; //合計割引額
      targetProducts: typeof newCarts;
      display_name: Set_Deal['display_name'];
    }> = [];

    //newCartsを再生成
    const makeNewCarts = (targetProducts: typeof newCarts) => {
      //一つ一つnewCartsから引いていく

      newCarts = newCarts
        .map((productOnCarts) => {
          //このproductとunit_price関連のtargetがあるか確認
          const product = targetProducts.find(
            (e) =>
              e.product_id == productOnCarts.product_id &&
              e.unit_price == productOnCarts.unit_price,
          );

          if (product) {
            if (productOnCarts.item_count <= product.item_count) return false;
            else productOnCarts.item_count -= product.item_count;
          }

          return productOnCarts;
        })
        .filter(Boolean) as typeof newCarts;

      return newCarts;
    };

    //セット販売が含まれているうちは実行する
    while (true) {
      let candidateSetDeals: Array<{
        set_deal_id: Set_Deal['id'];
        target_products: typeof newCarts;
        discountPrice: number; //割引される量
        display_name: Set_Deal['display_name'];
      }>;

      //セット販売が含まれているか判断する この辺後で関数として切り出したい
      candidateSetDeals = targetSetDeals
        .map((setDeal) => {
          const targetProducts: typeof newCarts = [];

          //このセット販売のproductsの中身分newCartsから弾いてみてマイナスにならないか確認
          for (const p of setDeal.products) {
            let needCount = p.item_count;

            //このproductを確認していく
            //並び順問題はあるが一旦気にしなくていいや
            for (const productOnCart of newCarts) {
              if (needCount <= 0) break;

              if (productOnCart.product_id != p.product_id) continue;

              //使う数
              const useCount = Math.min(needCount, productOnCart.item_count);

              //残ったらtargetProductsに追加する
              targetProducts.push({
                product_id: productOnCart.product_id,
                item_count: useCount,
                unit_price: productOnCart.unit_price,
              });

              needCount -= useCount;
            }

            //needCountがまだあったら足りないためエラー
            if (needCount > 0) return false;
          }

          //合計割引額を算出する
          const totalPrice = targetProducts.reduce(
            (curSum, e) => curSum + e.unit_price * e.item_count,
            0,
          );

          //割引適用後価格を算出する
          const totalPriceObj = new PriceUtil(totalPrice);
          const discountedPrice = totalPriceObj.applyDiscount(
            setDeal.discount_amount,
          );

          const discountPrice = discountedPrice - totalPrice;

          //候補として入れる
          return {
            set_deal_id: setDeal.id,
            target_products: targetProducts,
            discountPrice,
            display_name: setDeal.display_name,
          };
        })
        .filter(Boolean) as typeof candidateSetDeals;

      //ある場合は、一番良いセット販売を選ぶ
      const finallySetDeal = candidateSetDeals.sort(
        (a, b) => Math.abs(b.discountPrice) - Math.abs(a.discountPrice),
      )[0];

      //候補セット販売が一つもなかったら終了する
      if (!finallySetDeal) break;

      //こいつを適用セールとして追加

      //すでにあるか確認
      const currentRecord = availableSetDeals.find(
        (e) => e.setDealId == finallySetDeal.set_deal_id,
      );

      if (currentRecord) {
        currentRecord.targetProducts.push(...finallySetDeal.target_products);
        currentRecord.applyCount++;
        currentRecord.totalDiscountPrice += finallySetDeal.discountPrice;
      } else {
        availableSetDeals.push({
          setDealId: finallySetDeal.set_deal_id,
          applyCount: 1,
          targetProducts: finallySetDeal.target_products,
          totalDiscountPrice: finallySetDeal.discountPrice,
          display_name: finallySetDeal.display_name,
        });
      }

      //このtargetProductsのぶんnewCartsからひく
      makeNewCarts(finallySetDeal.target_products);
    } //繰り返す

    return {
      availableSetDeals,
    };
  }

  /**
   * 指定されているセット販売が全て適用できるか確認する
   */
  public validateSetDeals(
    availableSetDeals: Array<{
      setDealId: Set_Deal['id'];
      applyCount: number;
    }>,
    setDeals: Array<{
      set_deal_id: Set_Deal['id'];
      apply_count: number;
    }>,
  ) {
    if (
      !setDeals.every((e) =>
        availableSetDeals.find(
          (each) =>
            each.setDealId == e.set_deal_id && each.applyCount >= e.apply_count,
        ),
      )
    )
      throw new BackendCoreError({
        internalMessage: `適用できないセット販売が含まれています`,
        externalMessage: '適用できないセット販売が含まれています',
      });
  }

  //ステータスを更新する関数
  public async updateStatus({
    storeId,
  }: {
    storeId?: Store['id']; //特定の店舗の時
  }) {
    //まずは現在時間を取得する
    const now = customDayjs();
    const today = now.tz().startOf('day');

    //ステータスがDELETE以外のものを全て取得する
    const allSetDeals = await this.primaryDb.set_Deal.findMany({
      where: {
        store_id: storeId,
        status: {
          not: SetDealStatus.DELETED,
        },
      },
    });

    //全てのセット販売について見ていく
    for (const setDeal of allSetDeals) {
      const startDate = setDeal.start_at;
      const expireDate = setDeal.expire_at;

      //startDate <= today　かつPUBLISHじゃなかったらPUBLISHにする
      //expireDateがあって、 expireDate <= today - 1 day　だったらDELETEDにする

      try {
        await this.transaction(async (tx) => {
          let currentStatus = setDeal.status;

          //PUBLISHにできるかどうか
          if (
            startDate &&
            startDate.getTime() <= today.valueOf() &&
            currentStatus != SetDealStatus.PUBLISH
          ) {
            const updateRes = await tx.set_Deal.update({
              where: {
                id: setDeal.id,
              },
              data: {
                status: SetDealStatus.PUBLISH,
              },
            });

            currentStatus = updateRes.status;
          }

          //DELETEにできるかどうか
          if (
            expireDate &&
            expireDate.getTime() <= today.subtract(1, 'day').valueOf() &&
            currentStatus != SetDealStatus.DELETED
          ) {
            const updateRes = await tx.set_Deal.update({
              where: {
                id: setDeal.id,
              },
              data: {
                status: SetDealStatus.DELETED,
              },
            });

            currentStatus = updateRes.status;
          }
        });
      } catch (e: any) {
        console.log(e);
      }
    }
  }
}
