// 入荷の取り消しを行う
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ProductStockHistorySourceKind, StockingStatus } from '@prisma/client';
import { rollbackStockingApi } from 'api-generator';

export const POST = BackendAPI.create(
  rollbackStockingApi,
  async (API, { params, body }) => {
    const { store_id, stocking_id } = params;

    const alreadyInfo = await API.db.stocking.findUnique({
      where: {
        id: stocking_id,
        store_id,
        status: StockingStatus.FINISHED,
      },
      include: {
        stocking_products: true,
        from_store_shipment: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!alreadyInfo) throw new ApiError('notExist');

    //出荷が結び付けられている場合、取り消しできない
    if (alreadyInfo.from_store_shipment?.id)
      throw new ApiError({
        status: 400,
        messageText: `
店舗間在庫移動によって作成された発注は取り消しできません
        `,
      });

    await API.transaction(async (tx) => {
      //全ての在庫に対してロールバックする
      for (const product of alreadyInfo.stocking_products) {
        //在庫数を戻す
        const productService = new BackendApiProductService(
          API,
          product.product_id,
        );
        const changeRes = await productService.core.decreaseStock({
          decreaseCount: product.actual_item_count ?? 0,
          source_kind: ProductStockHistorySourceKind.stocking_rollback,
          source_id: alreadyInfo.id,
          description: body.description,
        });

        console.log(changeRes);
      }

      //ステータスを変える
      await tx.stocking.update({
        where: { id: stocking_id },
        data: { status: StockingStatus.ROLLBACK },
      });
    });
  },
);
