import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Item } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//Mycaアプリのアイテムの情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const { currentPage, itemsPerPage } = API.query;

    const propsQuery: Record<string, unknown> = {};
    const pagesQuery = {
      cur: parseInt(currentPage) || 1,
      per: parseInt(itemsPerPage) || 100,
    };

    const fieldsQuery = {
      detail: 1,
    };

    let excludesCompletedPack = false;

    await Promise.all(
      Object.entries(API.query).map(async ([prop, value]: any) => {
        if (!value) return false;

        switch (prop) {
          case 'id': //ID直指定
          case 'pack': //パックID直指定
          case 'genre': //ジャンルID直指定
            propsQuery[prop] = parseInt(value);

            break;

          case 'name': //名前
          case 'expansion': //エキスパンション
          case 'rarity': //レアリティ
          case 'cardnumber': //カード型番
            propsQuery[prop] = `%${value}%`; //部分一致にするため

            break;

          case 'isPack': //パックだけ取得だったら
            propsQuery.is_item_as_pack = 1;
            break;

          case 'excludesCompletedPack': //中が全て揃っているパックは除外
            excludesCompletedPack = true;
            break;

          case 'itemType':
            propsQuery.displaytype1 = `%${value}%`;
            break;
        }
      }),
    );

    //取得する
    const mycaAppModel = new BackendApiMycaAppService(API);
    const mycaItems = await mycaAppModel.core.item.getAllDetail(
      propsQuery,
      fieldsQuery,
      pagesQuery,
    );

    let resultItems: Array<
      mycaItem & {
        pos_item_id?: Item['id']; //POS上にすでに登録されていたらそのID
      }
    > = mycaItems;

    //商品マスタとして登録されているか確認
    if (resultItems.length) {
      const posItems = await API.db.item.findMany({
        where: {
          store_id: parseInt(store_id),
          myca_item_id: {
            in: resultItems.map((e) => e.id),
          },
        },
        select: {
          id: true,
          myca_item_id: true,
        },
      });

      //パックから取得だったら中身を全て取得する
      if (excludesCompletedPack) {
        const packDefs = await Promise.all(
          resultItems.map(async (item) => {
            if (!item.item_pack_id) return null;

            const packItemInfo = await mycaAppModel.core.item.getAllDetail(
              {
                pack: item.item_pack_id,
              },
              {
                detail: 1,
              },
            );

            //全て登録されているか確認する
            const registered = await API.db.item.count({
              where: {
                store_id: Number(store_id),
                myca_item_id: {
                  in: packItemInfo.map((e) => e.id),
                },
              },
            });

            //全て揃ってたらnullを返す
            return registered === packItemInfo.length ? null : item;
          }),
        );

        resultItems = packDefs.filter((e) => e !== null);
      }

      resultItems = resultItems.map((item) => {
        //商品マスタがすでに存在するか確認
        const posItemId = posItems.find((e) => e.myca_item_id == item.id)?.id;
        const productModel = new BackendApiProductService(API);
        const displayNameWithMeta = productModel.core.getProductNameWithMeta({
          specialty: null,
          management_number: null,
          display_name: item.cardname,
          item: {
            rarity: item.rarity,
            cardnumber: item.cardnumber,
            expansion: item.expansion,
          },
        });

        return {
          ...item,
          pos_item_id: posItemId,
          displayNameWithMeta,
        };
      });
    }

    return API.status(200).response({
      data: {
        items: resultItems,
      },
    });
  },
);
