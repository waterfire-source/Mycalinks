import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { createPurchaseTableApi, getPurchaseTableApi } from 'api-generator';

import {
  BackendExternalPythonApiService,
  PurchaseTableItemInput,
} from 'backend-core';
import { PurchaseTableOrder } from '@prisma/client';
//買取表画像作成API
export const POST = BackendAPI.create(
  createPurchaseTableApi,
  async (API, { params, body }) => {
    const {
      title,
      format,
      order,
      color,
      custom_template_image_url,
      background_text_color,
      cardname_and_price_text_color,
      show_store_name,
      show_title,
      comment,
      items,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //itemsの種類は72枚以下じゃないといけない
    if (items.length > 72)
      throw new ApiError({
        status: 400,
        messageText: `買取表画像作成時のアイテムは72種類までにしてください`,
      });

    //upsertする
    const txRes = await API.transaction(async (tx) => {
      //まずDBに入れる
      const createRes = await tx.purchase_Table.create({
        data: {
          title,
          format,
          order,
          color,
          background_text_color,
          cardname_and_price_text_color,
          custom_template_image_url,
          comment: comment ?? '',
          staff_account_id,
          store_id: params.store_id,
          show_store_name,
          items: {
            create: items.map((p, i) => ({
              order_number: i + 1,
              ...p,
            })),
          },
        },
        include: {
          items: {
            include: {
              item: {
                include: {
                  genre: true,
                },
              },
            },
          },
        },
      });

      //買取表画像を作っていく
      const formattedItems: Array<PurchaseTableItemInput> = createRes.items
        .sort((a, b) => {
          if (createRes.order === PurchaseTableOrder.CUSTOM)
            return a.order_number - b.order_number;
          if (createRes.order === PurchaseTableOrder.PRICE_ASC)
            return a.display_price - b.display_price;
          if (createRes.order === PurchaseTableOrder.PRICE_DESC)
            return b.display_price - a.display_price;
          return 0;
        })
        .map((i) => {
          let special_condition = '' as 'psa10';
          if (i.is_psa10) {
            special_condition = 'psa10' as const;
          }

          return {
            cardname: i.item.display_name ?? '',
            rarity: i.item.rarity ?? '',
            buy_price: i.display_price,
            expansion: i.item.expansion ?? '',
            cardnumber: i.item.cardnumber ?? '',
            any_model_number: i.any_model_number,
            full_image_url: i.item.image_url ?? '',
            cardgenre: i.item.genre?.handle ?? '',
            type: i.item.type,
            id: i.item_id,
            special_condition,
          };
        });

      const pythonApiClient = new BackendExternalPythonApiService();
      const res = await pythonApiClient.generatePurchaseTableImage({
        store_id: createRes.store_id,
        store_name: createRes.show_store_name
          ? API.resources.store!.display_name
          : '',
        title: show_title === false ? '' : createRes.title, // show_titleがfalseの場合は空文字列を送信
        format: createRes.format,
        color: createRes.color,
        background_text_color: createRes.background_text_color,
        cardname_and_price_text_color: createRes.cardname_and_price_text_color,
        custom_template_image_url: createRes.custom_template_image_url,
        comment: createRes.comment,
        items: formattedItems,
      });

      //ここでジェネレートできた画像を格納していく
      const updateRes = await tx.purchase_Table.update({
        where: {
          id: createRes.id,
        },
        data: {
          generated_images: {
            create: res.images,
          },
        },
        include: {
          generated_images: true,
          items: true,
        },
      });

      return updateRes;
    });

    return {
      purchaseTable: txRes,
    };
  },
);

//買取表取得
export const GET = BackendAPI.create(
  getPurchaseTableApi,
  async (API, { params, query }) => {
    const { take = 20, skip = 0, search } = query || {};

    // クエリパラメータは文字列なので数値に変換
    const takeNum = typeof take === 'string' ? parseInt(take, 10) : take;
    const skipNum = typeof skip === 'string' ? parseInt(skip, 10) : skip;

    const whereCondition: any = {
      store_id: params.store_id,
    };

    if (search && search.trim()) {
      whereCondition.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // 総件数を取得
    const totalCount = await API.db.purchase_Table.count({
      where: whereCondition,
    });

    const selectRes = await API.db.purchase_Table.findMany({
      where: whereCondition,
      include: {
        items: {
          include: {
            item: { select: { image_url: true, display_name: true } },
          },
        },
        generated_images: true,
      },
      orderBy: {
        id: 'desc',
      },
      take: takeNum,
      skip: skipNum,
    });

    return {
      purchaseTables: selectRes,
      totalCount,
    };
  },
);
