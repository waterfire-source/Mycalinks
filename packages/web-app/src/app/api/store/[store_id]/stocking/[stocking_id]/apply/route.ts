//仕入れの適用

import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import {
  ProductStockHistorySourceKind,
  StockingStatus,
  StoreShipmentStatus,
  TaxMode,
} from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//入荷の適用を行うAPI ついでに実際の仕入れ個数や実際の仕入れ日を登録することができる
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, stocking_id } = API.params;

    const {
      actual_date, //実際の仕入れ日
      stocking_products, //idとactual_item_countも含めた仕入れ対象商品
      // staff_account_id, //担当者のID
    } = API.body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    API.checkField(['actual_date', 'stocking_products'], true);

    let result: any = {};

    //あるか確認
    const currentStockingInfo = await API.db.stocking.findUnique({
      where: {
        store_id: parseInt(store_id),
        id: parseInt(stocking_id),
      },
      include: {
        from_store_shipment: {
          select: {
            id: true,
          },
        },
        stocking_products: {
          include: {
            product: {
              select: {
                specific_sell_price: true,
                sell_price: true,
              },
            },
          },
        },
      },
    });

    if (!currentStockingInfo) throw new ApiError('notExist');

    result = await API.transaction(async (tx) => {
      //まず最初にStockingの情報をいれつつ、ステータスを完了にする

      //入荷内容の方を先に更新する
      //見込み売上、仕入れ合計額も算出する

      let summary = {
        total_wholesale_price: 0,
        expected_sales: 0,
        total_item_count: 0,
      };

      let withoutTax = false;

      // @ts-expect-error becuase of 同期処理入りのreduceを実現するため
      summary = await currentStockingInfo.stocking_products.reduce(
        async (acc: Promise<typeof summary>, each) => {
          const resolvedAcc = await acc;

          const dataInBody = stocking_products.find(
            (e: any) => e.id == each.id,
          );

          //actual_item_countがない場合などにエラー
          if (
            !dataInBody ||
            dataInBody.actual_item_count == undefined ||
            (each.unit_price == null && each.unit_price_without_tax == null)
          )
            throw new ApiError('notEnough');

          //あったら価格から仕入れ値を求める
          const sellPrice =
            each.product.specific_sell_price ?? each.product.sell_price ?? 0;

          //合計個数
          resolvedAcc.total_item_count += dataInBody.actual_item_count;

          //合計仕入れ額
          resolvedAcc.total_wholesale_price +=
            (each.unit_price_without_tax ?? each.unit_price)! *
            dataInBody.actual_item_count;

          withoutTax = each.unit_price_without_tax != null;

          //合計売上
          resolvedAcc.expected_sales +=
            dataInBody.actual_item_count * sellPrice;

          //actual_item_countを更新する
          await tx.stocking_Product.update({
            where: {
              id: each.id,
            },
            data: {
              actual_item_count: dataInBody.actual_item_count,
            },
          });

          return resolvedAcc;
        },
        summary,
      );

      const storeSetting = API.resources.store!;

      //ストアが税込モードなのに税抜きモードの場合はここで税をタス
      if (storeSetting.tax_mode == TaxMode.INCLUDE && withoutTax) {
        summary.total_wholesale_price = Math.round(
          summary.total_wholesale_price * (API.resources.store!.tax_rate + 1),
        );
        summary.expected_sales = Math.round(
          summary.expected_sales * (API.resources.store!.tax_rate + 1),
        );
      }
      //ストアが税抜きモードなのに税込モードの場合はここで税を引く
      else if (storeSetting.tax_mode == TaxMode.EXCLUDE && !withoutTax) {
        summary.total_wholesale_price = Math.round(
          summary.total_wholesale_price * (1 / (storeSetting.tax_rate + 1)),
        );
        summary.expected_sales = Math.round(
          summary.expected_sales * (1 / (storeSetting.tax_rate + 1)),
        );
      }

      const updateResult = await tx.stocking.update({
        where: {
          id: currentStockingInfo.id,
        },
        data: {
          status: StockingStatus.FINISHED,
          actual_date: new Date(actual_date),
          ...summary,
        },
        include: {
          stocking_products: true,
        },
      });

      //出荷が結びついている場合は、それを納品済みにする
      if (currentStockingInfo.from_store_shipment) {
        await tx.store_Shipment.update({
          where: {
            id: currentStockingInfo.from_store_shipment.id,
          },
          data: {
            status: StoreShipmentStatus.FINISHED,
            finished_at: new Date(),
          },
        });
      }

      //この下から実際に在庫数を調整していく
      //0この場合は仕入しない

      for (const p of updateResult.stocking_products) {
        //在庫調整を行う

        if (p.actual_item_count == 0) continue;

        const thisProduct = new BackendApiProductService(API, p.product_id);

        if ((p.unit_price_without_tax ?? p.unit_price) == null) continue;

        let totalWholesalePrice =
          p.actual_item_count! * (p.unit_price_without_tax ?? p.unit_price)!;

        //ストアが内税モードなのに　税抜きモードの場合は税を足す（ここで足すことでまだ誤差を抑えることができる）
        if (
          storeSetting.tax_mode == TaxMode.INCLUDE &&
          p.unit_price_without_tax != null
        ) {
          totalWholesalePrice = Math.round(
            totalWholesalePrice * (storeSetting.tax_rate + 1),
          );
        }
        //ストアが外税モードなのに　税込モードの場合は、税を抜く
        else if (
          storeSetting.tax_mode == TaxMode.EXCLUDE &&
          p.unit_price != null
        ) {
          totalWholesalePrice = Math.round(
            totalWholesalePrice * (1 / (storeSetting.tax_rate + 1)),
          );
        }

        //レコードを作る
        const thisWholesaleRecords =
          thisProduct.core.wholesalePrice.generateRecords({
            totalCount: p.actual_item_count!,
            totalWholesalePrice,
            arrived_at: updateResult.actual_date!,
          });

        const changeResult = await thisProduct.core.increaseStock({
          wholesaleRecords: thisWholesaleRecords,
          source_kind: ProductStockHistorySourceKind.stocking,
          source_id: updateResult.id,
          description: `入荷${updateResult.id} の処理の中で 在庫${p.product_id}を${p.actual_item_count}増加させました`,
          increaseCount: p.actual_item_count!,
        });
      }

      return updateResult;
    });

    return API.status(200).response({ data: result });
  },
);
