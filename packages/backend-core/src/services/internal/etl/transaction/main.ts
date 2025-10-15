import { BackendService } from '@/services/internal/main';
import {
  LossStatus,
  Prisma,
  Store,
  SummaryTransactionKind,
  TransactionKind,
  TransactionStatus,
  TransactionTaxKind,
  WholesalePriceHistoryResourceType,
} from '@prisma/client';
import { customDayjs } from 'common';
import { BackendCoreCustomerService } from '@/services/internal/customer/main';

/**
 * 取引ETLコアサービス
 */
export class BackendCoreTransactionEtlService extends BackendService {
  constructor(storeId?: Store['id']) {
    super();
    this.setIds({
      storeId,
    });
  }

  /**
   * 日毎の取引集計をストアごとに作成する
   * [TODO] 集計系の処理は別のクラスで管理したい
   */
  @BackendService.WithIds(['storeId'])
  public dailyCalculate = async (targetDay: Date) => {
    targetDay = customDayjs(targetDay).tz().startOf('day').toDate();

    console.log(
      `storeId: ${this.ids.storeId} targetDay: ${targetDay} の取引DWH用の集計を行います`,
    );

    await this.safeTransaction(
      async (tx) => {
        //fact productの方

        //再計算対策のためにまずは削除する
        await tx.fact_Transaction_Product.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        await tx.summary_Daily_Transaction.deleteMany({
          where: {
            store_id: this.ids.storeId ?? 0,
            target_day: targetDay,
          },
        });

        //fact productの作成

        //対象の取引をすべてみっちりと取得
        const [allTransactions, allLosses] = await Promise.all([
          tx.transaction.findMany({
            where: {
              store_id: this.ids.storeId,
              finished_at: {
                gte: targetDay,
                lt: customDayjs(targetDay).add(1, 'day').toDate(),
              },
              status: TransactionStatus.completed,
            },
            include: {
              transaction_carts: {
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
                  sale: true,
                },
              },
              set_deals: true,
              customer: true,
            },
          }),
          tx.loss.findMany({
            where: {
              store_id: this.ids.storeId,
              created_at: {
                gte: targetDay,
                lt: customDayjs(targetDay).add(1, 'day').toDate(),
              },
              status: LossStatus.FINISHED,
            },
            select: {
              id: true,
            },
          }),
        ]);

        console.log(`対象データ: ${allTransactions.length}件`);
        console.log(`対象ロス: ${allLosses.length}件`);

        //summary用
        const sellSummaryRecord = {
          store_id: this.ids.storeId!,
          target_day: targetDay,
          kind: SummaryTransactionKind.SELL,
          price: 0,
          count: 0,
          return_price: 0,
          return_count: 0,
          wholesale_price: 0,
          loss_wholesale_price: 0,
          buy_assessed_price: 0,
          item_count: 0,
          given_point: 0,
          used_point: 0,
          sale_discount_price: 0,
          discount_price: 0,
          coupon_discount_price: 0,
          product_discount_price: 0,
          product_total_discount_price: 0,
          set_deal_discount_price: 0,
          total_discount_price: 0,
        } satisfies Prisma.Summary_Daily_TransactionCreateInput;
        const buySummaryRecord = {
          ...sellSummaryRecord,
          kind: SummaryTransactionKind.BUY,
        } satisfies Prisma.Summary_Daily_TransactionCreateInput;

        const factRecords: Prisma.Fact_Transaction_ProductCreateManyInput[] =
          [];

        const customerRecords: Prisma.Dim_Transaction_CustomerCreateManyInput[] =
          [];

        //それぞれの取引を見ていく
        for (const t of allTransactions) {
          const kind = t.transaction_kind;

          //fact用
          switch (kind) {
            case TransactionKind.sell:
            case TransactionKind.buy: {
              //顧客レコードを作る
              if (t.customer) {
                const customerService = new BackendCoreCustomerService(
                  t.customer_id!,
                );
                this.give(customerService);
                customerService.targetObject = t.customer;

                customerRecords.push({
                  transaction_id: t.id,
                  customer_id: t.customer_id!,
                  full_name: t.customer.full_name,
                  address: await customerService.fullAddress,
                  career: t.customer.career,
                  age: await customerService.age,
                  id_kind: t.id_kind,
                  id_number: t.id_number,
                });
              }

              for (const c of t.transaction_carts) {
                const factor = t.is_return ? -1 : 1;

                factRecords.push({
                  store_id: t.store_id,
                  transaction_id: t.id,
                  product_id: c.product_id,
                  cart_id: c.id,
                  item_count: factor * c.item_count,
                  sale_id: c.sale_id,
                  sale_display_name: c.sale?.display_name,
                  sale_discount_price: c.sale_discount_price,
                  original_unit_price: c.original_unit_price,
                  unit_price: c.unit_price,
                  wholesale_total_price: factor * c.wholesale_total_price,
                  discount_price: c.discount_price,
                  total_discount_price: c.total_discount_price,
                  total_unit_price: c.total_unit_price,
                  product_display_name: c.product.display_name,
                  condition_option_id: c.product.condition_option?.id ?? 0,
                  condition_option_display_name:
                    c.product.condition_option?.display_name ?? '',
                  item_id: c.product.item.id,
                  myca_item_id: c.product.item.myca_item_id,
                  category_id: c.product.item.category.id,
                  category_display_name: c.product.item.category.display_name,
                  genre_id: c.product.item.genre?.id ?? 0,
                  genre_display_name: c.product.item.genre?.display_name ?? '',
                  specialty_id: c.product.specialty?.id ?? 0,
                  specialty_display_name:
                    c.product.specialty?.display_name ?? '',
                  management_number: c.product.management_number ?? '',
                  expansion: c.product.item.expansion,
                  rarity: c.product.item.rarity,
                  cardnumber: c.product.item.cardnumber,
                  transaction_finished_at: t.finished_at,
                  transaction_created_at: t.created_at,
                  transaction_kind:
                    t.transaction_kind == TransactionKind.sell
                      ? SummaryTransactionKind.SELL
                      : SummaryTransactionKind.BUY,
                  tax_kind: t.tax_kind ?? TransactionTaxKind.INCLUDE_TAX,
                  payment_method: t.payment_method ?? '',
                  target_day: targetDay,
                  is_return: t.is_return,
                });

                switch (kind) {
                  case TransactionKind.sell: {
                    sellSummaryRecord.wholesale_price +=
                      factor * c.wholesale_total_price;
                    sellSummaryRecord.sale_discount_price +=
                      factor * c.sale_discount_price * c.item_count;
                    sellSummaryRecord.product_discount_price +=
                      factor * c.discount_price * c.item_count;
                    sellSummaryRecord.product_total_discount_price +=
                      factor * c.total_discount_price! * c.item_count;
                    sellSummaryRecord.item_count += factor * c.item_count;

                    break;
                  }

                  case TransactionKind.buy: {
                    buySummaryRecord.sale_discount_price +=
                      factor * c.sale_discount_price * c.item_count;
                    buySummaryRecord.product_discount_price +=
                      factor * c.discount_price * c.item_count;
                    buySummaryRecord.product_total_discount_price +=
                      factor * c.total_discount_price! * c.item_count;
                    buySummaryRecord.item_count += factor * c.item_count;
                    break;
                  }
                }
              }
            }
          }

          //summary用
          switch (kind) {
            case TransactionKind.sell: {
              if (!t.is_return) {
                //販売
                sellSummaryRecord.price += t.total_sale_price!;
                sellSummaryRecord.count += 1;
                sellSummaryRecord.given_point += t.point_amount ?? 0;
                sellSummaryRecord.used_point += Math.abs(
                  t.point_discount_price ?? 0,
                );
                sellSummaryRecord.coupon_discount_price +=
                  t.coupon_discount_price;
                sellSummaryRecord.discount_price += t.discount_price;
                sellSummaryRecord.set_deal_discount_price += t.set_deals.reduce(
                  (acc, curr) => acc + (curr.total_discount_price ?? 0),
                  0,
                );
                sellSummaryRecord.total_discount_price +=
                  t.total_discount_price!;
              } else {
                //販売返品

                //ポイント関連は相殺する [TODO] わかりにくいからなんとかしたい
                sellSummaryRecord.given_point += -1 * (t.point_amount ?? 0);
                sellSummaryRecord.used_point +=
                  -1 * Math.abs(t.point_discount_price ?? 0);
                sellSummaryRecord.discount_price += -1 * t.discount_price;
                sellSummaryRecord.coupon_discount_price +=
                  -1 * t.coupon_discount_price;
                sellSummaryRecord.set_deal_discount_price +=
                  -1 *
                  t.set_deals.reduce(
                    (acc, curr) =>
                      acc + curr.total_discount_price * curr.apply_count,
                    0,
                  );
                sellSummaryRecord.total_discount_price +=
                  -1 * t.total_discount_price!;

                sellSummaryRecord.return_price += t.total_sale_price!;
                sellSummaryRecord.return_count += 1;
              }
              break;
            }

            case TransactionKind.buy: {
              if (!t.is_return) {
                //買取
                buySummaryRecord.price += t.total_sale_price!;
                buySummaryRecord.count += 1;
                buySummaryRecord.given_point += t.point_amount ?? 0;
                buySummaryRecord.discount_price += t.discount_price;
                buySummaryRecord.coupon_discount_price +=
                  t.coupon_discount_price;
                buySummaryRecord.total_discount_price +=
                  t.total_discount_price!;
                buySummaryRecord.buy_assessed_price +=
                  t.buy__assessed_total_price ?? 0;
              } else {
                //買取返品
                buySummaryRecord.given_point += -1 * (t.point_amount ?? 0);
                buySummaryRecord.used_point +=
                  -1 * Math.abs(t.point_discount_price ?? 0);
                buySummaryRecord.discount_price += -1 * t.discount_price;
                buySummaryRecord.coupon_discount_price +=
                  -1 * t.coupon_discount_price;
                buySummaryRecord.total_discount_price +=
                  -1 * t.total_discount_price!;

                buySummaryRecord.return_price += t.total_sale_price!;
                buySummaryRecord.return_count += 1;
              }
              break;
            }
          }
        }

        //ロスを見ていく
        for (const l of allLosses) {
          //このロスに紐づいている仕入れ値を全て取得
          const allLossWholesalePrice =
            await tx.product_Wholesale_Price_History.findMany({
              where: {
                resource_type: WholesalePriceHistoryResourceType.LOSS,
                resource_id: l.id,
              },
              select: {
                item_count: true,
                unit_price: true,
              },
            });

          //加算していく
          const wholesalePriceSum = allLossWholesalePrice.reduce(
            (acc, curr) => acc + curr.unit_price * curr.item_count,
            0,
          );

          sellSummaryRecord.loss_wholesale_price += wholesalePriceSum;
        }

        console.log(`集計結果:`);

        console.log(
          `sellSummaryRecord: ${JSON.stringify(sellSummaryRecord, null, 2)}`,
        );
        console.log(
          `buySummaryRecord: ${JSON.stringify(buySummaryRecord, null, 2)}`,
        );
        console.log(`factRecords: ${factRecords.length}件`);

        //集計結果を入れていく
        await Promise.all([
          tx.summary_Daily_Transaction.createMany({
            data: [sellSummaryRecord, buySummaryRecord],
          }),
          tx.fact_Transaction_Product.createMany({
            data: factRecords,
          }),
          tx.dim_Transaction_Customer.createMany({
            data: customerRecords,
            skipDuplicates: true,
          }),
        ]);
      },
      {
        timeout: 1000 * 60 * 5, //5分間は有効にする
        maxWait: 1000 * 60 * 5,
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
