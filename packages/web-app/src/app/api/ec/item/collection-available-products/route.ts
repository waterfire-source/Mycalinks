//デッキで利用可能な、購入可能なproductsを返すAPI

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { ConditionOptionHandle } from '@prisma/client';
import {
  ApiResponse,
  getEcCollectionAvailableProductsApi,
} from 'api-generator';
import { ecConstants } from 'common';

//コレクションのやつ
export const GET = BackendAPI.create(
  getEcCollectionAvailableProductsApi,
  async (API, { query }) => {
    const collectionId = query.collectionId;

    const mycaAppService = new BackendApiMycaAppService(API);

    const collectionItems =
      await mycaAppService.core.collection.getCollectionItems({
        collection: collectionId,
      });

    const allMycaItemIds = collectionItems.items.map((e) => e.id);

    //一旦全てのProductを取得しちゃう
    const allAvailableProducts = await API.db.product.findMany({
      where: {
        item: {
          myca_item_id: {
            in: allMycaItemIds,
          },
        },
        mycalinks_ec_enabled: true,
        store: {
          mycalinks_ec_enabled: true,
        },
        //在庫がないとだめ
        ec_stock_number: {
          gt: 0,
        },
        actual_ec_sell_price: {
          not: null,
          gt: 0,
        },
        condition_option: {
          handle: {
            in: [
              ...Object.keys(ecConstants.ecConditionOptionHandleDict),
            ] as ConditionOptionHandle[],
          },
        },
      },
      select: {
        id: true,
        ec_stock_number: true,
        actual_ec_sell_price: true,
        condition_option: {
          select: {
            handle: true,
          },
        },
        store: {
          select: {
            id: true,
            display_name: true,
            ec_setting: {
              select: {
                same_day_limit_hour: true,
                shipping_days: true,
                closed_day: true,
              },
            },
          },
        },
        item: {
          select: {
            myca_item_id: true,
          },
        },
      },
    });

    //それぞれのアイテムを見ていく
    const result: ApiResponse<typeof getEcCollectionAvailableProductsApi> = {
      collectionItems: [],
    };

    collectionItems.items.forEach((each) => {
      const thisRecordInfo: ApiResponse<
        typeof getEcCollectionAvailableProductsApi
      >['collectionItems'][number] = {
        mycaItem: each,
        availableProducts: [],
      };

      //availableProductsの中から探す
      thisRecordInfo.availableProducts = allAvailableProducts
        .filter((p) => p.item.myca_item_id == each.id)
        //priorityOptionが指定されていたらそれを最優先で、それ以外は状態が良い（condition_option.handleの降順）でソートする
        .sort((a, b) => {
          //状態が良いもの優先
          //ここはlocalCompareを使って、降順にする
          if (a.condition_option!.handle != b.condition_option!.handle) {
            return b.condition_option!.handle!.localeCompare(
              a.condition_option!.handle!,
            );
          }

          //あとは特に決まりはないため0を返す
          return 0;
        });

      result.collectionItems.push(thisRecordInfo);
    });

    return result;
  },
);
