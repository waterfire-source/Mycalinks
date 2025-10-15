import {
  Product,
  Store,
  Account,
  Sale,
  Sale_Product,
  Product_Stock_History,
  Pack_Open_History,
  Pack_Open_Products,
  Original_Pack_Product,
  WholesalePriceHistoryResourceType,
  Product_Wholesale_Price_History,
  Set_Deal,
  Set_Deal_Product,
  Transaction_Set_Deal,
  ProductStockHistorySourceKind,
  ItemType,
  SetDealStatus,
} from '@prisma/client';
import {
  BackendProductAPI,
  listProductStockTransferHistoryDef,
  productCsvUploadDef,
  ProductGetAllOrderType,
} from '@/app/api/store/[store_id]/product/api';
import { CustomError } from '@/api/implement';
import { BackendSaleAPI } from '@/app/api/store/[store_id]/sale/api';
import { TAG_GENRE1_METHOD } from '@/api/frontend/product/implement';
import { getProductEcOrderHistoryDef } from '@/app/api/store/[store_id]/product/def';
import { ProductCsvUploadOptions } from 'common';
import { openPackApi } from 'api-generator';
export interface ProductAPI {
  listProducts: {
    request: {
      storeID: number;
      id?: number | number[];
      code?: bigint | string;
      itemGenreId?: number;
      itemCategoryId?: number;
      inventoryId?: number;
      displayName?: string;
      isActive?: boolean;
      conditionOptionId?: number;
      conditionOptionDisplayName?: string;
      specialtyId?: number | false;
      isBundle?: boolean;
      skip?: number;
      take?: number;
      includesSummary?: true;
      stockNumberGte?: number;
      ecAvailable?: boolean;
      isPack?: true;
      priceChangeDateGte?: Date;
      priceChangeDateLt?: Date;
      stockChangeDateGte?: Date;
      stockChangeDateLt?: Date;
      itemRarity?: string; // 在庫のカードレアリティの検索
      itemExpansion?: string | null;
      itemCardseries?: string | null;
      itemCardType?: string | null;
      itemOption1?: string | null;
      itemOption2?: string | null;
      itemOption3?: string | null;
      itemOption4?: number | null;
      itemOption5?: string | null;
      itemOption6?: string | null;
      itemReleaseDate?: string | null;
      itemDisplaytype1?: string | null;
      itemDisplaytype2?: string | null;
      itemCardnumber?: string; // 在庫の型番検索
      orderBy?: ProductGetAllOrderType;
      type?: ItemType;
      tagName?: string;
      isSpecialPriceProduct?: boolean;
      originalPackItemId?: number; // オリパの商品IDを指定するとその中身の商品を取得する
      ecStockNumberGte?: number;
      mycalinksEcEnabled?: boolean; // //MycalinksECで出品しているかどうか
      isConsignmentProduct?: boolean; // 委託商品かどうか
      includesImages?: boolean; // 商品画像を含めるかどうか
      hasManagementNumber?: boolean; // 管理番号があるかどうか
      isMycalinksItem?: boolean; // Mycalinksアプリで管理されている商品か
      mycaItemId?: number; // 特定のMycaアイテムIDで絞り込み
      isInjectedWholesalePrice?: boolean; // 棚卸時に増えた在庫で仕入れ値が挿入されているかどうか true:仕入れ値入力が必要で、すでに入力されている false:仕入れ値入力が必要で、まだ入力されていない
      isInfiniteStock?: boolean;
    };
    response: BackendProductAPI[0]['response']['200'] | CustomError;
  };

  updateProduct: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      body: {
        specific_sell_price?: Product['specific_sell_price'];
        specific_buy_price?: Product['specific_buy_price'];
        retail_price?: Product['retail_price'];
        stock_number?: Product['stock_number'];
        display_name?: Product['display_name'];
        image_url?: Product['image_url'];
        management_number?: Product['management_number'];
        description?: Product['description'];
        readonly_product_code?: Product['readonly_product_code'];
        allowed_point?: boolean;
        tablet_allowed?: boolean;
        mycalinks_ec_enabled?: boolean;
        ochanoko_ec_enabled?: boolean;
        shopify_ec_enabled?: boolean;
        disable_ec_auto_stocking?: boolean;
        pos_reserved_stock_number?: number | null;
        specific_ec_sell_price?: number | null;
        ecPublishStockNumber?: number | null;
        allow_buy_price_auto_adjustment?: boolean;
        allow_sell_price_auto_adjustment?: boolean;
      };
    };
    response: BackendProductAPI[2]['response']['200'] | CustomError;
  };

  getProductHistory: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      start_datetime: Date;
      end_datetime: Date;
      source_kind: ProductStockHistorySourceKind;
    };
    response: BackendProductAPI[3]['response'] | CustomError;
  };

  //選択したプロダクトの在庫変更履歴取得
  listProductStockTransferHistory: {
    request: {
      storeID: Store['id'];
      productID: Product['id'] | null;
      orderBy?: string;
      kind: string;
    };
    response: listProductStockTransferHistoryDef['response'] | CustomError;
  };

  //商品転送
  createTransfer: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      body: {
        to_product_id: Product['id']; //変更後の商品ID
        item_count: number; //変更する在庫数
        // option_id:number; 選択したオプション
        specificWholesalePrice?: number; //特定の仕入れ値
        description: Product_Stock_History['description']; //備考など
      };
    };
    response: BackendProductAPI[5]['response'][200] | CustomError;
  };

  //[TODO] セールの仕様が刷新したため、この辺りも改変する必要あり
  createSale: {
    request: {
      storeID: Store['id'];
      body: {
        start_datetime: Sale['start_datetime'];
        end_datetime: Sale['end__datetime'];
        display_name: Sale['display_name'];
        products: Array<{
          product_id: Sale_Product['product_id'];
        }>;
      };
    };
    response: BackendSaleAPI[0]['response'] | CustomError;
  };

  getCsvFile: {
    request: {
      storeID: number;
      specificDate?: Date;
      itemGenreId?: number | null; //カンマ区切りで複数指定可能
      itemCategoryId?: number | null; //カンマ区切りで複数指定可能
    };
    response: BackendProductAPI[6]['response'][200];
  };

  getSales: {
    request: {
      store_id: Store['id'];
      product_id: Store['id'];
      query: {
        transaction_kind: Sale['transaction_kind'];
      };
    };
    response: BackendProductAPI[7]['response'][200] | CustomError;
  };

  //パックから出てきた商品を登録する
  createPackedProduct: {
    request: {
      storeID: Store['id'];
      productID: Product['id']; //パックのproductID
      body: {
        item_count: Pack_Open_History['item_count']; //開封するパックの部数
        item_count_per_pack: Pack_Open_History['item_count_per_pack']; //パックの一枚あたりの枚数
        staff_account_id: Pack_Open_History['staff_account_id']; //担当者
        to_products: Array<{
          //登録したい中身の商品
          product_id: Pack_Open_Products['product_id']; //商品ID
          item_count: Pack_Open_Products['item_count']; //商品の登録枚数
          wholesale_price: Pack_Open_Products['wholesale_price']; //商品の登録枚数
        }>;
        unregister_product_id: Pack_Open_History['unregister_product_id']; //未登録カードの扱い方 nullだったらロス登録をし、特定の商品IDを入力したらその商品の在庫として登録される
        unregister_item_count: Pack_Open_History['unregister_item_count']; //未登録カードの枚
      };
    };
    response: typeof openPackApi.response | CustomError;
  };

  //仕入れ値を計算する
  getWholesalePrice: {
    request: {
      storeID: Store['id'];
      productID: Product['id']; //パックのproductID
      itemCount?: number; //消費したい在庫数
      reverse?: true; //逆順で取得するかどうか 逆にしない場合はパラメータを指定しないこと
      resourceType?: WholesalePriceHistoryResourceType; //特定のリソースに結びついている仕入れ値を取得する時には、そのリソースのタイプを指定する
      resourceID?: Product_Wholesale_Price_History['resource_id']; //特定のリソースに結びついている仕入れ値を取得する時に、特定のリソースのIDを指定する バンドル・オリパの場合商品マスタのID、取引の場合取引のIDなど
    };
    response: BackendProductAPI[9]['response'][200] | CustomError;
  };

  // 在庫数直接変動API
  postAdjustStock: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      body: {
        changeCount: number;
        reason: string;
        wholesalePrice?: number;
      };
    };
    response: BackendProductAPI[15]['response'][200] | CustomError;
  };

  //オリパ解体
  disassemblyOriginalPack: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      body: {
        id?: number;
        asDraft?: boolean;
        itemCount?: number;
        staff_account_id: Account['id']; //担当者のID
        to_products: Array<{
          //解体後の商品定義
          product_id: Original_Pack_Product['product_id']; //在庫ID
          item_count: Original_Pack_Product['item_count']; //数
          staff_account_id: number;
        }>;
        additionalProducts?: Array<{
          product_id: number;
          staff_account_id: number;
          item_count: number;
        }>;
      };
    };
    response:
      | (Pack_Open_History & {
          to_products: Array<
            Pack_Open_Products & {
              //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
              staff_account: {
                display_name: Account['display_name']; //担当者名
              };
            }
          >;
        })
      | CustomError;
  };

  // バンドル在庫の解体
  releaseBundle: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      itemCount: number;
    };
    response:
      | {
          id: Product_Stock_History['id'];
          productID: Product_Stock_History['product_id'];
          sourceKind: Product_Stock_History['source_kind'];
          sourceID: Product_Stock_History['source_id'];
          itemCount: Product_Stock_History['item_count'];
          unitPrice: Product_Stock_History['unit_price'];
          description: Product_Stock_History['description'];
          resultStockNumber: Product_Stock_History['result_stock_number'];
          datetime: Product_Stock_History['datetime'];
        }
      | CustomError;
  };

  // セット販売の作成
  createSetDeal: {
    request: {
      storeID: Store['id'];
      displayName?: Set_Deal['display_name']; //登録の時は必須
      discountAmount?: Set_Deal['discount_amount']; //適用割引の量 30円引きだったら-30 30%引きだったら70%（他のと統一するためこうしてます） 登録の時は必須
      startAt?: Set_Deal['start_at']; //セット販売の開始日
      expiredAt?: Set_Deal['expire_at']; //セット販売の有効期限
      products: Array<{
        productID: Set_Deal_Product['product_id']; //在庫ID
        itemCount: Set_Deal_Product['item_count']; //商品数
      }>;
      imageUrl?: string | undefined; //画像URL
    };
    response:
      | {
          id: Set_Deal['id'];
          storeID: Set_Deal['store_id'];
          displayName: Set_Deal['display_name'];
          discountAmount: Set_Deal['discount_amount'];
          createdAt: Set_Deal['created_at'];
          updatedAt: Set_Deal['updated_at'];
          isDeleted: Set_Deal['is_deleted'];
          expiredAt: Set_Deal['expire_at'];
          imageUrl: Set_Deal['image_url'];
          products: {
            setDealID: Set_Deal_Product['set_deal_id'];
            productID: Set_Deal_Product['product_id'];
            itemCount: Set_Deal_Product['item_count'];
          }[];
          transactions: {
            transactionID: Transaction_Set_Deal['transaction_id'];
            setDealID: Transaction_Set_Deal['set_deal_id'];
            applyCount: Transaction_Set_Deal['apply_count'];
          };
        }
      | CustomError;
  };

  // セット販売の更新API
  updateSetDeal: {
    request: {
      storeID: Store['id'];
      setDealID: Set_Deal['id']; //更新する時はIDを指定する
      displayName?: Set_Deal['display_name']; //登録の時は必須
      discountAmount?: Set_Deal['discount_amount']; //適用割引の量 30円引きだったら-30 30%引きだったら70%（他のと統一するためこうしてます） 登録の時は必須
      startAt?: Set_Deal['start_at']; //セット販売の開始日
      expiredAt?: Set_Deal['expire_at']; //セット販売の有効期限
      products: Array<{
        productID: Set_Deal_Product['product_id']; //在庫ID
        itemCount: Set_Deal_Product['item_count']; //商品数
      }>;
      imageUrl?: string | undefined; //画像URL
    };
    response:
      | {
          id: Set_Deal['id'];
          storeID: Set_Deal['store_id'];
          displayName: Set_Deal['display_name'];
          discountAmount: Set_Deal['discount_amount'];
          createdAt: Set_Deal['created_at'];
          updatedAt: Set_Deal['updated_at'];
          isDeleted: Set_Deal['is_deleted'];
          expiredAt: Set_Deal['expire_at'];
          imageUrl: Set_Deal['image_url'];
          products: {
            setDealID: Set_Deal_Product['set_deal_id'];
            productID: Set_Deal_Product['product_id'];
            itemCount: Set_Deal_Product['item_count'];
          }[];
          transactions: {
            transactionID: Transaction_Set_Deal['transaction_id'];
            setDealID: Transaction_Set_Deal['set_deal_id'];
            applyCount: Transaction_Set_Deal['apply_count'];
          };
        }
      | CustomError;
  };

  // セット販売の削除API
  deleteSetDeal: {
    request: {
      storeID: Store['id'];
      setDealID: Set_Deal['id'];
    };
    response: { ok: string } | CustomError;
  };

  // セット販売の一覧取得API
  listSetDeals: {
    request: {
      storeID: Store['id'];
      id?: Set_Deal['id']; // 指定しない場合全件取得
    };
    response:
      | {
          setDeals: {
            status: SetDealStatus | undefined;
            id: Set_Deal['id'];
            storeID: Set_Deal['store_id'];
            staffAccountID: Set_Deal['staff_account_id'];
            displayName: Set_Deal['display_name'];
            discountAmount: Set_Deal['discount_amount'];
            createdAt: Set_Deal['created_at'];
            updatedAt: Set_Deal['updated_at'];
            isDeleted: Set_Deal['is_deleted'];
            startAt: Set_Deal['start_at'];
            expiredAt: Set_Deal['expire_at'];
            imageUrl: Set_Deal['image_url'];
            products: {
              setDealID: Set_Deal_Product['set_deal_id'];
              productID: Set_Deal_Product['product_id'];
              itemCount: Set_Deal_Product['item_count'];
            }[];
          }[];
        }
      | CustomError;
  };

  // セット割引額の確認API
  checkSetDealDiscount: {
    request: {
      storeID: number;
      carts: Array<{
        productID: number;
        unitPrice: number;
        itemCount: number;
      }>;
    };
    response:
      | {
          availableSetDeals: Array<{
            setDealID: number;
            applyCount: number;
            totalDiscountPrice: number;
            displayName: string;
            targetProducts: Array<{
              productID: number;
              unitPrice: number;
              itemCount: number;
            }>;
          }>;
        }
      | CustomError;
  };

  // タグの作成API
  createTag: {
    request: {
      storeID: number;
      displayName: string;
      description?: string;
      genre1?: TAG_GENRE1_METHOD;
      genre2?: string;
    };
    response:
      | {
          id: number;
          storeID: number;
          displayName: string;
          description: string;
          genre1: string;
          genre2: string;
          createdAt: string;
          updatedAt: string;
        }
      | CustomError;
  };

  // タグの更新API
  updateTag: {
    request: {
      storeID: number;
      tagID: number;
      displayName: string;
      description?: string;
      genre1?: TAG_GENRE1_METHOD;
      genre2?: string;
    };
    response:
      | {
          id: number;
          storeID: number;
          displayName: string;
          description: string;
          genre1: string;
          genre2: string;
          createdAt: string;
          updatedAt: string;
        }
      | CustomError;
  };

  // タグの削除API
  deleteTag: {
    request: {
      storeID: number;
      tagID: number;
    };
    response: { ok: string } | CustomError;
  };

  // タグの一覧取得API
  getTags: {
    request: {
      storeID: number;
      tagID?: number;
      genre1?: TAG_GENRE1_METHOD;
      includesAuto?: boolean;
    };
    response:
      | {
          id: number;
          storeID: number;
          displayName: string;
          description: string;
          genre1: string;
          genre2: string;
          productsCount: number;
          createdAt: string;
          updatedAt: string;
        }[]
      | CustomError;
  };

  //商品にタグを付与する(タグに商品を追加する)
  addTagToProduct: {
    request: {
      storeID: number;
      products: Array<{
        productID: number;
        tagID: number; // タグのID (必須)
      }>;
    };
    response: { ok: string } | CustomError;
  };

  //商品からタグを取り除く（タグからを削除する）
  removeTagFromProduct: {
    request: {
      storeID: number;
      productID: number;
      tagID: number;
    };
    response:
      | {
          tags: Array<{
            tag: {
              id: number;
              display_name: string;
            };
          }>;
        }
      | CustomError;
  };

  //特価在庫への移動を行うAPI
  transferToSpecialPriceProduct: {
    request: {
      storeID: number;
      productID: number;
      body: {
        itemCount: number;
        sellPrice: number;
        specificAutoSellPriceAdjustment?: string;
        forceNoPriceLabel?: boolean;
      };
    };
    response: { updateResult: Product } | CustomError;
  };

  //ECの販売履歴取得
  getProductEcOrderHistory: {
    request: {
      storeID: number;
      productID: number;
      orderBy?: string;
      take?: number;
      skip?: number;
      includesSummary?: boolean;
    };
    response: typeof getProductEcOrderHistoryDef.response;
  };

  uploadCsv: {
    request: {
      storeID: Store['id'];
      body: {
        file: File;
        json: {
          options: ProductCsvUploadOptions;
        };
      };
    };
    response: productCsvUploadDef['response'][200];
  };

  uploadOchanokoCsv: {
    request: {
      storeID: Store['id'];
      body: {
        file: File;
      };
    };
    response: {
      ok: string;
    };
  };

  updateProductImages: {
    request: {
      storeID: Store['id'];
      productID: Product['id'];
      body: {
        images: Array<{
          image_url: string;
          description: string | null;
          order_number: number;
        }>;
      };
    };
    response:
      | {
          images: Array<{
            id: number;
            product_id: number;
            image_url: string;
            description?: string;
            order_number: number;
            created_at: Date;
            updated_at: Date;
          }>;
        }
      | CustomError;
  };
}

export interface ProductApiRes {
  listProducts: Exclude<ProductAPI['listProducts']['response'], CustomError>;
  updateProduct: Exclude<ProductAPI['updateProduct']['response'], CustomError>;
  getProductHistory: Exclude<
    ProductAPI['getProductHistory']['response'],
    CustomError
  >;
  createTransfer: Exclude<
    ProductAPI['createTransfer']['response'],
    CustomError
  >;
  createSale: Exclude<ProductAPI['createSale']['response'], CustomError>;
  getCsvFile: Exclude<ProductAPI['getCsvFile']['response'], CustomError>;
  getSales: Exclude<ProductAPI['getSales']['response'], CustomError>;
  createPackedProduct: Exclude<
    ProductAPI['createPackedProduct']['response'],
    CustomError
  >;
  getWholesalePrice: Exclude<
    ProductAPI['getWholesalePrice']['response'],
    CustomError
  >;
  postAdjustStock: Exclude<
    ProductAPI['postAdjustStock']['response'],
    CustomError
  >;
  disassemblyOriginalPack: Exclude<
    ProductAPI['disassemblyOriginalPack']['response'],
    CustomError
  >;
  releaseBundle: Exclude<ProductAPI['releaseBundle']['response'], CustomError>;
  createSetDeal: Exclude<ProductAPI['createSetDeal']['response'], CustomError>;
  updateSetDeal: Exclude<ProductAPI['updateSetDeal']['response'], CustomError>;
  deleteSetDeal: Exclude<ProductAPI['deleteSetDeal']['response'], CustomError>;
  listSetDeals: Exclude<ProductAPI['listSetDeals']['response'], CustomError>;
  checkSetDealDiscount: Exclude<
    ProductAPI['checkSetDealDiscount']['response'],
    CustomError
  >;
  createTag: Exclude<ProductAPI['createTag']['response'], CustomError>;
  updateTag: Exclude<ProductAPI['updateTag']['response'], CustomError>;
  deleteTag: Exclude<ProductAPI['deleteTag']['response'], CustomError>;
  getTags: Exclude<ProductAPI['getTags']['response'], CustomError>;
  addTagToProduct: Exclude<
    ProductAPI['addTagToProduct']['response'],
    CustomError
  >;
  removeTagFromProduct: Exclude<
    ProductAPI['removeTagFromProduct']['response'],
    CustomError
  >;
  listProductStockTransferHistory: Exclude<
    ProductAPI['listProductStockTransferHistory']['response'],
    CustomError
  >;
  updateProductImages: Exclude<
    ProductAPI['updateProductImages']['response'],
    CustomError
  >;
}
