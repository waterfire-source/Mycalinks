import { ProductAPI } from '@/api/frontend/product/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import {
  BackendProductAPI,
  checkSetDealsDef,
  getTagDef,
} from '@/app/api/store/[store_id]/product/api';
import { getProductEcOrderHistoryDef } from '@/app/api/store/[store_id]/product/def';

export enum TAG_GENRE1_METHOD {
  APPRAISAL = 'appraisal_option',
}

export const productImplement = () => {
  return {
    listProducts: async (
      request: ProductAPI['listProducts']['request'],
    ): Promise<ProductAPI['listProducts']['response']> => {
      const params: BackendProductAPI['0']['request']['query'] = {
        id: request.id,
        product_code:
          typeof request.code === 'bigint'
            ? request.code.toString()
            : request.code,
        item_genre_id: request.itemGenreId,
        item_category_id: request.itemCategoryId,
        condition_option_id: request.conditionOptionId,
        condition_option_display_name: request.conditionOptionDisplayName,
        specialty_id: request.specialtyId,
        inventory_id: request.inventoryId,
        display_name: request.displayName,
        is_active: request.isActive,
        ecAvailable: request.ecAvailable,
        take: request.take,
        skip: request.skip,
        stock_number_gte: request.stockNumberGte,
        isPack: request.isPack,
        priceChangeDateGte: request.priceChangeDateGte,
        priceChangeDateLt: request.priceChangeDateLt,
        stockChangeDateGte: request.stockChangeDateGte,
        stockChangeDateLt: request.stockChangeDateLt,
        item_expansion: request.itemExpansion,
        item_cardnumber: request.itemCardnumber,
        item_rarity: request.itemRarity,
        item_cardseries: request.itemCardseries,
        item_card_type: request.itemCardType,
        item_option1: request.itemOption1,
        item_option2: request.itemOption2,
        item_option3: request.itemOption3,
        item_option4: request.itemOption4,
        item_option5: request.itemOption5,
        item_option6: request.itemOption6,
        item_release_date: request.itemReleaseDate,
        item_displaytype1: request.itemDisplaytype1,
        item_displaytype2: request.itemDisplaytype2,
        includesSummary: request.includesSummary,
        orderBy: request.orderBy,
        type: request.type,
        tag_name: request.tagName,
        is_special_price_product: request.isSpecialPriceProduct,
        original_pack_item_id: request.originalPackItemId,
        ec_stock_number_gte: request.ecStockNumberGte,
        mycalinks_ec_enabled: request.mycalinksEcEnabled,
        is_consignment_product: request.isConsignmentProduct,
        includesImages: request.includesImages ? true : undefined,
        hasManagementNumber: request.hasManagementNumber,
        isMycalinksItem: request.isMycalinksItem,
        myca_item_id: request.mycaItemId,
        isInjectedWholesalePrice: request.isInjectedWholesalePrice,
        item_infinite_stock: request.isInfiniteStock,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product`,
        params,
      })();
    },

    updateProduct: async (
      request: ProductAPI['updateProduct']['request'],
    ): Promise<ProductAPI['updateProduct']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}/product/${request.productID}`,
        body: request.body,
      })();
    },

    getProductHistory: async (
      request: ProductAPI['getProductHistory']['request'],
    ): Promise<ProductAPI['getProductHistory']['response']> => {
      const params: BackendProductAPI['3']['request']['query'] = {
        start_datetime: request.start_datetime,
        end_datetime: request.end_datetime,
        source_kind: request.source_kind,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/${request.productID}/history`,
        params,
      })();
    },

    createTransfer: async (
      request: ProductAPI['createTransfer']['request'],
    ): Promise<ProductAPI['createTransfer']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/transfer`,
        body: request.body,
      })();
    },

    //セール登録
    createSale: async (
      request: ProductAPI['createSale']['request'],
    ): Promise<ProductAPI['createSale']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/sale`,
        body: request.body,
      })();
    },

    //セールデータ取得
    getSales: async (
      request: ProductAPI['getSales']['request'],
    ): Promise<ProductAPI['getSales']['response']> => {
      const params: BackendProductAPI['7']['request']['query'] = {
        transaction_kind: request.query.transaction_kind,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/product/${request.product_id}/sale`,
        params,
      })();
    },

    /**
     * 在庫一覧をCSVファイルとして取得する関数
     * @param request - パラメータ（現在は特になし）
     * @returns - ダウンロード可能なファイルのURL
     */
    getCsvFile: async (
      request: ProductAPI['getCsvFile']['request'],
    ): Promise<ProductAPI['getCsvFile']['response']> => {
      const params: BackendProductAPI['6']['request']['query'] = {
        specificDate: request.specificDate,
        item_genre_id: request.itemGenreId ? [request.itemGenreId] : undefined,
        item_category_id: request.itemCategoryId
          ? [request.itemCategoryId]
          : undefined,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/csv`,
        params,
      })();
    },

    createPackedProduct: async (
      request: ProductAPI['createPackedProduct']['request'],
    ): Promise<ProductAPI['createPackedProduct']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/open-pack`,
        body: request.body,
      })();
    },

    //仕入れ値を取得
    getWholesalePrice: async (
      request: ProductAPI['getWholesalePrice']['request'],
    ): Promise<ProductAPI['getWholesalePrice']['response']> => {
      const params: BackendProductAPI['9']['request']['query'] = {
        itemCount: request.itemCount,
        reverse: request.reverse,
        resource_type: request.resourceType,
        resource_id: request.resourceID,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/${request.productID}/wholesale-price`,
        params,
      })();
    },

    // 在庫数直接変動API
    postAdjustStock: async (
      request: ProductAPI['postAdjustStock']['request'],
    ): Promise<ProductAPI['postAdjustStock']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/adjust-stock`,
        body: request.body,
      })();
    },

    //オリパ解体
    disassemblyOriginalPack: async (
      request: ProductAPI['disassemblyOriginalPack']['request'],
    ): Promise<ProductAPI['disassemblyOriginalPack']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/release-original-pack`,
        body: request.body,
      })();
    },
    // バンドル在庫の解体API
    releaseBundle: async (
      request: ProductAPI['releaseBundle']['request'],
    ): Promise<ProductAPI['releaseBundle']['response']> => {
      const body: BackendProductAPI[14]['request']['body'] = {
        item_count: request.itemCount,
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/release-bundle`,
        body,
      })();
      const data = response[200];
      if (data) {
        return {
          id: data.id,
          productID: data.product_id,
          sourceKind: data.source_kind,
          sourceID: data.source_id,
          itemCount: data.item_count,
          unitPrice: data.unit_price,
          description: data.description,
          resultStockNumber: data.result_stock_number,
          datetime: data.datetime,
        };
      } else {
        return response;
      }
    },

    // セット販売の新規作成
    createSetDeal: async (
      request: ProductAPI['createSetDeal']['request'],
    ): Promise<ProductAPI['createSetDeal']['response']> => {
      const body: BackendProductAPI[10]['request']['body'] = {
        display_name: request.displayName,
        discount_amount: request.discountAmount,
        start_at: request.startAt,
        expire_at: request.expiredAt,
        products: request.products.map((product) => ({
          product_id: product.productID,
          item_count: product.itemCount,
        })),
        image_url: request.imageUrl,
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/set-deal/`,
        body,
      })();
      const data = response[200];
      if (data) {
        return {
          id: data.id,
          storeID: data.storeID,
          displayName: data.display_name,
          discountAmount: data.discount_amount,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isDeleted: data.is_deleted,
          expiredAt: data.expire_at,
          imageUrl: data.image_url,
          products: data.products.map((product: any) => ({
            setDealID: product.set_deal_id,
            productID: product.product_id,
            itemCount: product.item_count,
          })),
          transactions: data.transactions.map((transaction: any) => ({
            transactionID: transaction.transaction_id,
            setDealID: transaction.set_deal_id,
            setDealUnitDiscountPrice: transaction.set_deal_unit_discount_price,
            applyCount: transaction.apply_count,
          })),
        };
      } else {
        return response;
      }
    },

    // セット販売の更新
    updateSetDeal: async (
      request: ProductAPI['updateSetDeal']['request'],
    ): Promise<ProductAPI['updateSetDeal']['response']> => {
      const body: BackendProductAPI[10]['request']['body'] = {
        id: request.setDealID,
        display_name: request.displayName,
        discount_amount: request.discountAmount,
        start_at: request.startAt,
        expire_at: request.expiredAt,
        products: request.products.map((product) => ({
          product_id: product.productID,
          item_count: product.itemCount,
        })),
        image_url: request.imageUrl,
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/set-deal/`,
        body,
      })();
      const data = response[201];
      if (data) {
        return {
          id: data.id,
          storeID: data.storeID,
          displayName: data.display_name,
          discountAmount: data.discount_amount,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isDeleted: data.is_deleted,
          expiredAt: data.expire_at,
          imageUrl: data.image_url,
          products: data.products.map((product: any) => ({
            setDealID: product.set_deal_id,
            productID: product.product_id,
            itemCount: product.item_count,
          })),
          transactions: data.transactions.map((transaction: any) => ({
            transactionID: transaction.transaction_id,
            setDealID: transaction.set_deal_id,
            setDealUnitDiscountPrice: transaction.set_deal_unit_discount_price,
            applyCount: transaction.apply_count,
          })),
        };
      } else {
        return response;
      }
    },

    // セット販売の削除
    deleteSetDeal: async (
      request: ProductAPI['deleteSetDeal']['request'],
    ): Promise<ProductAPI['deleteSetDeal']['response']> => {
      const { storeID, setDealID } = request;
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${storeID}/product/set-deal/${setDealID}/`,
      })();
    },

    // セット販売の一覧取得
    listSetDeals: async (
      request: ProductAPI['listSetDeals']['request'],
    ): Promise<ProductAPI['listSetDeals']['response']> => {
      const { storeID, id } = request;

      const params: BackendProductAPI['12']['request']['query'] = {
        id: request.id,
      };

      const response = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${storeID}/product/set-deal/`,
        params,
      })();
      if (response) {
        return {
          setDeals: response.set_deals.map((setDeal: any) => ({
            id: setDeal.id,
            storeID: setDeal.storeID,
            staffAccountID: setDeal.staff_account_id,
            displayName: setDeal.display_name,
            discountAmount: setDeal.discount_amount,
            createdAt: setDeal.created_at,
            updatedAt: setDeal.updated_at,
            isDeleted: setDeal.is_deleted,
            startAt: setDeal.start_at,
            status: setDeal.status,
            expiredAt: setDeal.expire_at,
            imageUrl: setDeal.image_url,
            products: setDeal.products.map((product: any) => ({
              setDealID: product.set_deal_id,
              productID: product.product_id,
              itemCount: product.item_count,
            })),
          })),
        };
      } else {
        return response;
      }
    },

    // セット割引額の確認
    checkSetDealDiscount: async (
      request: ProductAPI['checkSetDealDiscount']['request'],
    ): Promise<ProductAPI['checkSetDealDiscount']['response']> => {
      const body: checkSetDealsDef['request']['body'] = {
        carts: request.carts.map(
          (cart): checkSetDealsDef['request']['body']['carts'][0] => ({
            product_id: cart.productID,
            unit_price: cart.unitPrice,
            item_count: cart.itemCount,
          }),
        ),
      };
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/set-deal/check/`,
        body: body,
      })();
      const data: checkSetDealsDef['response'][200] = response;
      if (data) {
        return {
          availableSetDeals: data.availableSetDeals.map((setDeal) => ({
            setDealID: setDeal.setDealId,
            applyCount: setDeal.applyCount,
            totalDiscountPrice: setDeal.totalDiscountPrice,
            displayName: setDeal.display_name,
            targetProducts: setDeal.targetProducts.map((product) => ({
              productID: product.product_id,
              unitPrice: product.unit_price,
              itemCount: product.item_count,
            })),
          })),
        };
      } else {
        return response;
      }
    },

    //選択した在庫プロダクトに対してその変更ログを取得
    listProductStockTransferHistory: async (
      request: ProductAPI['listProductStockTransferHistory']['request'],
    ): Promise<ProductAPI['listProductStockTransferHistory']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/${request.productID}/transfer-history`,
        params: {
          kind: request.kind,
          orderBy: request.orderBy,
        },
      })();
    },

    // タグの作成
    createTag: async (
      request: ProductAPI['createTag']['request'],
    ): Promise<ProductAPI['createTag']['response']> => {
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/tag`,
        body: {
          display_name: request.displayName,
          description: request.description,
          genre1: request.genre1,
          genre2: request.genre2,
        },
      })();
      if (response instanceof CustomError) {
        return response;
      } else {
        return {
          id: response.id,
          storeID: response.store_id,
          displayName: response.display_name,
          description: response.description,
          genre1: response.genre1,
          genre2: response.genre2,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        };
      }
    },

    // タグの更新
    updateTag: async (
      request: ProductAPI['updateTag']['request'],
    ): Promise<ProductAPI['updateTag']['response']> => {
      const response = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/tag`,
        body: {
          id: request.tagID,
          display_name: request.displayName,
          description: request.description,
          genre1: request.genre1,
          genre2: request.genre2,
        },
      })();
      if (response instanceof CustomError) {
        return response;
      } else {
        return {
          id: response.id,
          storeID: response.store_id,
          displayName: response.display_name,
          description: response.description,
          genre1: response.genre1,
          genre2: response.genre2,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        };
      }
    },
    // タグの削除

    deleteTag: async (
      request: ProductAPI['deleteTag']['request'],
    ): Promise<ProductAPI['deleteTag']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/product/tag/${request.tagID}`,
      })();
    },

    // タグの一覧取得
    getTags: async (
      request: ProductAPI['getTags']['request'],
    ): Promise<ProductAPI['getTags']['response']> => {
      const params: getTagDef['request']['query'] = {
        id: request.tagID,
        genre1: request.genre1,
        includesAuto: request.includesAuto,
      };

      const response = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/tag`,
        params,
      })();
      if (response instanceof CustomError) {
        return response;
      } else {
        return response.tags.map((tag: any) => ({
          id: tag.id,
          storeID: tag.store_id,
          displayName: tag.display_name,
          description: tag.description,
          genre1: tag.genre1,
          genre2: tag.genre2,
          productsCount: tag.product_count,
          createdAt: tag.created_at,
          updatedAt: tag.updated_at,
        }));
      }
    },

    //在庫に対してタグをつける
    addTagToProduct: async (
      request: ProductAPI['addTagToProduct']['request'],
    ): Promise<ProductAPI['addTagToProduct']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/tag/attach`,
        body: {
          products: request.products.map(({ productID, tagID }) => ({
            product_id: productID,
            tag_id: tagID,
          })),
        },
      })();
    },

    //在庫についているタグを取り除く
    removeTagFromProduct: async (
      request: ProductAPI['removeTagFromProduct']['request'],
    ): Promise<ProductAPI['removeTagFromProduct']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/product/${request.productID}/tag/${request.tagID}/`,
      })();
    },

    //特価在庫への移動を行うAPI
    transferToSpecialPriceProduct: async (
      request: ProductAPI['transferToSpecialPriceProduct']['request'],
    ): Promise<ProductAPI['transferToSpecialPriceProduct']['response']> => {
      const body = {
        itemCount: request.body.itemCount,
        sellPrice: request.body.sellPrice,
        specific_auto_sell_price_adjustment:
          request.body.specificAutoSellPriceAdjustment,
        force_no_price_label: request.body.forceNoPriceLabel,
      };

      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/transfer/special-price`,
        body,
      })();
    },

    //ECの販売履歴取得
    getProductEcOrderHistory: async (
      request: ProductAPI['getProductEcOrderHistory']['request'],
    ): Promise<ProductAPI['getProductEcOrderHistory']['response']> => {
      const params: typeof getProductEcOrderHistoryDef.request.query = {
        orderBy: request.orderBy,
        take: request.take,
        skip: request.skip,
        includesSummary: request.includesSummary,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/product/${request.productID}/ec-order`,
        params,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },

    //商品マスタ関連CSVアップロード機能
    uploadCsv: async (
      request: ProductAPI['uploadCsv']['request'],
    ): Promise<ProductAPI['uploadCsv']['response']> => {
      const formData = new FormData();

      formData.append('file', request.body.file);
      if (request.body.json) {
        formData.append('json', JSON.stringify(request.body.json));
      }

      return await customFetch(
        {
          url: `/api/store/${request.storeID}/product/csv`,
          method: METHOD.POST,
          body: formData,
        },
        true,
      )();
    },

    //おちゃのこの管理画面から出力したCSVをインポートする
    uploadOchanokoCsv: async (
      request: ProductAPI['uploadOchanokoCsv']['request'],
    ): Promise<ProductAPI['uploadOchanokoCsv']['response']> => {
      const formData = new FormData();

      formData.append('file', request.body.file);

      return await customFetch(
        {
          url: `/api/store/${request.storeID}/ochanoko/product/csv`,
          method: METHOD.POST,
          body: formData,
        },
        true,
      )();
    },

    //商品画像更新機能
    updateProductImages: async (
      request: ProductAPI['updateProductImages']['request'],
    ): Promise<ProductAPI['updateProductImages']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/product/${request.productID}/images`,
        body: request.body,
      })();
    },
  };
};
