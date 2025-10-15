import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, ProductStockHistorySourceKind } from '@prisma/client';
import { ProductTransferKind } from '@/app/api/store/[store_id]/product/def';
import { getProductTransferHistoryApi } from 'api-generator';

//在庫ごとの変換履歴を取得するAPI
export const GET = BackendAPI.create(
  getProductTransferHistoryApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Product_Stock_HistoryWhereInput> = [];

    //モードを確認
    switch (query.kind) {
      case ProductTransferKind.FROM: //変換前になってたら、在庫数が減っているため負の数の条件追加
        whereInput.push({
          item_count: {
            lt: 0,
          },
        });
        break;
      case ProductTransferKind.TO: //変換後モードだったら正の数
        whereInput.push({
          item_count: {
            gte: 0,
          },
        });
        break;
    }

    const selectRes = await API.db.product_Stock_History.findMany({
      where: {
        product: {
          id: params.product_id,
          store_id: params.store_id,
        },
        source_kind: ProductStockHistorySourceKind.transfer,
        source_id: {
          not: null,
        },
        AND: whereInput,
      },
      orderBy: API.orderByQuery,
    });

    return {
      stockHistories: selectRes,
    };
  },
);
