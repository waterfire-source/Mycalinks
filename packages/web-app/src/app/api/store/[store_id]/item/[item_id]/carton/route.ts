// カートンマスタを作成する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { ItemCategoryHandle } from '@prisma/client';
import { createCartonItemApi } from 'api-generator';

export const POST = BackendAPI.create(
  createCartonItemApi,
  async (API, { params, body }) => {
    const { item_id } = params;

    let { box_pack_count } = body;

    //このアイテムの情報を取得
    const thisItem = new BackendApiItemService(API, item_id);
    await thisItem.core.ifExists({
      category: {
        handle: ItemCategoryHandle.BOX,
      },
    });

    const thisItemInfo = thisItem.core.targetObject!;

    if (thisItemInfo.carton_item_id) {
      throw new ApiError({
        status: 400,
        messageText: 'この商品マスタはすでにカートンマスタが定義されています',
      });
    }

    const txResult = await API.transaction(async (tx) => {
      const cartonItem = new BackendApiItemService(API);

      const cartonItemInfo = await cartonItem.core.create({
        data: {
          display_name: `《カートン》${thisItemInfo.display_name}`,
          display_name_ruby: `《カートン》${thisItemInfo.display_name_ruby}`,
          sell_price: thisItemInfo.sell_price * box_pack_count,
          category: {
            connect: {
              id: thisItemInfo.category_id,
            },
          },
          genre: {
            connect: {
              id: thisItemInfo.genre_id!,
            },
          },
          ...(thisItemInfo.group_id
            ? {
                group: {
                  connect: {
                    id: thisItemInfo.group_id,
                  },
                },
              }
            : null),
          expansion: thisItemInfo.expansion,
          pack_name: thisItemInfo.pack_name,
          readonly_product_code: thisItemInfo.readonly_product_code,
          allow_auto_print_label: thisItemInfo.allow_auto_print_label,
          allow_round: thisItemInfo.allow_round,
          is_buy_only: thisItemInfo.is_buy_only,
          rarity: thisItemInfo.rarity,
          cardnumber: thisItemInfo.cardnumber,
          keyword: thisItemInfo.keyword,
          cardseries: thisItemInfo.cardseries,
          card_type: thisItemInfo.card_type,
          option1: thisItemInfo.option1,
          option2: thisItemInfo.option2,
          option3: thisItemInfo.option3,
          option4: thisItemInfo.option4,
          option5: thisItemInfo.option5,
          option6: thisItemInfo.option6,
          release_date: thisItemInfo.release_date,
          displaytype1: thisItemInfo.displaytype1,
          displaytype2: thisItemInfo.displaytype2,
          weight: thisItemInfo.weight, //[TODO] これもボックス数の数に乗じる？
          order_number: thisItemInfo.order_number,
          infinite_stock: thisItemInfo.infinite_stock,
          tablet_allowed: thisItemInfo.tablet_allowed,
          description: thisItemInfo.description,
          box_pack_count,
          image_url: thisItemInfo.image_url,
        },
      });

      //カートンマスタを紐づける
      const updateResult = await tx.item.update({
        where: {
          id: thisItemInfo.id,
        },
        data: {
          carton_item_id: cartonItemInfo.id,
        },
      });

      return {
        item: thisItemInfo,
        cartonItem: cartonItemInfo,
      };
    });

    return txResult;
  },
);
