import { BackendService } from '@/services/internal/main';
import { EcOrderCartStoreStatus, Prisma, Store } from '@prisma/client';
import { customDayjs } from 'common';

/**
 * EC注文ETLコアサービス
 */
export class BackendCoreEcOrderEtlService extends BackendService {
  constructor(storeId?: Store['id']) {
    super();
    this.setIds({
      storeId,
    });
  }

  /**
   * 日毎のEC注文集計をストアごとに作成する
   * [TODO] 集計系の処理は別のクラスで管理したい
   */
  @BackendService.WithIds(['storeId'])
  public dailyCalculate = async (targetDay: Date) => {
    targetDay = customDayjs(targetDay).tz().startOf('day').toDate();

    console.log(
      `storeId: ${this.ids.storeId} targetDay: ${targetDay} のEC注文DWH用の集計を行います`,
    );

    await this.safeTransaction(
      async (tx) => {
        //fact productの方

        //再計算対策のためにまずは削除する
        await tx.fact_Ec_Order_Product.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        await tx.summary_Daily_Ec_Order.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        //fact productの作成

        //対象の取引をすべてみっちりと取得
        const [allEcOrders, ecSetting] = await Promise.all([
          tx.ec_Order_Cart_Store.findMany({
            where: {
              store_id: this.ids.storeId,
              finished_at: {
                gte: targetDay,
                lt: customDayjs(targetDay).add(1, 'day').toDate(),
              },
              status: {
                in: [
                  EcOrderCartStoreStatus.COMPLETED,
                  EcOrderCartStoreStatus.CANCELED,
                ],
              },
            },
            include: {
              order: true,
              products: {
                include: {
                  product: {
                    include: {
                      item: {
                        include: {
                          genre: true,
                          category: true,
                        },
                      },
                      condition_option: true,
                      specialty: true,
                    },
                  },
                },
              },
            },
          }),
          tx.ec_Setting.findUnique({
            where: {
              store_id: this.ids.storeId,
            },
          }),
        ]);

        //ecSettingがない場合は対象にしない
        if (!ecSetting) {
          console.log(`ecSettingがないため対象にしない`);
          return;
        }

        console.log(`対象データ: ${allEcOrders.length}件`);

        //summary用
        const summaryRecord = {
          store_id: this.ids.storeId!,
          target_day: targetDay,
          price: 0,
          shipping_fee: 0,
          commission_price: 0,
          completed_count: 0,
          canceled_count: 0,
          change_count: 0,
          cancel_price: 0,
          change_price: 0,
          item_count: 0,
          wholesale_price: 0,
        } satisfies Prisma.Summary_Daily_Ec_OrderCreateInput;

        const factRecords: Prisma.Fact_Ec_Order_ProductCreateManyInput[] = [];

        //それぞれの取引を見ていく
        for (const o of allEcOrders) {
          //summaryの方
          if (o.status == EcOrderCartStoreStatus.COMPLETED) {
            summaryRecord.completed_count++;
            summaryRecord.price += o.total_price;
            summaryRecord.shipping_fee += o.shipping_fee;

            //欠品があるかどうかみる
            const changedProducts = o.products.filter(
              (p) => p.item_count !== p.original_item_count,
            );
            if (changedProducts.length > 0) {
              summaryRecord.change_count += 1;
              summaryRecord.change_price += changedProducts.reduce(
                (acc, curr) =>
                  acc +
                  (curr.original_item_count - curr.item_count) *
                    curr.total_unit_price!,
                0,
              );
            }
          } else if (o.status == EcOrderCartStoreStatus.CANCELED) {
            summaryRecord.canceled_count++;
            summaryRecord.cancel_price += o.total_price;

            //もう用はないためbreak;
            break;
          }

          //fact用
          //statusがCOMPLETEDのもののみ

          for (const p of o.products) {
            summaryRecord.item_count += p.item_count;
            summaryRecord.wholesale_price += p.wholesale_total_price ?? 0;

            factRecords.push({
              order_id: o.order_id,
              store_id: o.store_id,
              product_id: p.product_id,
              cart_id: p.id,
              item_count: p.item_count,
              original_item_count: p.original_item_count,
              wholesale_total_price: p.wholesale_total_price ?? 0,
              total_unit_price: p.total_unit_price ?? 0,
              product_display_name: p.product.display_name,
              condition_option_id: p.product.condition_option?.id ?? 0,
              condition_option_display_name:
                p.product.condition_option?.display_name ?? '',
              condition_option_handle: p.product.condition_option?.handle ?? '',
              item_id: p.product.item.id,
              myca_item_id: p.product.item.myca_item_id,
              category_id: p.product.item.category.id,
              category_display_name: p.product.item.category.display_name,
              genre_id: p.product.item.genre?.id ?? 0,
              genre_display_name: p.product.item.genre?.display_name ?? '',
              specialty_id: p.product.specialty?.id ?? 0,
              specialty_display_name: p.product.specialty?.display_name ?? '',
              specialty_handle: p.product.specialty?.handle ?? '',
              management_number: p.product.management_number ?? '',
              expansion: p.product.item.expansion,
              rarity: p.product.item.rarity,
              cardnumber: p.product.item.cardnumber,
              payment_method: o.order.payment_method ?? '',
              order_created_at: o.created_at,
              order_completed_at: o.finished_at ?? '',
              target_day: targetDay,
              category_handle: p.product.item.category.handle ?? '',
              genre_handle: p.product.item.genre?.handle ?? '',
            });
          }
        }

        //手数料を計算する 商品売上から計算する
        const commissionPrice = Math.round(
          (summaryRecord.price - summaryRecord.shipping_fee) *
            (ecSetting.commission_rate / 100),
        );
        summaryRecord.commission_price = commissionPrice;

        console.log(`集計結果:`);

        console.log(`summaryRecord: ${JSON.stringify(summaryRecord, null, 2)}`);
        console.log(`factRecords: ${factRecords.length}件`);

        //集計結果を入れていく
        await Promise.all([
          tx.summary_Daily_Ec_Order.createMany({
            data: summaryRecord,
          }),
          tx.fact_Ec_Order_Product.createMany({
            data: factRecords,
          }),
        ]);
      },
      {
        timeout: 1000 * 60 * 7, //5分間は有効にする
        maxWait: 1000 * 60 * 7,
      },
    );
  };
}

//売り上げ分析再計算
//すべてのストアを取得
// const allStores = await API.db.store.findMany({
//   where: {
//     is_active: true,
//   },
//   select: {
//     id: true,
//   },
// });

// for (const store of allStores) {
//   const transactionService = new BackendCoreTransactionService();
//   API.give(transactionService);
//   transactionService.resetIds({
//     storeId: store.id,
//   });

//   //売り上げがあった最初の日を取得
//   const startDayRes = await API.db.transaction.aggregate({
//     where: {
//       store_id: store.id,
//     },
//     _min: {
//       created_at: true,
//     },
//   });

//   const startDay = startDayRes._min.created_at;

//   if (!startDay) {
//     continue;
//   }

//   //この日から今日までの日付で売り上げ分析の処理を行なっていく
//   let deltaDay = 0;
//   const today = customDayjs().startOf('day');
//   const endDay = today.subtract(1, 'day').toDate();

//   while (true) {
//     const targetDay = customDayjs(startDay)
//       .startOf('day')
//       .add(deltaDay, 'day');

//     //targetDayがendDayを超えたら終了
//     if (targetDay.isAfter(endDay)) {
//       break;
//     }

//     const res = await transactionService.dailyCalculate(targetDay.toDate());
//     deltaDay++;
//   }
// }
