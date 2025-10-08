import { StoreAPI } from '@/api/frontend/store/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import { api } from '@/app/api/store/api';
import { registerSettlementDef } from '@/app/api/store/[store_id]/register/def';
import { activateStore } from '@/app/api/store/def';
import {
  adjustItemsWithMarketPriceGapDef,
  setTabletAllowedGenresCategoriesDef,
} from '@/app/api/store/[store_id]/item/def';
import {
  createOrUpdateShippingMethodDef,
  listShippingMethodDef,
  getEcOrderStoreContactDef,
  replyEcOrderStoreContactDef,
} from '@/app/api/store/[store_id]/ec/def';

export const storeImplement = () => {
  return {
    getAll: async (): Promise<StoreAPI['getAll']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store`,
      })();
    },
    // 店舗の詳細情報を取得
    getStoreInfo: async (
      request: StoreAPI['getStoreInfo']['request'],
    ): Promise<StoreAPI['getStoreInfo']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}`,
      })();
    },
    // 店舗アクティベート
    activateStore: async (
      request: StoreAPI['activateStore']['request'],
    ): Promise<StoreAPI['activateStore']['response']> => {
      const body: typeof activateStore.request.body = {
        code: request.code,
        password: request.password,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/activate`,
        body,
      })();
    },

    // 買取規約取得
    getTerm: async (
      request: StoreAPI['getTerm']['request'],
    ): Promise<StoreAPI['getTerm']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}`,
      })();
    },
    updateTerm: async (
      request: StoreAPI['updateTerm']['request'],
    ): Promise<StoreAPI['updateTerm']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}`,
        body: request,
      })();
    },
    //仕入れ値の設定を更新
    updateWholesalePrice: async (
      request: StoreAPI['updateWholesalePrice']['request'],
    ): Promise<StoreAPI['updateWholesalePrice']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}`,
        body: {
          use_wholesale_price_order_column:
            request.useWholesalePriceOrderColumn,
          use_wholesale_price_order_rule: request.useWholesalePriceOrderRule,
          return_wholesale_price_order_column:
            request.returnWholesalePriceOrderColumn,
          return_wholesale_price_order_rule:
            request.returnWholesalePriceOrderRule,
          wholesale_price_keep_rule: request.wholesalePriceKeepRule,
        },
      })();
    },

    // レジの詳細情報取得
    //[TODO] パスパラメータのデフォルト値1を外す
    getRegisterDetails: async (
      request: StoreAPI['getRegisterDetails']['request'],
    ): Promise<StoreAPI['getRegisterDetails']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/register/${
          request.registerID ?? 1
        }/today-summary`,
      })();
    },

    // 店舗情報更新
    updateStoreInfo: async (
      request: StoreAPI['updateStoreInfo']['request'],
    ): Promise<StoreAPI['updateStoreInfo']['response']> => {
      const body: api[1]['request']['body'] = {
        // opened: request.opened,
        display_name: request.displayName,
        leader_name: request.leaderName,
        receipt_logo_url: request.imageUrl,
        full_address: request.fullAddress,
        zip_code: request.zipCode,
        phone_number: request.phoneNumber,
        // お金の端数処理
        price_adjustment_round_rule: request.priceAdjustmentRoundRule,
        price_adjustment_round_rank: request.priceAdjustmentRoundRank,
        // SquareのロケーションID
        square_location_id: request.squareLocationId,
        // レジ点検設定
        register_cash_manage_by_separately:
          request.registerCashManageBySeparately,
        register_cash_reset_enabled: request.registerCashResetEnabled,
        register_cash_check_timing: request.registerCashCheckTiming,
      };

      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeID}`,
        body,
      })();
    },

    // レジ変動履歴取得
    listRegisterCashHistory: async (
      request: StoreAPI['listRegisterCashHistory']['request'],
    ): Promise<StoreAPI['listRegisterCashHistory']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/register/cash-history`,
        params: request.query,
      })();
    },
    // レジ締め時データ登録
    //[TODO] パスパラメータのデフォルト値1を外す
    postRegister: async (
      request: StoreAPI['postRegister']['request'],
    ): Promise<StoreAPI['postRegister']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/register/${
          request.registerID ?? 1
        }/settlement`,
        body: {
          actual_cash_price: request.actual_cash_price,
          drawerContents: request.drawerContents,
          kind: 'CLOSE', //←リリースのため応急処置 コンフリ起こしてたらこの行を削除する
        } as typeof registerSettlementDef.request.body,
      })();
      // return await fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(request),
      // }).then((res) => res.json());
    },

    // レジ締めデータ取得
    //[TODO] パスパラメータのデフォルト値1を外す
    getSettlementDetails: async (
      request: StoreAPI['getSettlementDetails']['request'],
    ): Promise<StoreAPI['getSettlementDetails']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/register/${
          request.registerID ?? 1
        }/settlement/${request.settlementID}`,
      })();
    },
    // 店舗のstatusを取得する
    getStoreStatus: async (
      request: StoreAPI['getStoreStatus']['request'],
    ): Promise<StoreAPI['getStoreStatus']['response']> => {
      const res: api['2']['response']['200'] = await customFetch({
        method: METHOD.GET,
        url: `/api/store/`,
      })();
      if (res instanceof CustomError) {
        return res;
      }
      // requestのstoreIDに合致するstoreを返す
      const store = res.find((store) => store.id === request.storeID);
      // API側からは色々帰ってくるので必要な情報に整形する
      const statusRes: StoreAPI['getStoreStatus']['response'] = {
        id: store?.id ?? 0,
        statusMessage: store?.status_message ?? null,
        statusMessageUpdatedAt: store?.status_message_updated_at ?? null,
      };
      return statusRes;
    },

    //店舗情報の取得
    getStoreInfoNormal: async (
      request: StoreAPI['getStoreInfoNormal']['request'],
    ): Promise<StoreAPI['getStoreInfoNormal']['response']> => {
      const params: api['2']['request']['query'] = {
        id: request.storeId,
        includesCorp: request.includesCorp,
        includesEcSetting: request.includesEcSetting,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store`,
        params,
      })();
    },

    //ポイント設定情報の更新
    updatePointSetting: async (
      request: StoreAPI['updatePointSetting']['request'],
    ): Promise<StoreAPI['updatePointSetting']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}`,
        body: request.body,
      })();
    },
    updateEcSetting: async (
      request: StoreAPI['updateEcSetting']['request'],
    ): Promise<StoreAPI['updateEcSetting']['response']> => {
      const body: api[1]['request']['body'] = {
        mycalinks_ec_terms_accepted: request.mycalinksEcTermsAccepted,
        mycalinks_ec_enabled: request.mycalinksEcEnabled,
        ec_setting: {
          auto_listing: request.EcSetting?.autoListing,
          auto_stocking: request.EcSetting?.autoStocking,
          auto_sell_price_adjustment:
            request.EcSetting?.autoSellPriceAdjustment,
          price_adjustment_round_rank:
            request.EcSetting?.priceAdjustmentRoundRank,
          price_adjustment_round_rule:
            request.EcSetting?.priceAdjustmentRoundRule,
          reserved_stock_number: request.EcSetting?.reservedStockNumber,
          enable_same_day_shipping: request.EcSetting?.enableSameDayShipping,
          same_day_limit_hour: request.EcSetting?.sameDayLimitHour,
          shipping_days: request.EcSetting?.shippingDays,
          closed_day: request.EcSetting?.closedDay,
          free_shipping_price: request.EcSetting?.freeShippingPrice,
          delayed_payment_method: request.EcSetting?.delayedPaymentMethod,
          notification_email: request.EcSetting?.notificationEmail,
        },
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}`,
        body,
      })();
    },

    // EC設定（おちゃのこネット）の更新
    updateOchanokoEcSetting: async (
      request: StoreAPI['updateOchanokoeEcSetting']['request'],
    ): Promise<StoreAPI['updateOchanokoeEcSetting']['response']> => {
      const body: api[1]['request']['body'] = {
        ochanoko_ec_enabled: request.ochanokoEcEnabled,
        ec_setting: {
          ochanoko_email: request.EcSetting?.ochanokoEmail,
          ochanoko_account_id: request.EcSetting?.ochanokoAccountId,
          ochanoko_password: request.EcSetting?.ochanokoPassword,
          ochanoko_api_token: request.EcSetting?.ochanokoApiToken,
        },
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.storeId}`,
        body,
      })();
    },

    getListShippingMethod: async (
      request: StoreAPI['getListShippingMethod']['request'],
    ): Promise<StoreAPI['getListShippingMethod']['response']> => {
      const params: typeof listShippingMethodDef.request.query = {
        includesFeeDefs: request.query.includesFeeDefs || undefined,
        id: request.query.id,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/ec/shipping-method`,
        params,
      })();
    },

    createShippingMethod: async (
      request: StoreAPI['createShippingMethod']['request'],
    ): Promise<StoreAPI['createShippingMethod']['response']> => {
      const body: typeof createOrUpdateShippingMethodDef.request.body = {
        id: undefined,
        display_name: request.body.displayName,
        enabled_tracking: request.body.enabledTracking,
        enabled_cash_on_delivery: request.body.enabledCashOnDelivery,
        order_number: request.body.orderNumber,
        regions:
          request.body.regions?.map((region) => ({
            region_handle: region.regionHandle,
            fee: region.fee,
          })) || undefined,
        weights:
          request.body.weights?.map((weight) => ({
            display_name: weight.displayName,
            weight_gte: weight.weightGte,
            weight_lte: weight.weightLte,
            regions:
              weight.regions?.map((region) => ({
                region_handle: region.regionHandle,
                fee: region.fee,
              })) || undefined,
          })) || undefined,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/ec/shipping-method`,
        body,
      })();
    },

    updateShippingMethod: async (
      request: StoreAPI['updateShippingMethod']['request'],
    ): Promise<StoreAPI['updateShippingMethod']['response']> => {
      const body: typeof createOrUpdateShippingMethodDef.request.body = {
        id: request.body.id,
        display_name: request.body.displayName,
        enabled_tracking: request.body.enabledTracking,
        enabled_cash_on_delivery: request.body.enabledCashOnDelivery,
        order_number: request.body.orderNumber,
        regions:
          request.body.regions?.map((region) => ({
            region_handle: region.regionHandle,
            fee: region.fee,
          })) || undefined,
        weights:
          request.body.weights?.map((weight) => ({
            display_name: weight.displayName,
            weight_gte: weight.weightGte,
            weight_lte: weight.weightLte,
            regions:
              weight.regions?.map((region) => ({
                region_handle: region.regionHandle,
                fee: region.fee,
              })) || undefined,
          })) || undefined,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/ec/shipping-method`,
        body,
      })();
    },

    deleteShippingMethod: async (
      request: StoreAPI['deleteShippingMethod']['request'],
    ): Promise<StoreAPI['deleteShippingMethod']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeId}/ec/shipping-method/${request.shippingMethodId}`,
      })();
    },

    // タブレット設定
    getTabletAllowedGenresCategories: async (
      request: StoreAPI['getTabletAllowedGenresCategories']['request'],
    ): Promise<StoreAPI['getTabletAllowedGenresCategories']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/item/tablet-allowed-genres-categories`,
      })();
    },
    setTabletAllowedGenresCategories: async (
      request: StoreAPI['setTabletAllowedGenresCategories']['request'],
    ): Promise<StoreAPI['setTabletAllowedGenresCategories']['response']> => {
      const body: typeof setTabletAllowedGenresCategoriesDef.request.body = {
        tabletAllowedGenresCategories: request.allowedGenresCategories.map(
          (item) => ({
            genre_id: item.genreId,
            category_id: item.categoryId,
            condition_option_id: item.conditionOptionId,
            specialty_id: item.specialtyId,
            no_specialty: item.noSpecialty,
            limit_count: item.limitCount,
          }),
        ),
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/tablet-allowed-genres-categories`,
        body,
      })();
    },
    replyEcOrderStoreContact: async (
      request: StoreAPI['replyEcOrderStoreContact']['request'],
    ): Promise<StoreAPI['replyEcOrderStoreContact']['response']> => {
      const body: typeof replyEcOrderStoreContactDef.request.body = {
        status: request.body.status,
        content: request.body.content,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/ec/order/${request.orderId}/contact`,
        body,
      })();
    },
    getEcOrderStoreContact: async (
      request: StoreAPI['getEcOrderStoreContact']['request'],
    ): Promise<StoreAPI['getEcOrderStoreContact']['response']> => {
      const params: typeof getEcOrderStoreContactDef.request.query = {
        order_id: request.query.orderId,
        code: request.query.code,
        kind: request.query.kind,
        skip: request.query.skip,
        take: request.query.take,
        orderBy: request.query.orderBy,
        status: request.query.status,
        includesMessages: request.query.includesMessages,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/ec/order/contact`,
        params,
      })();
    },
    //相場価格の更新履歴などを軽く取得
    getItemMarketPriceHistory: async (): Promise<
      StoreAPI['getItemMarketPriceHistory']['response']
    > => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/all/item/market-price/update-history`,
      })();
    },
    //相場価格とギャップがある商品マスタをスリムに取得する
    //adjustAllオプションをつけたら相場価格に是正するリクエストが送信される（非同期処理）
    adjustItemsWithMarketPriceGap: async (
      request: StoreAPI['adjustItemsWithMarketPriceGap']['request'],
    ): Promise<StoreAPI['adjustItemsWithMarketPriceGap']['response']> => {
      const params: typeof adjustItemsWithMarketPriceGapDef.request.query = {
        genre_id: request.query.genreId,
        category_id: request.query.categoryId,
      };
      const body: typeof adjustItemsWithMarketPriceGapDef.request.body = {
        adjustAll: request.body.adjustAll ? true : undefined,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/item/market-price/adjust-gap`,
        params,
        body,
      })();
    },
    // EC納品書取得
    getEcOrderDeliveryNote: async (
      request: StoreAPI['getEcOrderDeliveryNote']['request'],
    ): Promise<StoreAPI['getEcOrderDeliveryNote']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/ec/order/${request.orderId}/delivery-note`,
      })();
    },

    // ECのショップ情報更新
    updateEcAboutUs: async (
      request: StoreAPI['updateEcAboutUs']['request'],
    ): Promise<StoreAPI['updateEcAboutUs']['response']> => {
      const { storeId, ...body } = request;
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${storeId}/ec/about-us`,
        body,
      })();
    },
  };
};
