//この商品マスタがパックとして定義されていた時、そのパックを内包しているボックス商品がなんなのかなどを取得する
// パック商品マスタのボックス情報を取得

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ItemCategoryHandle } from '@prisma/client';
import { getPackItemBoxDefApi } from 'api-generator';

export const GET = BackendAPI.create(
  getPackItemBoxDefApi,
  async (API, { params }) => {
    const { store_id, item_id } = params;

    //この商品マスタの情報を取得していく
    const thisItemInfo = await API.db.item.findUniqueExists({
      where: {
        id: item_id,
        store_id: store_id,
      },
      include: {
        category: true,
      },
    });

    if (!thisItemInfo) throw new ApiError('notExist');
    //myca_item_idがnullだったらエラー
    if (!thisItemInfo.myca_item_id)
      throw new ApiError({
        status: 400,
        messageText: 'この商品マスタはmycaアイテムに結び付けられていません',
      });

    //ボックスじゃなかったらエラー
    if (
      thisItemInfo.category.handle !== ItemCategoryHandle.BOX ||
      !thisItemInfo.myca_pack_id
    )
      throw new ApiError({
        status: 400,
        messageText: 'この商品マスタはボックスではありません',
      });

    //このアイテムをボックスの内包カード定義として持っているボックスを探す
    const mycaAppClient = new BackendApiMycaAppService(API);

    const packs = await mycaAppClient.core.item.getBoxPackDef({
      myca_item_id: thisItemInfo.myca_item_id,
    });

    //取得できた中から、念の為この商品マスタは除く
    let targetPacks = packs.filter(
      (pack) => pack.item_id !== thisItemInfo.myca_item_id,
    );

    //定義が1つよりあったらis_primary=trueのもののみ取得
    if (targetPacks.length > 1) {
      targetPacks = targetPacks.filter((pack) => pack.is_primary);
    }

    if (!targetPacks.length)
      throw new ApiError({
        status: 400,
        messageText: `この商品マスタに紐づいているボックス情報が見つかりませんでした`,
      });

    //すでにPOSに登録されているものを取得するのと、アイテム情報を取得する
    const [posItems, mycaItems] = await Promise.all([
      API.db.item.findManyExists({
        where: {
          store_id: store_id,
          myca_item_id: {
            in: targetPacks.map((pack) => pack.item_id),
          },
        },
      }),
      mycaAppClient.core.item.getAllDetail(
        {
          id: targetPacks.map((pack) => pack.item_id),
        },
        {
          detail: 1,
        },
      ),
    ]);

    const boxItems = targetPacks.map((pack) => {
      const posItem = posItems.find(
        (item) => item.myca_item_id === pack.item_id,
      );
      const mycaItemInfo = mycaItems.find((item) => item.id === pack.item_id);

      if (!posItem || !mycaItemInfo)
        throw new ApiError({
          status: 500,
          messageText: `商品マスタの情報が取得できませんでした`,
        });

      const productModel = new BackendApiProductService(API);
      const displayNameWithMeta = productModel.core.getProductNameWithMeta({
        specialty: null,
        management_number: null,
        display_name: mycaItemInfo.cardname,
        item: {
          rarity: mycaItemInfo.rarity,
          cardnumber: mycaItemInfo.cardnumber,
          expansion: mycaItemInfo.expansion,
        },
      });

      return {
        pos_item_info: posItem,
        myca_item_id: mycaItemInfo.id,
        image_url: mycaItemInfo.full_image_url,
        genre_name: mycaItemInfo.cardgenre,
        display_name: mycaItemInfo.cardname,
        cardnumber: mycaItemInfo.cardnumber,
        cardseries: mycaItemInfo.cardseries,
        expansion: mycaItemInfo.expansion,
        rarity: mycaItemInfo.rarity,
        myca_pack_id: mycaItemInfo.cardpackid,
        pack_item_count: mycaItemInfo.pack_item_count,
        displayNameWithMeta,
      };
    });

    return {
      boxItems,
    };
  },
);
