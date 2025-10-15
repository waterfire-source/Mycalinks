import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { getProductStockHistoryApi } from 'api-generator';

//在庫変動履歴を取得するAPI
export const GET = BackendAPI.create(
  getProductStockHistoryApi,
  async (API, { params, query }) => {
    const whereQuery: Prisma.Product_Stock_HistoryWhereInput['AND'] = [];

    Object.entries(query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'source_kind': //変動の種類
          whereQuery.push({
            source_kind: value,
          });

          break;

        case 'product_id': //対象商品
          whereQuery.push({
            product_id: Number(value),
          });

          break;

        case 'datetime_gte': //期間指定開始
          whereQuery.push({
            datetime: {
              gte: new Date(value),
            },
          });

          break;

        case 'datetime_lt': //期間指定終了
          whereQuery.push({
            datetime: {
              lt: new Date(value),
            },
          });

          break;
      }
    });

    const { store_id } = params;

    const whereCondition = {
      AND: [
        {
          product: {
            store_id: Number(store_id),
          },
        },
        ...whereQuery,
      ],
    };

    // 総件数取得
    const totalCount = await API.db.product_Stock_History.count({
      where: whereCondition,
    });

    const selectResult = await API.db.product_Stock_History.findMany({
      where: whereCondition,
      include: {
        product: {
          include: {
            condition_option: {
              select: {
                display_name: true,
              },
            },
            specialty: {
              select: {
                display_name: true,
              },
            },
            item: {
              select: {
                rarity: true,
                expansion: true,
                cardnumber: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          datetime: 'desc',
        },
      ],
      ...API.limitQuery,
    });

    const histories = selectResult.map((h) => {
      const productModel = new BackendApiProductService(API);
      return {
        id: h.id,
        product_id: h.product_id,
        item_count: h.item_count,
        staff_account_id: h.staff_account_id,
        source_kind: h.source_kind,
        source_id: h.source_id,
        result_stock_number: h.result_stock_number,
        datetime: h.datetime,
        description: h.description,
        unit_price: h.unit_price,
        product: {
          ...h.product,
          displayNameWithMeta: productModel.core.getProductNameWithMeta(
            h.product,
          ),
          condition_option: h.product.condition_option || { display_name: '' },
          specialty: h.product.specialty,
          item: {
            rarity: h.product.item?.rarity || null,
            expansion: h.product.item?.expansion || null,
            cardnumber: h.product.item?.cardnumber || null,
          },
        },
      };
    });

    return {
      histories,
      totalCount: totalCount,
    };
  },
);
