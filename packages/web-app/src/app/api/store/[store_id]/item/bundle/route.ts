import { BackendAPI } from '@/api/backendApi/main';
import { ItemCategoryHandle, ItemStatus } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';

import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { createBundleApi } from 'api-generator';
import { customDayjs } from 'common';

//バンドル商品マスタを登録するAPI
//売り出し前であれば編集を行うこともできる
export const POST = BackendAPI.create(
  createBundleApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let {
      // staff_account_id,
      sell_price,
      init_stock_number,
      display_name,
      expire_at, //バンドルの有効期限
      genre_id,
      image_url,
      products,
      id,
      start_at,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    if (!products.length) throw new ApiError('notEnough');

    //start_atがない時、今日の日付にする
    if (!start_at && !id) {
      const now = customDayjs();
      const today = now.tz().startOf('day');
      start_at = today.toDate();
    }

    const departmentModel = new BackendApiDepartmentService(API);

    const bundleCategoryInfo =
      await departmentModel.core.createFixedItemCategory(
        ItemCategoryHandle.BUNDLE,
      );

    //IDを指定されていた場合確認
    if (id) {
      const alreadyInfo = await API.db.item.findUniqueExists({
        where: {
          id,
          store_id,
          category: {
            handle: ItemCategoryHandle.BUNDLE,
          },
        },
      });

      if (!alreadyInfo) throw new ApiError('notExist');
    }

    console.log(start_at);

    const txResult = await API.transaction(async (tx) => {
      const createItemRes = await tx.item.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          sell_price,
          init_stock_number,
          display_name,
          image_url,
          status: ItemStatus.DRAFT,
          expire_at: expire_at ? new Date(expire_at) : null,
          start_at,
          store: {
            connect: {
              id: store_id,
            },
          },
          category: {
            connect: {
              id: bundleCategoryInfo.id,
            },
          },
          ...(genre_id && {
            genre: {
              connect: {
                id: genre_id,
                store_id,
              },
            },
          }),
          bundle_item_products: {
            create: products.map((e: any) => ({
              product_id: e.product_id,
              item_count: e.item_count,
            })),
          },
        },
        update: {
          sell_price,
          init_stock_number,
          display_name,
          image_url,
          expire_at: expire_at ? new Date(expire_at) : null,
          start_at,
          store: {
            connect: {
              id: store_id,
            },
          },
          category: {
            connect: {
              id: bundleCategoryInfo.id,
            },
          },
          ...(genre_id && {
            genre: {
              connect: {
                id: genre_id,
                store_id,
              },
            },
          }),
          //商品定義の方はやらないぞ
        },
        include: {
          bundle_item_products: true,
        },
      });

      //在庫を生成する
      const thisItem = new BackendApiItemService(API, createItemRes.id);

      if (!id) {
        const productIds = await thisItem.core.createProducts({
          needIds: true,
        });

        if (!productIds.length)
          throw new ApiError({
            status: 500,
            messageText: '正常に在庫が作成されませんでした',
          });
      }

      //更新モードだったら、在庫を作り直したりする
      else {
        await thisItem.core.bundle.edit({
          newProducts: products,
        });

        //その分、結果に足す
        createItemRes.bundle_item_products = products.map((e) => ({
          ...e,
          item_id: createItemRes.id,
        }));
      }

      //ステータスを更新する
      const itemModel = new BackendApiItemService(API, createItemRes.id);
      await itemModel.core.bundle.updateStatus({
        storeId: store_id,
        itemId: createItemRes.id,
      });

      return createItemRes;
    });

    return txResult;
  },
);
