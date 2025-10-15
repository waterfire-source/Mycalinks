import { EcAPI } from '@/api/frontend/ec/api';
import {
  appCustomFetch,
  customFetch,
  CustomError,
  getAppUserId,
  METHOD,
} from '@/api/implement';
import {
  submitEcContactDef,
  createOrUpdateEcOrderDef,
  payEcOrderDef,
  getEcProductDef,
  getEcOrderDef,
  getEcItemDef,
  getEcOrderContactDef,
  createEcOrderContactDef,
  getEcDeckAvailableProductsDef,
  getEcOrderReceiptDef,
  getEcMessageCenterDef,
} from '@/app/api/ec/def';
import {
  getEcOrderByStoreDef,
  listShippingMethodDef,
} from '@/app/api/store/[store_id]/ec/def';
import { CustomCrypto } from '@/utils/crypto';
export const ecImplement = () => {
  return {
    // ECのアプリバナー取得
    getEcBanner: async (): Promise<EcAPI['getEcBanner']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/banner`,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // ECのジャンル取得
    getEcGenre: async (): Promise<EcAPI['getEcGenre']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/genre`,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // EC検索API
    getEcItem: async (
      request: EcAPI['getEcItem']['request'],
    ): Promise<EcAPI['getEcItem']['response']> => {
      const params: typeof getEcItemDef.request.query = {
        hasStock: request.hasStock,
        store_id: request.storeIds,
        itemCategory: request.itemCategory.join(','),
        conditionOption: request.conditionOption.join(','),
        rarity: request.rarity,
        expansion: request.expansion,
        name: request.name,
        cardnumber: request.cardNumber,
        cardseries: request.cardSeries,
        card_type: request.cardType,
        option1: request.option1,
        option2: request.option2,
        option3: request.option3,
        option4: request.option4,
        option5: request.option5,
        option6: request.option6,
        release_date: request.releaseDate,
        displaytype1: request.displayType1,
        displaytype2: request.displayType2,
        id: request.id?.join(','),
        itemGenre: request.itemGenre,
        orderBy: request.orderBy,
        take: request.take,
        skip: request.skip,
        specialty: request.specialty,
        myca_primary_pack_id: request.myca_primary_pack_id,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/item`,
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // ECお問い合わせ
    submitEcContact: async (
      request: EcAPI['submitEcContact']['request'],
    ): Promise<EcAPI['submitEcContact']['response']> => {
      const body: typeof submitEcContactDef.request.body = {
        kind: request.body.kind,
        content: request.body.content,
        myca_item_id: request.body.mycaItemId,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/api/ec/contact`,
          body,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // EC商品詳細取得API
    getEcProduct: async (
      request: EcAPI['getEcProduct']['request'],
    ): Promise<EcAPI['getEcProduct']['response']> => {
      const params: typeof getEcProductDef.request.query = {
        conditionOption: request.conditionOption,
        hasStock: request.hasStock,
        specialty: request.specialty,
      };

      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/item/${request.mycaItemId}/product`,
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // ECオーダー作成・更新API
    createOrUpdateEcOrder: async (
      request: EcAPI['createOrUpdateEcOrder']['request'],
    ): Promise<EcAPI['createOrUpdateEcOrder']['response']> => {
      const params: typeof createOrUpdateEcOrderDef.request.params = {
        includesShippingMethodCandidates:
          request.includesShippingMethodCandidates,
        includesPaymentMethodCandidates:
          request.includesPaymentMethodCandidates,
      };
      const body: typeof createOrUpdateEcOrderDef.request.body = {
        code: request.body.code,
        shipping_address_prefecture: request.body.shippingAddressPrefecture,
        cart_stores: request.body.cartStores.map((cartStore) => ({
          store_id: cartStore.storeId,
          shipping_method_id: cartStore.shippingMethodId,
          products: cartStore.products.map((product) => ({
            product_id: product.productId,
            original_item_count: product.originalItemCount,
          })),
        })),
      };
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/api/ec/order`,
          params,
          body,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // 顧客側、ECオーダー注文確定
    payEcOrder: async (
      request: EcAPI['payEcOrder']['request'],
    ): Promise<EcAPI['payEcOrder']['response']> => {
      const body: typeof payEcOrderDef.request.body = {
        payment_method: request.body.paymentMethod,
        total_price: request.body.totalPrice,
        card_id: request.body.cardId,
        convenience_code: request.body.convenienceCode,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/api/ec/order/${request.orderId}/pay`,
          body,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // 顧客側、ECオーダー取得API
    getEcOrder: async (
      request: EcAPI['getEcOrder']['request'],
      noToken: boolean = false, // 明示的にトークンを載せないことを指定するフラグ
    ): Promise<EcAPI['getEcOrder']['response']> => {
      const params: typeof getEcOrderDef.request.query = {
        code: request.code,
        status: request.status,
        id: request.id,
        includesInsufficientProducts: request.includesInsufficientProducts,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/order`,
          params,
        },
        'EC',
        noToken,
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // アプリアカウント情報取得
    getAppAccountInfo: async (): Promise<
      EcAPI['getAppAccountInfo']['response']
    > => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/user/account/`,
          params: {
            user: await getAppUserId(),
          },
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * アプリログインを行うログイン後に自動的にトークンを格納する
     * @params email: メールアドレス
     * @params password: パスワード（平文）
     *
     * @returns appUserId: 取得できたアプリユーザーID
     */
    appLogin: async (
      request: EcAPI['appLogin']['request'],
    ): Promise<EcAPI['appLogin']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/user/account/login/`,
          body: {
            mail: request.email,
            hashed_password: request.hashedPassword,
          },
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;

      return res;
    },

    /**
     * アプリ新規会員登録
     */
    appRegister: async (
      request: EcAPI['appRegister']['request'],
    ): Promise<EcAPI['appRegister']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/user/account/signup/`,
          body: {
            mail: request.email,
            hashed_password: request.hashedPassword,
          },
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;

      return res;
    },

    /**
     * アプリ会員情報修正
     * @params 修正する情報
     */
    updateAppAccountInfo: async (
      request: EcAPI['updateAppUserInfo']['request'],
    ): Promise<EcAPI['updateAppUserInfo']['response']> => {
      if (request.password) {
        request.password = CustomCrypto.sha256(request.password);
      }

      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/user/account/edit/`,
          body: {
            props: {
              user: await getAppUserId(),
            },
            values: {
              display_name: request.displayName,
              birthday: request.birthday,
              gender: request.gender,
              career: request.career,
              full_name: request.fullName,
              full_name_ruby: request.fullNameRuby,
              phone_number: request.phoneNumber,
              password: request.password,
              address: request.address,
              address2: request.address2,
              city: request.city,
              prefecture: request.prefecture,
              building: request.building,
              zip_code: request.zipCode,
              device_id: request.deviceId,
              mail: request.mail,
            },
          },
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },
    /**
     * アプリの設定定数を取得する
     * MycaアプリのAPIから設定定数データを取得する
     */
    getAppSettingConstants: async () => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/setting/constant`,
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * 商品オプションを取得する
     * MycaアプリのAPIから特定の条件に基づいて商品オプションデータを取得する
     * @param genre - ジャンルID
     * @param itemType - 商品タイプ
     * @param kindLabel - オプション種類のラベル
     * @returns 商品オプション情報の配列またはエラー
     */
    getItemOption: async (
      genre: string,
      itemType: string,
      kindLabel: string,
    ) => {
      const params = new URLSearchParams({
        genre,
        item_type: itemType,
        kind_label: kindLabel,
      });

      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/item/option/?${params}`,
        },
        'MYCA_APP_API',
      );

      if (res instanceof CustomError) throw res;
      return res;
    },
    /**
     * デッキに含まれる商品のうち、在庫があるものを取得
     */
    getEcDeckAvailableProducts: async (
      request: EcAPI['getEcDeckAvailableProducts']['request'],
    ): Promise<EcAPI['getEcDeckAvailableProducts']['response']> => {
      const params: typeof getEcDeckAvailableProductsDef.request.query = {
        deckId: request.deckId,
        code: request.code,
        anyRarity: request.anyRarity,
        anyCardnumber: request.anyCardnumber,
        conditionOption: request.conditionOption,
        priorityOption: request.priorityOption,
      };

      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/item/deck-available-products`,
          params,
        },
        'EC',
      );

      if (res instanceof CustomError) throw res;
      return res;
    },
    getEcOrderByStore: async (
      request: EcAPI['getEcOrderByStore']['request'],
    ): Promise<EcAPI['getEcOrderByStore']['response']> => {
      const params: typeof getEcOrderByStoreDef.request.query = {
        orderBy: request.orderBy,
        id: request.id,
        status: request.status,
        order_payment_method: request.order_payment_method,
        shipping_method_id: request.shipping_method_id,
        take: request.take,
        skip: request.skip,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/ec/order`,
        params,
      })();
    },
    updateEcOrderByStore: async (
      request: EcAPI['updateEcOrderByStore']['request'],
    ): Promise<EcAPI['updateEcOrderByStore']['response']> => {
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/store/${request.store_id}/ec/order/${request.order_id}`,
        body: request.body,
      })();
    },
    listShippingMethod: async (
      request: EcAPI['listShippingMethod']['request'],
    ): Promise<EcAPI['listShippingMethod']['response']> => {
      const params: typeof listShippingMethodDef.request.query = {
        id: request.id,
        includesFeeDefs: request.includesFeeDefs === true ? true : undefined,
      };
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.store_id}/ec/shipping-method`,
        params,
      })();
    },

    //EC全出品
    publishAllProductsToEc: async (
      request: EcAPI['publishAllProductsToEc']['request'],
    ): Promise<EcAPI['publishAllProductsToEc']['response']> => {
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/ec/publish-all-products`,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    // ECオーダーコンタクト取得API
    getEcOrderContact: async (
      request: EcAPI['getEcOrderContact']['request'],
    ): Promise<EcAPI['getEcOrderContact']['response']> => {
      const params: typeof getEcOrderContactDef.request.query = {
        code: request.code,
        skip: request.skip,
        take: request.take,
        includesMessages: request.includesMessages || undefined,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/order/contact`,
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // ECオーダー領収書発行API
    getEcOrderReceipt: async (
      request: EcAPI['getEcOrderReceipt']['request'],
    ): Promise<EcAPI['getEcOrderReceipt']['response']> => {
      const params: typeof getEcOrderReceiptDef.request.query = {
        store_id: request.storeId,
        customer_name: request.customerName,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/order/${request.orderId}/receipt`,
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    // ECオーダーコンタクト作成API
    createEcOrderContact: async (
      request: EcAPI['createEcOrderContact']['request'],
    ): Promise<EcAPI['createEcOrderContact']['response']> => {
      const body: typeof createEcOrderContactDef.request.body = {
        code: request.body.code,
        kind: request.body.kind,
        title: request.body.title,
        content: request.body.content,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/api/ec/order/contact`,
          body,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * パスワード再発行API
     */
    forgetPassword: async (
      request: EcAPI['forgetPassword']['request'],
    ): Promise<EcAPI['forgetPassword']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/user/account/forget-password/`,
          body: request,
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * パスワード変更API
     */
    changePassword: async (
      request: EcAPI['changePassword']['request'],
    ): Promise<EcAPI['changePassword']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `user/account/change-password/`,
          body: request,
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * EC下書きカート取得API
     */
    getEcDraftCart: async (
      request: EcAPI['getEcDraftCart']['request'],
    ): Promise<EcAPI['getEcDraftCart']['response']> => {
      const params = {
        code: request.code,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: '/api/ec/order/draft-cart',
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    //ECの在庫別取引一覧
    listItemWithEcOrder: async (
      request: EcAPI['listItemWithEcOrder']['request'],
    ): Promise<EcAPI['listItemWithEcOrder']['response']> => {
      const params = {
        display_name: request.displayName,
        item_id: request.itemId,
        cardnumber: request.cardNumber,
        rarity: request.rarity,
        genre_id: request.genreId,
        orderCreatedAtGte: request.orderCreatedAtGte,
        orderCreatedAtLt: request.orderCreatedAtLt,
        orderBy: request.orderBy,
        take: request.take,
        skip: request.skip,
        includesSummary: request.includesSummary,
        includesEcOrders: request.includesEcOrders,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/item/ec-order`,
        params,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * ECユーザークレジットカード取得API
     */
    getEcUserCreditCard: async (): Promise<
      EcAPI['getEcUserCreditCard']['response']
    > => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: '/api/ec/user/credit-card',
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * ECユーザークレジットカード登録API
     */
    registerEcUserCreditCard: async (
      request: EcAPI['registerEcUserCreditCard']['request'],
    ): Promise<EcAPI['registerEcUserCreditCard']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: '/api/ec/user/credit-card',
          body: request,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * ECメッセージセンター既読API
     */
    readEcMessageCenter: async (
      request: EcAPI['readEcMessageCenter']['request'],
    ): Promise<EcAPI['readEcMessageCenter']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.POST,
          url: `/api/ec/message-center/${request.message_id}/read`,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * ECメッセージセンター取得API
     */
    getEcMessageCenter: async (
      request: EcAPI['getEcMessageCenter']['request'],
    ): Promise<EcAPI['getEcMessageCenter']['response']> => {
      const params: typeof getEcMessageCenterDef.request.query = {
        id: request.id,
        take: request.take,
        skip: request.skip,
      };
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/api/ec/message-center`,
          params,
        },
        'EC',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },

    /**
     * EC店舗の紹介文を取得
     */
    getEcStoreAboutUs: async (
      request: EcAPI['getEcStoreAboutUs']['request'],
    ): Promise<EcAPI['getEcStoreAboutUs']['response']> => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/ec/store/${request.ecStoreId}/about-us`,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
