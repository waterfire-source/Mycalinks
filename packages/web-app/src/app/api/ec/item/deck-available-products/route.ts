//デッキで利用可能な、購入可能なproductsを返すAPI

import { BackendAPI } from '@/api/backendApi/main';
import { ConditionOptionHandle, Prisma } from '@prisma/client';
import {
  DeckAvailableProductsPriorityOption,
  getEcDeckAvailableProductsDef,
} from '@/app/api/ec/def';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { getEcDeckAvailableProductsApi } from 'api-generator';
import { BackendApiEcShippingService } from '@/api/backendApi/services/ec/shipping/main';
import { ecConstants } from 'common';

//EC在庫取得API
export const GET = BackendAPI.create(
  getEcDeckAvailableProductsApi,
  async (API, { query }) => {
    const whereInput: Array<Prisma.ProductWhereInput> = [];

    if (!query.deckId && !query.code)
      throw new ApiError({
        status: 400,
        messageText: 'deckIdかcodeが必要です',
      });

    const priorityOption = query.priorityOption;

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'conditionOption':
          if (!value) break;
          whereInput.push({
            condition_option: {
              handle: {
                in: (value as string).split(',') as ConditionOptionHandle[],
              },
            },
          });
          break;
      }
    }

    const mycaAppService = new BackendApiMycaAppService(API);

    const deckAvailableMycaItems =
      await mycaAppService.core.deck.availableItemIds({
        deckId: query.deckId,
        code: query.code,
        anyRarity: query.anyRarity,
        anyCardnumber: query.anyCardnumber,
      });

    const allMycaItemIds = new Set(
      deckAvailableMycaItems.flatMap((e) => e.availableItems.map((e) => e.id)),
    );

    //一旦全てのProductを取得しちゃう
    const allAvailableProducts = await API.db.product.findMany({
      where: {
        AND: whereInput,
        mycalinks_ec_enabled: true,
        store: {
          mycalinks_ec_enabled: true,
        },
        item: {
          myca_item_id: {
            in: Array.from(allMycaItemIds),
          },
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
                enable_same_day_shipping: true,
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
    const result: typeof getEcDeckAvailableProductsDef.response = {
      deckItems: [],
    };

    deckAvailableMycaItems.forEach((each) => {
      const availableMycaItemIds = each.availableItems.map((e) => e.id);

      const needItemCount = each.originalItem.item_count;
      let remainNeedCount: number = needItemCount;

      const thisRecordInfo: (typeof getEcDeckAvailableProductsDef.response)['deckItems'][number] =
        {
          mycaItem: each.originalItem,
          needItemCount,
          availableMycaItems: each.availableItems,
          availableProducts: [],
        };

      //availableProductsの中から探す
      allAvailableProducts
        .filter((p) => {
          //条件が一致するか
          if (!availableMycaItemIds.includes(p.item.myca_item_id!))
            return false;
          return true;
        })
        //priorityOptionが指定されていたらそれを最優先で、それ以外は状態が良い（condition_option.handleの降順）でソートする
        .sort((a, b) => {
          if (
            priorityOption == DeckAvailableProductsPriorityOption.COST &&
            a.actual_ec_sell_price! != b.actual_ec_sell_price!
          ) {
            return a.actual_ec_sell_price! - b.actual_ec_sell_price!;
          }
          if (
            priorityOption == DeckAvailableProductsPriorityOption.SHIPPING_DAYS
          ) {
            //発送までの日数を計算する
            const shippingDays = new BackendApiEcShippingService(API);
            const shippingDaysA = shippingDays.core.getShippingDays({
              enable_same_day_shipping:
                a.store.ec_setting?.enable_same_day_shipping ?? false,
              same_day_limit_hour:
                a.store.ec_setting?.same_day_limit_hour ?? null,
              shipping_days: a.store.ec_setting?.shipping_days ?? null,
              closed_day: a.store.ec_setting?.closed_day ?? '',
            });
            const shippingDaysB = shippingDays.core.getShippingDays({
              enable_same_day_shipping:
                b.store.ec_setting?.enable_same_day_shipping ?? false,
              same_day_limit_hour:
                b.store.ec_setting?.same_day_limit_hour ?? null,
              shipping_days: b.store.ec_setting?.shipping_days ?? null,
              closed_day: b.store.ec_setting?.closed_day ?? '',
            });

            //どちらかが-1だったら計算できないため次に進む
            if (shippingDaysA != -1 && shippingDaysB != -1) {
              //同じ日数だったら次に進む
              if (shippingDaysA != shippingDaysB) {
                return shippingDaysA - shippingDaysB;
              }
            }
          }

          //状態が良いもの優先
          //ここはlocalCompareを使って、降順にする
          if (a.condition_option!.handle != b.condition_option!.handle) {
            return b.condition_option!.handle!.localeCompare(
              a.condition_option!.handle!,
            );
          }

          //あとは特に決まりはないため0を返す
          return 0;
        })

        //それぞれのproductを候補として入れていく
        .forEach((p) => {
          //remainNeedCountが0以下になってたら終了
          if (remainNeedCount <= 0) return;

          //先頭のproductの情報を確認
          remainNeedCount -= p.ec_stock_number;

          //@ts-expect-error becuase of because of
          thisRecordInfo.availableProducts.push(p);
        });

      result.deckItems.push(thisRecordInfo);
    });

    return result;
  },
);
