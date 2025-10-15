import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//特定のアイテム（パック）の中身を取得する
//もちろんパックとして登録されているアイテムじゃないとうまく実行できない
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef); //左にcheckField統合する？

    const { store_id, item_id: id } = API.params;

    let displaytypeQuery: Record<string, string> = {};

    if (API.query?.isPack == 'true') {
      displaytypeQuery = { displaytype1: '%ボックス%' };
    } else if (API.query?.isPack == 'false') {
      displaytypeQuery = { displaytype1: '%カード%' };
    }

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    let result: any = {};

    //そもそも存在するのか、パックかどうかを調べる
    const findResult = await API.db.item.findUniqueExists({
      where: {
        id: parseInt(id),
        store_id: parseInt(store_id),
      },
      select: {
        id: true,
        myca_pack_id: true,
      },
    });

    if (!findResult)
      //そもそも商品マスタが存在しないとき
      throw new ApiError({
        status: 404,
        messageText: '指定された商品マスタが存在しません',
      });

    if (!findResult.myca_pack_id)
      //パックとして登録されていないとき
      throw new ApiError({
        status: 400,
        messageText: '指定された商品マスタはパックに紐づいていません',
      });

    //このパックIDを使って中の商品情報を取得する
    const mycaAppClient = new BackendApiMycaAppService(API);

    const packItems = await mycaAppClient.core.item.getAllDetail(
      {
        pack: findResult.myca_pack_id,
        ...displaytypeQuery,
      },
      {
        detail: 1,
      },
    );

    //商品マスタがすでに店に登録されているか確認
    const existItems = await API.db.item.findMany({
      where: {
        store_id: parseInt(store_id),
        myca_item_id: {
          in: packItems.map((e) => e.id),
        },
      },
    });

    const adjustedPackItems = await Promise.all(
      packItems.map(async (eachItem) => {
        const existsPosItem = existItems.find(
          (e) => e.myca_item_id == eachItem.id,
        );

        const productModel = new BackendApiProductService(API);
        const displayNameWithMeta = productModel.core.getProductNameWithMeta({
          specialty: null,
          management_number: null,
          display_name: eachItem.cardname,
          item: {
            rarity: eachItem.rarity,
            cardnumber: eachItem.cardnumber,
            expansion: eachItem.expansion,
          },
        });

        return {
          pos_item_id: existsPosItem?.id,
          pos_item_products_stock_number: existsPosItem?.products_stock_number,
          myca_item_id: eachItem.id,
          image_url: eachItem.full_image_url,
          genre_name: eachItem.cardgenre,
          display_name: eachItem.cardname,
          displayNameWithMeta,
          cardnumber: eachItem.cardnumber,
          cardseries: eachItem.cardseries,
          expansion: eachItem.expansion,
          rarity: eachItem.rarity,
          myca_pack_id: eachItem.cardpackid,
          pack_item_count: eachItem.pack_item_count ?? null,
        };
      }),
    );

    result = {
      itemsInPack: adjustedPackItems,
    };

    return API.status(200).response({ data: result });
  },
);
