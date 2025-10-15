import { ProductStockHistorySourceKind, StockingStatus } from '@prisma/client';
import {
  BackendCoreError,
  BackendCoreProductService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//仕入れ
export const productStockingController: TaskCallback<
  typeof workerDefs.product.kinds.productStocking.body
> = async (task) => {
  //仕入れ先ごとにグルーピングする
  const grouped = Object.values(
    task.body.reduce(
      (acc, item) => {
        const key = item.data.supplier_id;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<number, typeof task.body>,
    ),
  );

  const allProducts = await task.db.product.findMany({
    where: {
      store_id: task.ids.storeId!,
      deleted: false,
      id: {
        in: task.body.map((each) => each.data.id),
      },
    },
  });

  await task.transaction(async (tx) => {
    //それぞれの仕入れ先について入荷を作っていく
    for (const eachStocking of grouped) {
      const supplier_id = eachStocking[0].data.supplier_id;
      const staff_account_id = eachStocking[0].data.staff_account_id;

      //見込み売り上げ、仕入れ合計額も算出する
      const summary = {
        total_wholesale_price: 0,
        expected_sales: 0,
        total_item_count: 0,
      };

      for (const data of eachStocking) {
        const product = data.data;
        const thisProduct = allProducts.find((each) => each.id === product.id);

        if (!thisProduct) {
          throw new BackendCoreError({
            internalMessage: `商品が見つかりませんでした。id: ${product.id}`,
          });
        }

        const sellPrice =
          thisProduct.specific_sell_price ?? thisProduct.sell_price ?? 0;

        summary.total_wholesale_price +=
          product.stocking_wholesale_price * product.stocking_item_count;
        summary.expected_sales += sellPrice * product.stocking_item_count;
        summary.total_item_count += product.stocking_item_count;
      }

      //入荷を作成する
      const createStockingRes = await tx.stocking.create({
        data: {
          store_id: task.ids.storeId!,
          planned_date: new Date(),
          actual_date: new Date(),
          status: StockingStatus.FINISHED,
          ...summary,
          supplier_id,
          staff_account_id,
          stocking_products: {
            create: eachStocking.map((each) => ({
              product_id: each.data.id,
              planned_item_count: each.data.stocking_item_count,
              actual_item_count: each.data.stocking_item_count,
              unit_price: each.data.stocking_wholesale_price,
            })),
          },
        },
      });

      //仕入れを作る
      for (const data of eachStocking) {
        const product = data.data;
        const thisProduct = new BackendCoreProductService(product.id);
        task.give(thisProduct);

        const thisUnitPrice = product.stocking_wholesale_price;
        const thisWholesaleRecords = thisProduct.wholesalePrice.generateRecords(
          {
            totalCount: product.stocking_item_count,
            totalWholesalePrice: thisUnitPrice * product.stocking_item_count,
            arrived_at: createStockingRes.actual_date,
          },
        );

        await thisProduct.increaseStock({
          wholesaleRecords: thisWholesaleRecords,
          increaseCount: product.stocking_item_count,
          description: `CSV仕入れによって ${product.id}を${product.stocking_item_count}増加させました`,
          source_kind: ProductStockHistorySourceKind.stocking,
          source_id: createStockingRes.id,
        });
      }
    }
  });
};
