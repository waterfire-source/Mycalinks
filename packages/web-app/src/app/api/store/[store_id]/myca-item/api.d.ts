import { Store, Item } from '@prisma/client';

//Mycaのitemの型
export type mycaItem = {
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
  cardpackid: number | null; //パックのID（文字列）
  pack: string | null; //パック名
  packgenre: string | null; //パックジャンル名
  packexpansion: string | null; //パックエキスパンション
  full_image_url: string | null; //画像のURL 高画質版
  weight: number; //重量
};

export type BackendMycaItemAPI = [
  //Mycalinksアプリのアイテムを取得するためのAPI
  //そのストアにすでに商品マスタとして登録されているかどうかも確認できる
  {
    path: '/api/store/{store_id}/myca-item/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: mycaItem['id']; //Mycaのitem_id指定
        pack?: mycaItem['pack_id']; //MycaのパックID指定
        genre?: mycaItem['genre_id']; //MycaのジャンルID指定
        name?: string; //名前検索 キーワードなども考慮される
        expansion?: string; //エキスパンション検索
        rarity?: string; //レアリティ検索
        cardnumber?: string; //カード型番検索
        isPack?: true; //パックとして登録されているアイテムだけを取得したい時にtrueを指定する
        excludesCompletedPack?: true; //中が全て揃っているパックは除外
        itemType?: 'ボックス' | 'カード';

        currentPage?: number; //現在のページ数 特に指定しなかったら1となる
        itemsPerPage?: number; //1ページあたりのアイテム数 特に指定しなかったら100となる
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        items: Array<
          mycaItem & {
            pos_item_id?: Item['id']; //POS上にすでに登録されていたらそのID
            displayNameWithMeta: string; //メタ情報付き
          }
        >;
      };
    };
  },
];
