import { createClientAPI, CustomError } from '@/api/implement';
import { EcAPI } from '@/api/frontend/ec/api';
import { ConditionOptionHandle } from '@prisma/client';

export type EcItem = {
  id: number;
  cardGenre: string;
  genreId: number;
  cardName: string;
  displayNameWithMeta: string;
  cardNumber: string | null;
  cardSeries: string | null;
  type: string | null;
  displayType1: string | null;
  displayType2: string | null;
  expansion: string | null;
  packItemCount: number | null;
  boxPackCount: number;
  rarity: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  option4: number | null;
  option5: string | null;
  option6: string | null;
  releaseDate: string;
  yesterdayPrice: number | null;
  price: number | null;
  sameNameId: number | null;
  kindId: number | null;
  nameGroup: number | null;
  keyword: string | null;
  idForRegulation: number | null;
  packId: number | null;
  itemPackId: number | null;
  cardPackId: number | null;
  pack: string | null;
  packGenre: string | null;
  packExpansion: string | null;
  fullImageUrl: string | null;
  weight: number;
  topPosProduct: {
    id: number;
    conditionOptionHandle: ConditionOptionHandle | null;
    actualEcSellPrice: number | null;
    ecStockNumber: number;
  };
  productCount: number;
};

export const useEcItem = () => {
  const getEcItem = async (
    request: EcAPI['getEcItem']['request'],
  ): Promise<EcItem[] | null> => {
    const clientAPI = createClientAPI();

    try {
      const res = await clientAPI.ec.getEcItem(request);
      if (res instanceof CustomError) {
        return null;
      }
      // 最も状態が良く、最も安価な商品が"topPosProduct"に選択されるように処理
      const items = res.items.map((item) => {
        // 商品情報をマッピング
        const ecItem = {
          id: item.id,
          cardGenre: item.cardgenre,
          genreId: item.genre_id,
          cardName: item.cardname,
          displayNameWithMeta: item.displayNameWithMeta,
          cardNumber: item.cardnumber,
          cardSeries: item.cardseries,
          type: item.type,
          displayType1: item.displaytype1,
          displayType2: item.displaytype2,
          expansion: item.expansion,
          packItemCount: item.pack_item_count,
          boxPackCount: item.box_pack_count,
          rarity: item.rarity,
          option1: item.option1,
          option2: item.option2,
          option3: item.option3,
          option4: item.option4,
          option5: item.option5,
          option6: item.option6,
          releaseDate: item.release_date,
          yesterdayPrice: item.yesterday_price,
          price: item.price,
          sameNameId: item.same_name_id,
          kindId: item.kind_id,
          nameGroup: item.name_group,
          keyword: item.keyword,
          idForRegulation: item.id_for_regulation,
          packId: item.pack_id,
          itemPackId: item.item_pack_id,
          cardPackId: item.cardpackid,
          pack: item.pack,
          packGenre: item.packgenre,
          packExpansion: item.packexpansion,
          fullImageUrl: item.full_image_url,
          weight: item.weight,
          topPosProduct: {
            id: item.topPosProduct.id,
            conditionOptionHandle: item.topPosProduct.condition_option_handle,
            actualEcSellPrice: item.topPosProduct.actual_ec_sell_price,
            ecStockNumber: item.topPosProduct.ec_stock_number,
          },
          productCount: item.productCount,
        };

        return ecItem;
      });
      return items;
    } catch (error) {
      console.error('Failed to fetch items:', error);

      return null;
    }
  };

  return {
    getEcItem,
  };
};
