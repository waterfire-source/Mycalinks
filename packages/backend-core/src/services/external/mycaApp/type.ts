//MycaApp
export type MycaAppUser = {
  id: number;
  display_name?: string;
  created: string;
  mail: string;
  birthday?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  prefecture?: string;
  building?: string;
  address2?: string;
  phone_number?: string;
  gender?: string;
  career?: string;
  full_name?: string;
  full_name_ruby?: string;
  device_id?: string;
};

export type MycaItem = {
  cardgenre: string; //ジャンルの名前
  genre_id: number; //ジャンルのID（Mycaデータベース上のID）
  cardname: string; //カード名
  displayNameWithMeta: string; //メタ情報付きのカード名
  cardnumber: string | null; //カード型番
  cardseries: string | null; //カードシリーズ
  type: string | null; //カードタイプ
  displaytype1: string | null;
  displaytype2: string | null;
  expansion: string | null; //エキスパンション
  pack_item_count: number | null; //パックの中に入っているこのカードの数（決まっている場合）
  box_pack_count: number; //このアイテム自体がパックだった時、ボックスの中に何個このパックがあるのかの定義
  id: number; //ID
  rarity: string | null; //レアリティ
  option1: string | null;
  option2: string | null;
  option3: string | null;
  option4: number | null;
  option5: string | null;
  option6: string | null;
  release_date: string; //発売日
  yesterday_price: number | null; //前日価格
  price: number | null; //現在相場
  same_name_id: number | null;
  kind_id: number | null;
  name_group: number | null;
  keyword: string | null; //キーワード
  id_for_regulation: number | null;
  pack_id: number | null; //パックのID（並び順？）
  item_pack_id: number | null; //このアイテムがパックだった時、そのID
  cardpackid: number | null; //パックのID（packsテーブルのID）
  pack: string | null; //パック名
  packgenre: string | null; //パックジャンル名
  packexpansion: string | null; //パックエキスパンション
  full_image_url: string | null; //画像のURL 高画質版
  weight: number; //重量
  fixed_price: number | null; //定価
};

export type MycaAppGenre = {
  id: number;
  number: number;
  name: string;
  top_image_url: string;
  single_genre_image: string;
  image: string;
  display_name: string;
  deck_available_version: number;
};

export type MycaAppGenreTotalItemCount = {
  id: number;
  name: string;
  total_item_count: number;
};

//特に使わないものはany
export type ServerConstants = {
  GenreList: Array<{
    label: string; //handleに相当
    init: string;
    genre: number; //ジャンルのIDに相当
    itemImageInit: string;
    packImageInit: string;
    middleMenu: any;
    searchType: Array<{
      type: 'カード' | 'ボックス';
      searchElements: Array<{
        label: string;
        columnOnItems: string;
        matchPolicy: 'partial' | 'perfect';
        inputType: 'picker' | 'text';
      }>;
    }>;
  }>;
};

export type MycaDeckItemDetail = {
  id: number; //デッキID
  items: Array<
    MycaItem & {
      id: number;
      item_count: number;
      regulation_group: number;
      regulation_group_name: string;
      option_for_deck: string;
      ml_deck_order: number;
    }
  >;
  detailData: Array<{
    id_for_deck: number;
    item_count: number;
    regulation_group: number;
    regulation_group_name: string;
    option_for_deck: string;
    ml_deck_order: number;
    items: Array<
      MycaItem & {
        id_for_deck: number;
        item_count: number;
      }
    >;
  }>;
};

/**
 * 相場価格変動履歴
 */
export type MycaItemMarketPriceUpdateHistory = {
  id: number;
  uploaded_at: Date;
  data_count: number;
};
