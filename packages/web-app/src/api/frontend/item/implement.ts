import { ItemAPI } from '@/api/frontend/item/api';
import { customFetch, METHOD } from '@/api/implement';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import {
  addOriginalPackDef,
  createBundleDef,
  createOriginalPackDef,
} from '@/app/api/store/[store_id]/item/def';
import { Bundle_Item_Product, ItemType } from '@prisma/client';

export const itemImplement = () => {
  return {
    // 商品情報取得
    getAll: async (
      request: ItemAPI['getAll']['request'],
    ): Promise<ItemAPI['getAll']['response']> => {
      const params: BackendItemAPI[0]['request']['query'] = {
        id: request.id,
        cardnumber: request.cardnumber,
        rarity: request.rarity,
        is_buy_only: request.isBuyOnly,
        display_name: request.displayName,
        genre_id: request.genreId,
        category_id: request.categoryId,
        take: request.take,
        isPack: request.isPack,
        skip: request.skip,
        includesProducts: request.includesProducts, //在庫情報まで取得するかどうか
        includesSummary: request.includesSummary,
        hasStock: request.hasStock,
        orderBy: request.orderBy,
        fromTablet: request.fromTablet,
        isMycalinksItem: request.isMycalinksItem,
        includesMycaItemInfo: request.includesMycaItemInfo,
        includesInnerBoxItemInfo: request.includesInnerBoxItemInfo,
        type: request.type as ItemType | undefined,
        hasMarketPriceGap: request.hasMarketPriceGap,
        marketPriceUpdatedAtGte: request.marketPriceUpdatedAtGte,
        expansion: request.expansion,
        cardseries: request.cardseries,
        card_type: request.card_type,
        option1: request.option1,
        option2: request.option2,
        option3: request.option3,
        option4: request.option4,
        option5: request.option5,
        option6: request.option6,
        displaytype1: request.displaytype1,
        displaytype2: request.displaytype2,
        modelNumber: request.modelNumber,
        status: request.status,
        infinite_stock: request.infinite_stock,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item`,
        params,
      })();
    },

    // 単一商品取得
    get: async (
      request: ItemAPI['get']['request'],
    ): Promise<ItemAPI['get']['response']> => {
      const params: BackendItemAPI[0]['request']['query'] = {
        id: request.id,
        includesProducts: request.includesProducts,
        type: request.type,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item/`,
        params,
      })();
    },
    // 商品登録
    create: async (
      request: ItemAPI['create']['request'],
    ): Promise<ItemAPI['create']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item`,
        body: request,
      })();
    },

    // 商品編集
    update: async (
      request: ItemAPI['update']['request'],
    ): Promise<ItemAPI['update']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}/item/${request.itemID}`,
        body: request.body,
      })();
    },

    //商品マスタ関連CSVアップロード機能
    uploadCsv: async (
      request: ItemAPI['uploadCsv']['request'],
    ): Promise<ItemAPI['uploadCsv']['response']> => {
      const formData = new FormData();

      formData.append('file', request.body.file);
      if (request.body.json) {
        formData.append('json', JSON.stringify(request.body.json));
      }

      return await customFetch(
        {
          url: `/api/store/${request.storeID}/item/csv`,
          method: METHOD.POST,
          body: formData,
        },
        true,
      )();
    },

    /**
     * 商品マスタ一覧をCSVファイルとして取得する関数
     * @param request - パラメータ（現在は特になし）
     * @returns - ダウンロード可能なファイルのURL
     */
    getCsvFile: async (
      request: ItemAPI['getCsvFile']['request'],
    ): Promise<ItemAPI['getCsvFile']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item/csv`,
        params: {
          genre_id: request.genreId,
          category_id: request.categoryId,
        },
      })();
    },

    /**
     * パックを指定して中身のカードを取得
     */
    getPackItem: async (
      request: ItemAPI['getPackItem']['request'],
    ): Promise<ItemAPI['getPackItem']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        params: { isPack: request.isPack },
        url: `/api/store/${request.storeID}/item/${request.item_id}/open-pack`,
      })();
    },
    regenerateProducts: async (
      request: ItemAPI['regenerateProducts']['request'],
    ): Promise<ItemAPI['regenerateProducts']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/${request.itemID}/regenerate-products`,
      })();
    },

    //オリジナルパックを作成、編集
    createOriginalPack: async (
      request: ItemAPI['createOriginalPack']['request'],
    ): Promise<ItemAPI['createOriginalPack']['response']> => {
      const products: typeof createOriginalPackDef.request.body.products =
        request.products.map((product) => ({
          product_id: product.productId,
          item_count: product.itemCount,
          staff_account_id: product.staffAccountId,
        }));
      const body: typeof createOriginalPackDef.request.body = {
        staff_account_id: request.staffAccountId,
        display_name: request.displayName,
        init_stock_number: request.initStockNumber,
        sell_price: request.sellPrice,
        image_url: request.imageUrl,
        genre_id: request.genreId,
        category_id: request.categoryId,
        products: products,
        // バックエンドの型定義によるエラー(undefinedを渡すのが正しい)
        additional_products: undefined,
        asDraft: request.asDraft ?? false,
        id: request.id, // idがあったら更新
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/original-pack/`,
        body,
      })();
    },

    // バンドル商品作成
    createBundle: async (
      request: ItemAPI['createBundle']['request'],
    ): Promise<ItemAPI['createBundle']['response']> => {
      const body: typeof createBundleDef.request.body = {
        id: undefined,
        sell_price: request.sellPrice,
        init_stock_number: request.initStockNumber,
        display_name: request.displayName,
        start_at: request.startAt,
        expire_at: request.expiredAt,
        genre_id: request.genreID,
        image_url: request.imageUrl,
        products: request.products.map((product) => ({
          product_id: product.productID,
          item_count: product.itemCount,
        })),
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/bundle/`,
        body: body,
      })();
      const data = response[201];
      if (data) {
        return {
          ...data,
          bundleItemProducts: data.bundle_item_products.map(
            (product: Bundle_Item_Product) => ({
              itemID: product.item_id,
              productID: product.product_id,
              itemCount: product.item_count,
            }),
          ),
        };
      } else {
        return response;
      }
    },
    // バンドル商品編集
    updateBundle: async (
      request: ItemAPI['updateBundle']['request'],
    ): Promise<ItemAPI['updateBundle']['response']> => {
      const body: typeof createBundleDef.request.body = {
        id: request.id,
        sell_price: request.sellPrice,
        init_stock_number: request.initStockNumber,
        display_name: request.displayName,
        start_at: request.startAt,
        expire_at: request.expiredAt,
        genre_id: request.genreID,
        image_url: request.imageUrl,
        products: request.products.map((product) => ({
          product_id: product.productID,
          item_count: product.itemCount,
        })),
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/bundle/`,
        body: body,
      })();
      const data = response[201];
      if (data) {
        return {
          ...data,
          bundleItemProducts: data.bundle_item_products.map(
            (product: Bundle_Item_Product) => ({
              itemID: product.item_id,
              productID: product.product_id,
              itemCount: product.item_count,
            }),
          ),
        };
      } else {
        return response;
      }
    },
    listItemWithTransaction: async (
      request: ItemAPI['listItemWithTransaction']['request'],
    ): Promise<ItemAPI['listItemWithTransaction']['response']> => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/item/transaction/`,
        params: {
          transactionFinishedAtGte: request.transactionFinishedAtGte,
          transactionFinishedAtLt: request.transactionFinishedAtLt,
          transaction_kind: request.transactionKind,
          item_id: request.itemId,
          display_name: request.displayName,
          category_id: request.categoryId,
          genre_id: request.genreId,
          rarity: request.rarity,
          cardnumber: request.cardnumber,
          expansion: request.expansion,
          productsTagName: request.productsTagName,
          orderBy: request.orderBy,
          take: request.take,
          skip: request.skip,
          includesTransactions: request.includesTransactions,
          includesSummary: request.includesSummary,
          customer_id: request.customerId,
        },
      })();

      return res;
    },
    importItemsFromApp: async (
      request: ItemAPI['importItemsFromApp']['request'],
    ): Promise<ItemAPI['importItemsFromApp']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/genre/${request.itemGenreID}/import-items-from-app`,
        body: {
          targetCategoryHandles: request.targetCategoryHandles,
        },
      })();
    },

    createAllItemsFromPack: async (
      request: ItemAPI['createAllItemsFromPack']['request'],
    ): Promise<ItemAPI['createAllItemsFromPack']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/pack`,
        body: {
          myca_pack_id: request.mycaPackID,
        },
      })();
    },

    //既存オリパの補充API
    addOriginalPack: async (
      request: ItemAPI['addOriginalPack']['request'],
    ): Promise<ItemAPI['addOriginalPack']['response']> => {
      const products: typeof addOriginalPackDef.request.body.additionalProducts =
        request.products.map((product) => ({
          product_id: product.productID,
          item_count: product.itemCount,
        }));
      const body: typeof addOriginalPackDef.request.body = {
        additionalStockNumber: request.additionalStockNumber,
        additionalProducts: products,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/${request.itemID}/add-original-pack/`,
        body,
      })();
    },
  };
};
