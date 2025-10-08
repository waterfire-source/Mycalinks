import {
  Item,
  Product,
  Store,
  TransactionKind,
  ItemType,
  Item_Category,
} from '@prisma/client';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

import { CustomError } from '@/api/implement';
import {
  addOriginalPackDef,
  createAllItemsFromPackDef,
  createOriginalPackDef,
  importAllItemsFromAppByGenreDef,
} from '@/app/api/store/[store_id]/item/def';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ItemCsvUploadOptions } from '@/constants/mycapos';

export interface ItemAPI {
  getAll: {
    request: {
      id?: Item['id'] | number[];
      storeID: Store['id'];
      genreId?: number;
      categoryId?: number;
      isBuyOnly?: boolean;
      productIsActive?: boolean;
      rarity?: string | null;
      cardnumber?: string;
      displayName?: string;
      skip?: number;
      take?: number;
      orderBy?: ItemGetAllOrderType | ItemGetAllOrderType[];
      includesProducts?: true;
      includesMycaItemInfo?: true;
      hasStock?: boolean; //在庫数があるものに限定するかどうか
      isPack?: boolean; //パックのもの限定にするかどうか
      includesSummary?: true;
      includesInnerBoxItemInfo?: boolean; //カートンマスタだった場合、内包ボックスの情報まで取得するか
      type?: ItemType; //商品マスタタイプの指定 BUNDLEやORIGINAL_PACKだったら内訳まで同時に取得することができる
      fromTablet?: boolean; //在庫検索タブレットからのリクエストかどうか
      isMycalinksItem?: boolean; //MycaLinkのアイテムかどうか
      hasMarketPriceGap?: boolean; //trueを指定すると、相場価格（market_price）と商品マスタ販売価格（sell_price）の差があるもののみを取得する
      marketPriceUpdatedAtGte?: string; //相場価格が指定した日時以降に変動しているもののみ取得
      expansion?: string | null;
      cardseries?: string | null;
      card_type?: string | null;
      option1?: string | null;
      option2?: string | null;
      option3?: string | null;
      option4?: number | null;
      option5?: string | null;
      option6?: string | null;
      displaytype1?: string | null;
      displaytype2?: string | null;
      modelNumber?: string;
      status?: Item['status'] | Item['status'][];
      infinite_stock?: boolean;
    };
    response: BackendItemAPI[0]['response']['200'] | CustomError;
  };
  get: {
    request: {
      storeID: number;
      id: number;
      includesProducts?: true;
      type?: ItemType;
    };
    response: BackendItemAPI[0]['response']['200'] | CustomError;
  };
  update: {
    request: {
      storeID: Store['id'];
      itemID: Product['id'];
      body: BackendItemAPI[3]['request']['body'];
    };
    response: BackendItemAPI[3]['response'][200] | CustomError;
  };
  create: {
    request: {
      storeID: Store['id'];
      myca_item_id?: number;
      myca_pack_id?: number; //MycaデータベースにおけるパックID
      display_name?: Item['display_name']; //ない場合、Mycaのものが使われる
      display_name_ruby?: Item['display_name_ruby'];
      sell_price?: Item['sell_price']; //ない場合、Mycaのpriceが使われる
      buy_price?: Item['buy_price']; //ない場合、Mycaのpriceが使われる
      rarity?: Item['rarity']; //ない場合、Mycaのものが使われる
      expansion?: Item['expansion']; //ない場合、Mycaのものが使われる
      cardnumber?: Item['cardnumber']; //ない場合、Mycaのものが使われる
      keyword?: Item['keyword']; //ない場合、Mycaのものが使われる
      pack_name?: Item['pack_name']; //ない場合、Mycaのものが使われる
      description?: Item['description'];
      image_url?: Item['image_url']; //ない場合、Mycaのものが使われる
      category_id?: Item['category_id']; //ない場合、Mycaの商品種別が自動的にPOSにインポートされる
      genre_id?: Item['genre_id']; //ない場合、Mycaのジャンルが自動的にPOSにインポートされる
      is_buy_only?: Item['is_buy_only']; //買取専用商品かどうか
      order_number: Item['order_number']; //表示順
      readonly_product_code?: Item['readonly_product_code']; //JAN
      orderBy?: ItemGetAllOrderType | ItemGetAllOrderType[];
      allow_auto_print_label?: Item['allow_auto_print_label']; //自動でラベル印刷させるかどうか
      allow_round?: Item['allow_round']; //端数処理を有効にするかどうか
      infinite_stock?: Item['infinite_stock']; //在庫数を無限にするかどうか
    };
    response: { id: Item['id'] } | CustomError;
  };
  uploadCsv: {
    request: {
      storeID: Store['id'];
      body: {
        file: File;
        json: {
          options: ItemCsvUploadOptions;
        };
      };
    };
    response: BackendItemAPI[2]['response'][200];
  };
  getCsvFile: {
    request: {
      storeID: Store['id'];
      genreId?: number | null;
      categoryId?: number | null;
    };
    response: BackendItemAPI[5]['response'][200];
  };
  getPackItem: {
    request: {
      storeID: Store['id'];
      item_id: Item['id'];
      isPack?: boolean;
    };
    response: BackendItemAPI[6]['response'][200];
  };

  regenerateProducts: {
    request: {
      storeID: Store['id'];
      itemID: Item['id'];
    };
    response: BackendItemAPI[7]['response'][200];
  };
  //オリパ作成 TODO 下書き作成APIは別で作成する
  createOriginalPack: {
    request: {
      storeID: number;
      displayName: string;
      initStockNumber: number;
      sellPrice: number;
      imageUrl?: string | null;
      genreId: number;
      categoryId: number;
      products: Array<{
        productId: number; //在庫ID
        staffAccountId: number; // 作成した担当者ID
        itemCount: number; //その数
      }>;
      asDraft?: boolean;
      id?: number;
    };
    response: typeof createOriginalPackDef.response | CustomError;
  };
  // バンドル商品の作成
  createBundle: {
    request: {
      storeID: number;
      sellPrice: number; //販売価格
      initStockNumber: number; //初期在庫数
      displayName: string; //商品名
      startAt: Date; //バンドルの開始日
      expiredAt?: Date | null; //バンドルの有効期限（自動解体日）
      genreID?: number | null; //商品ジャンル
      imageUrl?: string | null; //画像URL
      products: Array<{
        productID: number; //在庫ID
        itemCount: number; //商品数
      }>;
    };
    response:
      | (Item & {
          bundleItemProducts: Array<{
            itemID: number;
            productID: number;
            itemCount: number;
          }>;
        })
      | CustomError;
  };
  // バンドル商品の編集
  updateBundle: {
    request: {
      id: number; // ここに渡すのはバンドルのitemId
      storeID: number;
      sellPrice: number; //販売価格
      initStockNumber: number; //初期在庫数
      displayName: string; //商品名
      startAt: Date; //バンドルの開始日
      expiredAt?: Date | null; //バンドルの有効期限（自動解体日）
      genreID?: number | null; //商品ジャンル
      imageUrl?: string | null; //画像URL
      products: Array<{
        productID: number; //在庫ID
        itemCount: number; //商品数
      }>;
    };
    response:
      | (Item & {
          bundleItemProducts: Array<{
            itemID: number;
            productID: number;
            itemCount: number;
          }>;
        })
      | CustomError;
  };
  //商品マスタベースで取引の統計情報を取得
  listItemWithTransaction: {
    request: {
      storeId: number;
      transactionFinishedAtGte?: Date;
      transactionFinishedAtLt?: Date;
      transactionKind?: string;
      itemId?: number;
      displayName?: string;
      categoryId?: number;
      genreId?: number;
      rarity?: string;
      cardnumber?: string;
      expansion?: string;
      productsTagName?: string;
      orderBy?: string[];
      take?: number;
      skip?: number;
      includesTransactions?: boolean;
      includesSummary?: boolean;
      customerId?: number;
    };
    response:
      | {
          items: Array<{
            item: Item;
            item_id: number;
            transaction_kind: TransactionKind;
            transactionStats: {
              transactionCount: number;
              transactionProductsCount: number;
              transactionTotalPrice: number;
            };
            transactions?: Array<{
              transaction: {
                id: number;
                finished_at: Date;
                payment_method: string;
              };
              item_count: number;
              total_unit_price: number;
              total_discount_price: number;
              product: {
                id: number;
                conditions: Array<{
                  condition_option: {
                    display_name: string;
                  };
                }>;
              };
            }>;
          }>;
          summary?: {
            totalCount: number;
            totalSellPrice: number;
            totalBuyPrice: number;
          };
        }
      | CustomError;
  };
  //Appのジャンルから一括でアイテムを登録
  importItemsFromApp: {
    request: {
      storeID: number;
      itemGenreID: number;
      targetCategoryHandles?: Item_Category['handle'][];
    };
    response: typeof importAllItemsFromAppByGenreDef.response | CustomError;
  };
  //ボックスごとアイテムを一気に追加するAPI
  createAllItemsFromPack: {
    request: {
      storeID: number;
      mycaPackID: number;
    };
    response: typeof createAllItemsFromPackDef.response | CustomError;
  };

  //既存オリパの補充API
  addOriginalPack: {
    request: {
      storeID: number;
      itemID: number;
      additionalStockNumber: number;
      products: Array<{
        productID: number; //在庫ID
        itemCount: number; //商品数
      }>;
    };
    response: typeof addOriginalPackDef.response | CustomError;
  };
}

export interface ItemAPIRes {
  getAll: Exclude<ItemAPI['getAll']['response'], CustomError>;
  get: Exclude<ItemAPI['get']['response'], CustomError>;
  update: Exclude<ItemAPI['update']['response'], CustomError>;
  create: Exclude<ItemAPI['create']['response'], CustomError>;
  uploadCsv: ItemAPI['uploadCsv']['response'];
  getCsvFile: ItemAPI['getCsvFile']['response'];
  getPackItem: ItemAPI['getPackItem']['response'];
  regenerateProducts: ItemAPI['regenerateProducts']['response'];
  createBundle: Exclude<ItemAPI['createBundle']['response'], CustomError>;
  createOriginalPack: Exclude<
    ItemAPI['createOriginalPack']['response'],
    CustomError
  >;
  listItemWithTransaction: Exclude<
    ItemAPI['listItemWithTransaction']['response'],
    CustomError
  >;
  importItemsFromApp: Exclude<
    ItemAPI['importItemsFromApp']['response'],
    CustomError
  >;
  createAllItemsFromPack: Exclude<
    ItemAPI['createAllItemsFromPack']['response'],
    CustomError
  >;
}
