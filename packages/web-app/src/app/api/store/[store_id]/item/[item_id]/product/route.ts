// 在庫を作成

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { createProductApi } from 'api-generator';

export const POST = BackendAPI.create(
  createProductApi,
  async (API, { params, body }) => {
    const { store_id, item_id } = params;

    //[TODO] ここで未開封とかの特殊在庫とかも選べるようにするかも
    const {
      condition_option_id,
      allowDuplicate,
      specialty_id,
      consignment_client_id,
      specific_sell_price,
      specific_buy_price,
      //管理番号をnullでリクエストするとなぜか0で渡される
      management_number,
    } = body;

    //item情報を取得する
    const thisItemInfo = await API.db.item.findUniqueExists({
      where: {
        id: item_id,
        store_id,
      },
      include: {
        category: {
          include: {
            condition_options: true,
          },
        },
        products: true,
      },
    });

    if (!thisItemInfo) throw new ApiError('notExist');

    //重複があるか確認

    if (!allowDuplicate) {
      //同じ状態、かつ同じスペシャルティ、かつ同じ委託者のものがあるかどうか
      const sameProducts = thisItemInfo.products.filter((e) => {
        if (management_number === null) {
          return (
            e.condition_option_id == condition_option_id &&
            e.specialty_id == (specialty_id ?? null) &&
            e.consignment_client_id == (consignment_client_id ?? null)
          );
        } else false;
      });

      //あったら詳しく見る
      if (sameProducts.length) {
        throw new ApiError({
          status: 400,
          messageText: '同じような在庫がすでに登録されています',
        });
      }
    }

    //在庫を作成する
    const txResult = await API.transaction(async (tx) => {
      const productService = new BackendApiProductService(API);
      productService.setIds({ itemId: item_id });
      const productInfo = await productService.core.create({
        conditionOptionId: condition_option_id,
        specificItemInfo: thisItemInfo,
        additionalField: {
          specialty_id: specialty_id || null,
          management_number: management_number ?? null,
          consignment_client_id: consignment_client_id ?? null,
          specific_sell_price: specific_sell_price ?? null,
          specific_buy_price: specific_buy_price ?? null,
        },
      });

      return productInfo;
    });

    return txResult;
  },
);
