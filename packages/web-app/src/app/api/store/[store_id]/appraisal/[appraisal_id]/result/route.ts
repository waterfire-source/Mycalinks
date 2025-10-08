import { BackendAPI } from '@/api/backendApi/main';
import {
  Prisma,
  ProductStockHistorySourceKind,
  SpecialtyKind,
} from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { inputAppraisalResultApi } from 'api-generator';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { WholesalePriceRecord } from 'backend-core';

//鑑定結果入力API
export const POST = BackendAPI.create(
  inputAppraisalResultApi,
  async (API, { params, body }) => {
    //appraisalが存在するか確認
    console.log('body', body);

    const thisAppraisal = await API.db.appraisal.findUnique({
      where: {
        id: params.appraisal_id,
        store_id: params.store_id,
        finished: false,
        deleted: false,
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                item_id: true,
              },
            },
          },
        },
      },
    });

    if (!thisAppraisal) throw new ApiError('notExist');

    //一つ一つ商品を確認していく

    let totalCost = 0;

    const result = await API.transaction(async (tx) => {
      //同じ在庫を扱うこともあるため、直列処理で
      for (const product of thisAppraisal.products) {
        //この在庫の結果を入力する
        const thisProductOnReq = body.products.find((e) => e.id == product.id);
        //なかったらエラー
        if (!thisProductOnReq)
          throw new ApiError({
            status: 404,
            messageText: '鑑定対象商品が全て指定されていません',
          });

        const appraisal_fee =
          thisProductOnReq.appraisal_fee ?? product.appraisal_fee;

        //諸手数料を含めた合計の鑑定費用を算出していく
        totalCost += appraisal_fee;

        const updateFields: Prisma.Appraisal_ProductUpdateInput = {
          appraisal_fee,
        };

        //登録するのかしないのかで対応を変えていく
        if (thisProductOnReq.specialty_id) {
          //このspecialtyが存在し、かつ鑑定用かどうかを確認
          const specialtyInfo = await API.db.specialty.findUnique({
            where: {
              id: thisProductOnReq.specialty_id,
              store_id: params.store_id,
              kind: SpecialtyKind.APPRAISAL,
            },
          });
          if (!specialtyInfo) {
            throw new ApiError({
              status: 404,
              messageText: '鑑定用のスペシャルティが見つかりませんでした',
            });
          }

          let toProductInfo;
          let toProductService;

          // appraisal_numberがある場合は管理番号付きで新しい在庫を作成
          if (thisProductOnReq.appraisal_number) {
            if (!thisProductOnReq.sell_price) {
              throw new ApiError({
                status: 400,
                messageText: '管理番号付き鑑定済み商品の販売価格が指定されていません',
              });
            }

            toProductService = new BackendApiProductService(API);
            toProductService.setIds({
              itemId: product.product.item_id,
            });

            //管理番号付きで新しい在庫を作成
            toProductInfo = await toProductService.core.create({
              conditionOptionId: thisProductOnReq.condition_option_id,
              additionalField: {
                sell_price: thisProductOnReq.sell_price,
                specialty_id: thisProductOnReq.specialty_id,
                management_number: thisProductOnReq.appraisal_number,
              },
            });
          } else {
            // appraisal_numberがない場合、既存の特殊状態在庫を探す
            const existingProduct = await API.db.product.findFirst({
              where: {
                item_id: product.product.item_id,
                specialty_id: thisProductOnReq.specialty_id,
                condition_option_id: thisProductOnReq.condition_option_id,
                store_id: params.store_id,
                deleted: false,
                management_number: null, // 管理番号なしの在庫を探す
              },
            });

            if (existingProduct) {
              // 既存在庫がある場合
              toProductInfo = existingProduct;
              toProductService = new BackendApiProductService(API, existingProduct.id);

              // sell_priceが指定されている場合は価格を更新
              if (thisProductOnReq.sell_price) {
                await API.db.product.update({
                  where: { id: existingProduct.id },
                  data: { sell_price: thisProductOnReq.sell_price },
                });
              }
            } else {
              // 既存在庫がない場合は新規作成
              toProductService = new BackendApiProductService(API);
              toProductService.setIds({
                itemId: product.product.item_id,
              });

              toProductInfo = await toProductService.core.create({
                conditionOptionId: thisProductOnReq.condition_option_id,
                additionalField: {
                  sell_price: thisProductOnReq.sell_price || null,
                  specialty_id: thisProductOnReq.specialty_id,
                  management_number: null,
                },
              });
            }
          }

          updateFields.to_product = {
            connect: {
              id: toProductInfo.id,
              store: {
                id: params.store_id,
              },
            },
          };

          updateFields.sell_price = thisProductOnReq.sell_price;
          updateFields.specialty = {
            connect: {
              id: thisProductOnReq.specialty_id,
            },
          };
          updateFields.appraisal_number = thisProductOnReq.appraisal_number;

          //仕入れ値レコード
          const thisWholesaleRecord: WholesalePriceRecord = {
            product_id: toProductInfo.id,
            item_count: 1,
            unit_price: product.wholesale_price + appraisal_fee, //鑑定費用も上乗せして仕入れ値を作る
          };

          //このproductの在庫数を1にする
          await toProductService.core.increaseStock({
            increaseCount: 1,
            source_kind: ProductStockHistorySourceKind.appraisal_return,
            wholesaleRecords: [thisWholesaleRecord],
            source_id: thisAppraisal.id,
            description: `鑑定:${thisAppraisal.id} の鑑定済み在庫登録で在庫が増えました`,
          });
        } else {
          //登録しない場合
          //元の在庫として戻す

          const toProduct = new BackendApiProductService(
            API,
            product.product_id,
          );

          updateFields.to_product = {
            connect: {
              id: product.product_id,
              store: {
                id: params.store_id,
              },
            },
          };

          //仕入れ値レコード
          const thisWholesaleRecord: WholesalePriceRecord = {
            product_id: product.product_id,
            item_count: 1,
            unit_price: product.wholesale_price + appraisal_fee, //鑑定費用も上乗せして仕入れ値を作る
          };

          //このproductの在庫数を1増加させる
          await toProduct.core.increaseStock({
            increaseCount: 1,
            source_kind: ProductStockHistorySourceKind.appraisal_return,
            wholesaleRecords: [thisWholesaleRecord],
            source_id: thisAppraisal.id,
            description: `鑑定:${thisAppraisal.id} の鑑定しない在庫登録で在庫が増えました`,
          });
        }

        //Appraisal_Productも更新する
        await tx.appraisal_Product.update({
          where: {
            appraisal_id: thisAppraisal.id,
            id: product.id,
          },
          data: {
            condition_option: {
              connect: {
                id: thisProductOnReq.condition_option_id,
              },
            },
            ...updateFields,
          },
        });
      }

      // 諸手数料を引くことで純粋な鑑定費用を割り出す
      totalCost -=
        thisAppraisal.handling_fee +
        thisAppraisal.insurance_fee +
        thisAppraisal.other_fee +
        thisAppraisal.shipping_fee;

      //finishedにする
      const updateAppraisalRes = await tx.appraisal.update({
        where: {
          id: thisAppraisal.id,
        },
        data: {
          finished: true,
          appraisal_fee: totalCost,
        },
        include: {
          products: true,
        },
      });

      return updateAppraisalRes;
    });

    return result!;
  },
);
