import { BackendCoreError } from '@/error/main';
import {
  MycaAppGenre,
  MycaItem,
  MycaAppGenreTotalItemCount,
  ServerConstants,
  MycaAppUser,
  MycaDeckItemDetail,
  MycaItemMarketPriceUpdateHistory,
} from '@/services/external/mycaApp/type';
import { Item, ItemCategoryHandle } from '@prisma/client';
import { AddressUtil } from 'common';
//MycaApp関連のユーティリティ
//どちらかというとモデルっぽいからディレクトリ変えるかもしれない

//アプリの方の定数を保持させる
declare const globalThis: {
  appConstants: ServerConstants;
} & typeof global;

/**
 * Mycaアプリへのリクエスト
 */
export class BackendExternalMycaAppService {
  public config = {
    apiUrl: process.env.NEXT_PUBLIC_MYCA_APP_API_URL || '',
    // apiUrl: 'http://localhost:3010',
    adminToken: process.env.MYCA_ADMIN_TOKEN || '',
    fixed: {
      card: 'カード',
      box: 'ボックス',
    },
  };

  constructor() {}

  /**
   * テンプレートの名前、バージョン、変数、データをパースする関数
   * @param fileKind - クライアントからアップロードされたファイルの、BackendAPI上でのハンドル名、通常 'file'
   * @returns - パースした情報
   */
  private runMycaAPI = async (method: string, url: string, data?: any) => {
    const options: RequestInit = {
      headers: {
        MycaAdminToken: this.config.adminToken,
        'Content-Type': 'application/json',
      },
      method,
    };

    if (data && method != 'GET') {
      options.body = JSON.stringify(data);
    }

    let result: any = await fetch(`${this.config.apiUrl}${url}`, {
      ...options,
      cache: 'no-store',
    });

    result = await result.json();

    return result;
  };

  //アプリのサーバー定数を取得
  public getConstants = async () => {
    if (globalThis.appConstants) return globalThis.appConstants;

    const version = process.env.NEXT_PUBLIC_MYCA_APP_VERSION || '';
    const queryParams = new URLSearchParams({ version });

    const res = await this.runMycaAPI(
      'GET',
      `/setting/constant/?${queryParams}`,
    );

    globalThis.appConstants = res;

    return globalThis.appConstants;
  };

  //モデルたち
  public user = {
    getInfo: async (props: { user: number }): Promise<MycaAppUser | null> => {
      let queryParams: any = props;
      queryParams = new URLSearchParams(queryParams);

      let result: MycaAppUser;

      const customerInfo: any = await this.runMycaAPI(
        'GET',
        `/user/account/?${queryParams}`,
      );

      //MycaAppの方では誕生日などをまだ登録できるようになっていないため、モックデータ
      if (customerInfo.created) {
        result = {
          ...customerInfo,
          id: props.user,
        };

        return result;
      } else {
        return null;
      }
    },
    getUserDeviceIds: async (
      mycaUserIds: Array<MycaAppUser['id']>,
    ): Promise<
      Array<{
        id: MycaAppUser['id'];
        device_id: MycaAppUser['device_id'];
      }>
    > => {
      const res = await this.runMycaAPI(
        'POST',
        `/admin/user/get-notification-info/`,
        {
          userIds: mycaUserIds,
        },
      );

      return res;
    },
    getUserFullAddress: (userInfo: MycaAppUser) => {
      const addressUtil = new AddressUtil({
        zipCode: userInfo.zip_code || '',
        prefecture: userInfo.prefecture || '',
        city: userInfo.city || '',
        address2: userInfo.address2 || '',
        building: userInfo.building || '',
        fullName: userInfo.full_name || '',
        fullNameRuby: userInfo.full_name_ruby || '',
        phoneNumber: userInfo.phone_number || '',
      });

      return addressUtil.toString();
    },
    getUserFullAddressInfo: (userInfo: MycaAppUser) => {
      const addressUtil = new AddressUtil({
        zipCode: userInfo.zip_code || '',
        prefecture: userInfo.prefecture || '',
        city: userInfo.city || '',
        address2: userInfo.address2 || '',
        building: userInfo.building || '',
        fullName: userInfo.full_name || '',
        fullNameRuby: userInfo.full_name_ruby || '',
        phoneNumber: userInfo.phone_number || '',
      });

      return addressUtil.info;
    },
  };

  //アイテム関連
  public item = {
    //アイテムの詳細情報を取得する（パック取得もここに含まれる）
    getAllDetail: async (
      props: any,
      fields?: any,
      pages?: any,
      order: any = {},
    ): Promise<Array<MycaItem>> => {
      const res = await this.runMycaAPI('POST', `/item/detail/`, {
        props,
        fields,
        pages,
        order,
      });

      const arr = res.data as Array<MycaItem>;

      const result = arr.filter((item) => {
        //PSAは除く
        if (item.displaytype1?.includes('PSA')) return false;

        return true;
      });

      return result;
    },
    getItemImage: async (props: any): Promise<string> => {
      let queryParams: any = props;
      queryParams = new URLSearchParams(queryParams);

      try {
        const res = await this.runMycaAPI('GET', `/item/image/?${queryParams}`);
        return res.url || '';
      } catch {
        return '';
      }
    },
    //ジャンルを取得
    getGenres: async (): Promise<Array<MycaAppGenre>> => {
      const version = process.env.NEXT_PUBLIC_MYCA_APP_VERSION || '';
      const queryParams = new URLSearchParams({ version });

      const res = await this.runMycaAPI('GET', `/item/genre/?${queryParams}`);
      return res;
    },
    //ジャンル別のアイテム登録数を取得
    getGenreTotalItemCount: async (): Promise<
      Array<MycaAppGenreTotalItemCount>
    > => {
      const res = await this.runMycaAPI('GET', `/item/genre/total-item-count/`);
      return res;
    },
    //ボックス・パック定義アイテムを取得する
    getBoxPackDef: async ({
      myca_item_id,
    }: {
      myca_item_id: MycaItem['id'];
    }): Promise<
      Array<{
        item_id: number;
        is_primary: boolean;
      }>
    > => {
      const queryParams = new URLSearchParams({
        item_id: String(myca_item_id),
      });

      const res = await this.runMycaAPI(
        'GET',
        `/item/detail/pack-def/?${queryParams}`,
      );

      const result = res.map((each) => ({
        item_id: each.item_id,
        is_primary: Boolean(each.is_primary),
      }));

      return result;
    },
    toPosColumn: (appColumn: keyof MycaItem) => {
      const dict = {
        cardnumber: 'cardnumber',
        cardseries: 'cardseries',
        type: 'card_type',
        displaytype1: 'displaytype1',
        displaytype2: 'displaytype2',
        rarity: 'rarity',
        pack: 'pack_name',
        cardpackid: 'myca_primary_pack_id',
        expansion: 'expansion',
        keyword: 'keyword',
        option1: 'option1',
        option2: 'option2',
        option3: 'option3',
        option4: 'option4',
        option5: 'option5',
        option6: 'option6',
        release_date: 'release_date',
      };

      return dict[appColumn] as keyof Item;
    },

    //商品マスタのメタ情報を表示するときに必要
    getItemMetaDef: async (
      genreHandle: string, //ジャンルのハンドル（Item_Genre.handle）
      categoryHandle: ItemCategoryHandle,
    ) => {
      //このジャンルでこのカテゴリのメタ情報が存在するか確認
      const constants = await this.getConstants();

      const categoryDict = {
        CARD: 'カード',
        BOX: 'ボックス',
      };

      const thisMetaInfo =
        constants.GenreList?.find((e) => e.label == genreHandle)
          ?.searchType?.find(
            (e) => e.type == categoryDict[categoryHandle as 'CARD' | 'BOX'],
          )
          ?.searchElements.filter((e) => e.inputType == 'picker')

          //ここでは部分一致や完全一致は問わない
          .map((e) => ({
            columnOnPosItem: this.item.toPosColumn(
              e.columnOnItems as keyof MycaItem,
            ),
            label: e.label,
          })) || [];

      return thisMetaInfo;
    },

    //相場価格の更新履歴を取得
    getMarketPriceUpdateHistory: async (): Promise<
      Array<MycaItemMarketPriceUpdateHistory>
    > => {
      const res = await this.runMycaAPI('GET', `/item/price/recent-update/`);
      return res.recentUpdates ?? [];
    },

    //findOptionとかの件
    getFindOptions: async ({
      genreId,
      kindLabel,
      itemType,
    }: {
      genreId: MycaAppGenre['id'];
      kindLabel: string;
      itemType: 'card' | 'box';
    }) => {
      const queryParams = new URLSearchParams({
        genre: String(genreId),
        kind_label: kindLabel,
        item_type: itemType,
      });

      const res = await this.runMycaAPI('GET', `/item/option/?${queryParams}`);

      if (!res[0]) return null;

      const result_array = {
        label: kindLabel,
        columnOnItems: res[0].kind,
        matchPolicy: res[0].match_policy,
        options: res.map((option: any) => ({
          name: option.option_label,
          value: option.option_value,
          kind: option.kind,
        })) as Array<{
          name: string;
          value: string;
          kind: string;
        }>,
      };

      return result_array;
    },
  };

  //デッキ関連
  public deck = {
    /**
     * 条件を絞って、デッキを揃える時に使えるmycaItemを洗い出す
     */
    availableItemIds: async ({
      deckId, //デッキID
      code, //ポケカ公式ID どちらかは必ず必要
      anyRarity,
      anyCardnumber,
    }: {
      deckId?: number;
      code?: string;
      anyRarity: boolean; //レアリティ問わず
      anyCardnumber: boolean; //型番問わず
    }) => {
      if (!deckId && !code)
        throw new BackendCoreError({
          internalMessage: 'deckIdかcodeが必要です',
          externalMessage: 'サーバーエラー',
        });

      const { detailData: deckDef } = await this.deck.getDeckItems({
        deck: deckId,
        code,
        creator: !deckId ? 0 : undefined,
      });

      //必要なmycaItem情報を取得していく
      let result: Array<{
        originalItem: MycaItem & { item_count: number };
        availableItems: Array<MycaItem & { item_count: number }>; //ここにはoriginalも含まれる
      }> = [];

      deckDef.forEach((each) => {
        const originalItem = each.items.find(
          (item) => item.id_for_deck == each.id_for_deck,
        );

        if (!originalItem)
          throw new BackendCoreError({
            internalMessage: 'originalItemが見つかりませんでした',
            externalMessage: 'サーバーエラー',
          });

        //レアリティ問わずとかの件
        const availableItems = each.items.filter((item) => {
          if (!anyRarity) {
            if (item.rarity != originalItem.rarity) return false;
          }

          if (!anyCardnumber) {
            if (item.cardnumber != originalItem.cardnumber) return false;
          }

          return true;
        });

        result.push({
          originalItem,
          availableItems,
        });
      });

      return result;
    },

    //デッキの詳細情報を取得する
    getDeckItems: async (props: {
      deck?: number; //デッキID
      creator?: number; //デッキの作成者
      code?: string; //デッキのコード
    }): Promise<MycaDeckItemDetail> => {
      //userがないと所有数情報は返されなくなる

      let result = (await this.runMycaAPI(
        'GET',
        `/item/deck/items/?${QueryParamBuilder.build({
          props: { id: props.deck, creator: props.creator, code: props.code },
        })}`,
      )) as
        | Array<{
            id_for_deck: number;
            kind_id: number;
            item_count: number;
            regulation_group: number;
            regulation_group_name: string;
            option_for_deck: string;
            ml_deck_order: number;
          }>
        | {
            items: Array<{
              item: number;
              item_count: number;
              option_for_deck: string;
              regulation_group: number;
              regulation_group_name: string;
              kind_id: number;
              same_name_id: number;
              ml_deck_order: number;
              genre: number;
            }>;
          };

      let ResultData: any = {};

      //ここでポケカ公式の場合、getDeckのような取得の仕方にする
      if (
        props.code &&
        !props.deck &&
        props.creator == 0 &&
        result instanceof Array
      ) {
        const getItemInfoPromises = result.map(async (Candidate) => {
          let items: Array<MycaItem> = [];

          const { kind_id, id_for_deck } = Candidate;
          const genre = 1;

          //kind_idがなかったらこのカードだけの情報を取得する
          if (kind_id) {
            items = await this.item.getAllDetail(
              { genre, kind_id },
              { detail: 1, includes_none: 1 },
              {},
              { column: 'deck_order', mode: 'DESC' },
            );
          } else {
            items = await this.item.getAllDetail(
              { genre, id_for_deck },
              { detail: 1, includes_none: 1 },
              {},
              { column: 'deck_order', mode: 'DESC' },
            );
          }

          return {
            id_for_deck: Candidate.id_for_deck,
            item_count: Candidate.item_count,
            regulation_group: Candidate.regulation_group,
            regulation_group_name: Candidate.regulation_group_name,
            option_for_deck: Candidate.option_for_deck,
            ml_deck_order: Candidate.ml_deck_order,
            items,
          };
        });

        //kind_idなどの情報まで含めた詳細なデータはdetailDataに格納するようにする
        ResultData.detailData = await Promise.all(getItemInfoPromises);

        //並び替える
        ResultData.detailData = await this.deck.rearrangeDeckItems(
          ResultData.detailData,
        );

        ResultData.items = ResultData.detailData.map((each) => {
          const thisItem = each.items.find(
            (item) => item.id_for_deck == each.id_for_deck,
          );
          thisItem.item_count = each.item_count;
          thisItem.option_for_deck = each.option_for_deck;
          thisItem.ml_deck_order = each.ml_deck_order;

          return thisItem;
        });

        return ResultData;
      } else {
        //@ts-expect-error becuase of because of  気にしない
        if (!('items' in result)) return;
        const allItems = result.items.length
          ? await this.item.getAllDetail(
              {
                genre: result.items[0]?.genre,
                kind_id: result.items.map((e) => e.kind_id),
              },
              { detail: 1, includes_none: 1 },
              {},
              { column: 'deck_order', mode: 'DESC' },
            )
          : [];

        //kind_idがないものはidベースで探す
        const noKindIdItems = result.items.filter((e) => !e.kind_id);

        if (noKindIdItems.length) {
          const additionalItems = await this.item.getAllDetail(
            {
              id: noKindIdItems.map((e) => e.item),
            },
            { detail: 1, includes_none: 1 },
            {},
            { column: 'deck_order', mode: 'DESC' },
          );

          allItems.push(...additionalItems);
        }

        const getItemInfoPromises = result.items.map(async (Candidate) => {
          let items: Array<MycaItem> = [];

          const { kind_id, item } = Candidate;

          if (item == 0) {
            //IDが0だったら、からのものを返す

            return {
              id_for_deck: Candidate.item,
              item_count: Candidate.item_count,
              regulation_group: Candidate.regulation_group,
              regulation_group_name: Candidate.regulation_group_name,
              option_for_deck: Candidate.option_for_deck,
              ml_deck_order: Candidate.ml_deck_order,
              items: [{ id_for_deck: Candidate.item }],
            };
          }

          //kind_idがなかったらこのカードだけの情報を取得する
          if (kind_id) {
            items = allItems.filter((e) => e.kind_id == kind_id);
          } else {
            items = allItems.filter((e) => e.id == item);
          }

          //すでに登録されているid_for_deckをidで上書きする
          items = items.map((item) =>
            Object.assign(item, { id_for_deck: item.id }),
          );

          return {
            //Mycaデッキの方ではid_for_deckはitems.idに値する
            id_for_deck: Candidate.item,
            item_count: Candidate.item_count,
            regulation_group: Candidate.regulation_group,
            regulation_group_name: Candidate.regulation_group_name,
            option_for_deck: Candidate.option_for_deck,
            ml_deck_order: Candidate.ml_deck_order,
            items,
          };
        });

        //kind_idなどの情報まで含めた詳細なデータはdetailDataに格納するようにする
        ResultData.detailData = await Promise.all(getItemInfoPromises);

        //並び替える
        ResultData.detailData = await this.deck.rearrangeDeckItems(
          ResultData.detailData,
        );

        ResultData.items = ResultData.detailData.map((each) => {
          const thisItem = each.items.find(
            (item) => item.id_for_deck == each.id_for_deck,
          );
          thisItem.id = thisItem.id || each.id_for_deck;
          thisItem.item_count = each.item_count;
          thisItem.regulation_group = each.regulation_group;
          thisItem.regulation_group_name = each.regulation_group_name;
          thisItem.option_for_deck = each.option_for_deck;
          thisItem.ml_deck_order = each.ml_deck_order;

          return thisItem;
        });

        return ResultData as MycaDeckItemDetail;
      }
    },
    //デッキを適切な順番に並び替える関数
    rearrangeDeckItems: async (
      deckItems: any,
      OrderSetting?: any,
      isDetail?: any,
    ) => {
      //並び替えのためには基本的にregulation_groupとoption_for_deckとml_deck_orderが必要
      let _deckItems = [...deckItems];
      const constants = await this.getConstants();

      //@ts-expect-error becuase of because of  気にしない
      const fixedOptionList = constants.deckFixedProperty;

      _deckItems = _deckItems.sort((a, b) => {
        if (isDetail) {
          a = a.items.find((subItem) => subItem.id_for_deck == a.id_for_deck);
          b = b.items.find((subItem) => subItem.id_for_deck == b.id_for_deck);
        }

        //リーダー系のカードは優先的に表示させる
        if (
          fixedOptionList.includes(a.option_for_deck || '') &&
          !fixedOptionList.includes(b.option_for_deck || '')
        )
          return -1;
        if (
          !fixedOptionList.includes(a.option_for_deck || '') &&
          fixedOptionList.includes(b.option_for_deck || '')
        )
          return 1;

        //並び替え設定があるならそれを尊重する
        if (OrderSetting) {
          if (b[OrderSetting.column] != a[OrderSetting.column]) {
            return OrderSetting.mode == 'DESC'
              ? b[OrderSetting.column] - a[OrderSetting.column]
              : a[OrderSetting.column] - b[OrderSetting.column];
          }
        }

        //次にregulation_group順に表示する
        if (a.regulation_group > b.regulation_group) return 1;
        if (a.regulation_group < b.regulation_group) return -1;

        //次に、ml_deck_order順に表示する こちらは降順
        if (a.ml_deck_order > b.ml_deck_order) return -1;
        if (a.ml_deck_order < b.ml_deck_order) return 1;

        return 0;
      });

      return [..._deckItems];
    },
  };

  /**
   * コレクション
   */
  public collection = {
    //指定されたコレクションの中のカードを取得する
    getCollectionItems: async (props: { collection: number }) => {
      //userがないと所有数情報は返されなくなる

      const collectionInfo = (await this.runMycaAPI(
        'GET',
        `/item/collection/items/?${QueryParamBuilder.build({
          props: { id: props.collection },
        })}`,
      )) as {
        id: number; //コレクションのID = コレクションコード
        this_version: number; //指定されているバージョン
        latest_version: number; //このコレクションの最新バージョン（バージョンの更新ができますみたいなやつの表示用）
        items: number[];
      };

      //中のアイテム情報を取得
      const result = {
        id: collectionInfo.id,
        this_version: collectionInfo.this_version,
        latest_version: collectionInfo.latest_version,
        items: [] as Array<MycaItem>,
      };

      if (!collectionInfo.items.length) return result;

      result.items = await this.item.getAllDetail(
        { id: collectionInfo.items },
        { detail: 1 },
      );

      return result;
    },
  };
}

class QueryParamBuilder {
  static build(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    const flatten = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}[${key}]` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          searchParams.append(newKey, String(value));
        }
      });
    };

    flatten(params);
    return searchParams.toString();
  }

  static parse(queryString: string): Record<string, any> {
    const searchParams = new URLSearchParams(queryString);
    const result: Record<string, any> = {};

    for (const [key, value] of searchParams.entries()) {
      const keys = key.split(/[\[\]]/).filter(Boolean);
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        current[k] = current[k] || {};
        current = current[k];
      }

      const lastKey = keys[keys.length - 1];
      try {
        current[lastKey] = JSON.parse(value);
      } catch {
        current[lastKey] = value;
      }
    }

    return result;
  }
}
