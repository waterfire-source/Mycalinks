import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';

import {
  ConditionOptionHandle,
  EcOrderCartStoreStatus,
  EcOrderContactStatus,
  EcOrderStatus,
  EcPaymentMethod,
  EcShippingCompany,
  EcBannerPlace,
  SpecialtyHandle,
} from '@prisma/client';
import { defOrderBy, defPagination } from '../../generator/util';
import {
  CONVENIENCE_CODE,
  Ec_About_UsSchema,
  Ec_BannerSchema,
  Ec_Message_CenterSchema,
  Ec_Order_Cart_StoreSchema,
  Ec_OrderSchema,
  Ec_SettingSchema,
  Gmo_Credit_CardSchema,
  GmoCashType,
  Item_GenreSchema,
  Product_ImageSchema,
  ProductSchema,
  Shipping_MethodSchema,
  StoreSchema,
} from 'backend-core';

extendZodWithOpenApi(z);

// ==========================================================================
// Banner APIs
// ==========================================================================

/**
 * ECアプリバナー取得API
 */
export const getEcBannerApi = {
  method: ApiMethod.GET,
  path: '/ec/banner',
  summary: 'ECアプリバナー取得',
  description: 'ECアプリに表示するバナー情報を取得する',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      place: z.nativeEnum(EcBannerPlace).optional().describe('バナーの位置'),
    }),
  },
  response: z.object({
    banners: z
      .array(
        z.object({
          place: z.nativeEnum(EcBannerPlace).describe('バナーの位置'),
          image_url: z.string().describe('バナー画像URL'),
          url: z.string().describe('バナークリック時のリンク先URL'),
        }),
      )
      .describe('バナー情報のリスト'),
  }),
  error: {},
} satisfies BackendApiDef;

// ==========================================================================
// Genre APIs
// ==========================================================================

/**
 * ECジャンル取得API
 */
export const getEcGenreApi = {
  method: ApiMethod.GET,
  path: '/ec/genre',
  summary: 'ECジャンル取得',
  description: '出品があるジャンルのみを取得する',
  cache: 180, // 3分間有効
  privileges: {
    role: [apiRole.everyone],
  },
  request: {},
  response: z.object({
    genres: z
      .array(
        z.object({
          id: z.number().describe('ジャンルID'),
          sort_order: z.number().describe('表示順'),
          name: z.string().describe('ジャンル名'),
          icon_name: z.string().nullable().describe('アイコン名'),
          image_url: z.string().nullable().describe('画像URL'),
          category_handles: z.array(z.string()).describe('カテゴリーハンドル'),
          is_enabled: z.boolean().describe('有効かどうか'),
          updated_at: z.date().describe('更新日時'),
        }),
      )
      .describe('ジャンル情報のリスト'),
  }),
  error: {},
} satisfies BackendApiDef;

// ==========================================================================
// Item APIs
// ==========================================================================

// ECのアイテム検索API定義
export const getEcItemApi = {
  summary: 'EC用の商品検索API',
  description: 'ECサイト用の商品検索APIで、複数の検索条件に対応',
  method: ApiMethod.GET,
  path: '/ec/item',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      hasStock: z.boolean().optional().describe('在庫があるもののみ表示するか'),
      store_id: z
        .string()
        .optional()
        .describe('ストアID（カンマ区切りで複数指定可）'),
      itemCategory: z
        .string()
        .optional()
        .describe('商品カテゴリ（カンマ区切りで複数指定可）'),
      conditionOption: z
        .string()
        .optional()
        .describe('商品状態（カンマ区切りで複数指定可）'),
      specialty: z
        .string()
        .optional()
        .describe('特殊状態（カンマ区切りで複数指定可）'),
      itemGenre: z.string().describe('商品ジャンル'),
      rarity: z
        .string()
        .optional()
        .describe('レアリティ（部分一致で%使用可、カンマ区切りで複数指定可）'),
      expansion: z
        .string()
        .optional()
        .describe(
          'エキスパンション（部分一致で%使用可、カンマ区切りで複数指定可）',
        ),
      name: z.string().optional().describe('商品名やキーワード（部分一致）'),
      cardnumber: z
        .string()
        .optional()
        .describe('カード番号（部分一致で%使用可、カンマ区切りで複数指定可）'),
      cardseries: z
        .string()
        .optional()
        .describe(
          'カードシリーズ（部分一致で%使用可、カンマ区切りで複数指定可）',
        ),
      card_type: z
        .string()
        .optional()
        .describe(
          'カードタイプ（部分一致で%使用可、カンマ区切りで複数指定可）',
        ),
      option1: z
        .string()
        .optional()
        .describe('オプション1（部分一致で%使用可、カンマ区切りで複数指定可）'),
      option2: z
        .string()
        .optional()
        .describe('オプション2（部分一致で%使用可、カンマ区切りで複数指定可）'),
      option3: z
        .string()
        .optional()
        .describe('オプション3（部分一致で%使用可、カンマ区切りで複数指定可）'),
      option4: z
        .string()
        .optional()
        .describe('オプション4（部分一致で%使用可、カンマ区切りで複数指定可）'),
      option5: z
        .string()
        .optional()
        .describe('オプション5（部分一致で%使用可、カンマ区切りで複数指定可）'),
      option6: z
        .string()
        .optional()
        .describe('オプション6（部分一致で%使用可、カンマ区切りで複数指定可）'),
      release_date: z
        .string()
        .optional()
        .describe('リリース日（部分一致で%使用可、カンマ区切りで複数指定可）'),
      displaytype1: z
        .string()
        .optional()
        .describe('表示タイプ1（部分一致で%使用可、カンマ区切りで複数指定可）'),
      displaytype2: z
        .string()
        .optional()
        .describe('表示タイプ2（部分一致で%使用可、カンマ区切りで複数指定可）'),
      myca_primary_pack_id: z
        .string()
        .optional()
        .describe('封入パックID カンマ区切りで複数指定可'),
      id: z.string().optional().describe('商品ID（カンマ区切りで複数指定可）'),
      ...defPagination(),
      ...defOrderBy({
        actual_ec_sell_price: '価格',
      }),
    }),
  },
  response: z.object({
    items: z
      .array(
        z.object({
          // Mycaアイテム情報
          id: z.number().describe('商品ID'),
          cardname: z.string().describe('商品名'),
          full_image_url: z.string().nullable().describe('商品画像URL'),
          rarity: z.string().nullable().describe('レアリティ'),
          expansion: z.string().nullable().describe('エキスパンション'),
          cardnumber: z.string().nullable().describe('カード番号'),
          cardseries: z.string().nullable().describe('カードシリーズ'),
          type: z.string().nullable().describe('カードタイプ'),
          option1: z.string().nullable().describe('オプション1'),
          option2: z.string().nullable().describe('オプション2'),
          option3: z.string().nullable().describe('オプション3'),
          option4: z.number().nullable().describe('オプション4'),
          option5: z.string().nullable().describe('オプション5'),
          option6: z.string().nullable().describe('オプション6'),
          release_date: z.string().nullable().describe('リリース日'),
          displaytype1: z.string().nullable().describe('表示タイプ1'),
          displaytype2: z.string().nullable().describe('表示タイプ2'),
          keyword: z.string().nullable().describe('キーワード'),
          genre_id: z.number().nullable().describe('ジャンルID'),

          // 商品の出品情報
          productCount: z.number().describe('出品数'),
          topPosProduct: z
            .object({
              id: z.number().describe('出品ID'),
              condition_option_handle: z
                .string()
                .describe('商品状態のハンドル名'),
              actual_ec_sell_price: z.number().describe('EC販売価格（税込）'),
              ec_stock_number: z.number().describe('EC在庫数'),
            })
            .describe('状態が最も良い商品'),
        }),
      )
      .describe('検索結果商品リスト'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

/**
 * EC商品個別取得API
 */
export const getEcProductApi = {
  method: ApiMethod.GET,
  path: '/ec/item/{myca_item_id}/product',
  summary: 'EC用の商品詳細を取得する',
  description: '特定の商品に関する出品情報を取得する',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    params: z.object({
      myca_item_id: z.number().describe('Myca商品ID'),
    }),
    query: z.object({
      conditionOption: z
        .nativeEnum(ConditionOptionHandle)
        .optional()
        .describe('商品状態'),
      hasStock: z.boolean().optional().describe('在庫があるもののみ表示するか'),
      specialty: z
        .string()
        .optional()
        .describe('特殊状態（カンマ区切りで複数指定可）'),
    }),
  },
  response: z.object({
    mycaItem: z.any().describe('Myca商品情報'),
    products: z
      .array(
        z.object({
          id: z.number().describe('出品ID'),
          ec_stock_number: z.number().describe('EC在庫数'),
          actual_ec_sell_price: z.number().describe('EC販売価格（税込）'),
          store: z.object({
            id: z.number().describe('店舗ID'),
            display_name: z.string().describe('店舗名'),
            ec_setting: z.object({
              enable_same_day_shipping:
                Ec_SettingSchema.shape.enable_same_day_shipping.describe(
                  '即日発送が有効かどうか',
                ),
              same_day_limit_hour: z
                .number()
                .nullable()
                .describe('即日発送の期限時間'),
              shipping_days: z
                .number()
                .nullable()
                .describe('発送までの日数（営業日）'),
              free_shipping: z.boolean().describe('送料無料かどうか'),
              free_shipping_price: z
                .number()
                .nullable()
                .describe('送料無料の金額'),
            }),
          }),
          condition_option: z.object({
            handle: z.string().describe('商品状態のハンドル'),
          }),
          specialty: z
            .object({
              handle: z
                .nativeEnum(SpecialtyHandle)
                .describe('特殊状態のハンドル'),
            })
            .nullable(),
          images: z
            .array(
              z.object({
                image_url: Product_ImageSchema.shape.image_url,
                description: Product_ImageSchema.shape.description,
                order_number: Product_ImageSchema.shape.order_number,
              }),
            )
            .describe('画像情報'),
          description: z.string().nullable().describe('商品説明'),
        }),
      )
      .describe('商品の出品情報リスト'),
  }),
  error: {},
} satisfies BackendApiDef;

export const EcAvailableProductsSchema = z
  .array(
    z.object({
      id: z.number().describe('在庫ID'),
      ec_stock_number: z.number().describe('EC用の在庫数'),
      actual_ec_sell_price: z.number().describe('EC用の税込価格').nullable(),
      store: z.object({
        id: z.number().describe('ストアID'),
        display_name: z.string().describe('ストア名').nullable(),
        ec_setting: z
          .object({
            same_day_limit_hour: z
              .number()
              .nullable()
              .describe('即時発送をする時、期限の時間'),
            shipping_days: z
              .number()
              .nullable()
              .describe('発送までにかかる営業日数'),
          })
          .nullable(),
      }),
      condition_option: z
        .object({
          handle: z.string().describe('状態ハンドル').nullable(),
        })
        .nullable(),
    }),
  )
  .describe('購入可能なPOS上のProduct情報');

/**
 * EC商品取得API (デッキ関連)
 */
export const getEcDeckAvailableProductsApi = {
  method: ApiMethod.GET,
  path: '/ec/item/deck-available-products',
  summary: 'デッキで利用可能な在庫を取得する',
  description: 'デッキで使用されているカードの在庫情報を取得する',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      deckId: z
        .number()
        .optional()
        .describe('デッキID（ポケカ公式デッキ以外の時に指定する）'),
      code: z
        .string()
        .optional()
        .describe('デッキコード（ポケカ公式デッキの時は指定する）'),
      anyRarity: z
        .boolean()
        .describe('レアリティ問わず trueだったら問わないことになる'),
      anyCardnumber: z
        .boolean()
        .describe('型番問わず trueだったら問わないことになる'),
      conditionOption: z
        .string()
        .optional()
        .describe('状態 カンマ区切りで指定 問わない時は何もしていしなくてOK'),
      priorityOption: z
        .enum(['COST', 'SHIPPING_DAYS'])
        .optional()
        .describe('優先するオプション'),
    }),
  },
  response: z.object({
    deckItems: z
      .array(
        z.object({
          mycaItem: z.any().describe('Mycaアイテム情報'),
          needItemCount: z.number().describe('必要な枚数'),
          availableMycaItems: z
            .array(z.any())
            .describe('この条件だと代用可能なアイテム'),
          availableProducts: EcAvailableProductsSchema,
        }),
      )
      .describe('このデッキで必要なアイテム'),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * EC商品取得API (コレクション関連)
 */
export const getEcCollectionAvailableProductsApi = {
  method: ApiMethod.GET,
  path: '/ec/item/collection-available-products',
  summary: 'コレクションで利用可能な在庫を取得する',
  description: 'コレクションで使用されているカードの在庫情報を取得する',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      collectionId: z.number().describe('コレクションID'),
    }),
  },
  response: z.object({
    collectionItems: z
      .array(
        z.object({
          mycaItem: z.any().describe('Mycaアイテム情報'),
          availableProducts: EcAvailableProductsSchema,
        }),
      )
      .describe('このコレクションで必要なアイテム'),
  }),
  error: {},
} satisfies BackendApiDef;

// ==========================================================================
// Contact APIs
// ==========================================================================

/**
 * ECお問い合わせAPI
 */
export const submitEcContactApi = {
  method: ApiMethod.POST,
  path: '/ec/contact',
  summary: 'ECお問い合わせ送信',
  description: 'ECアプリからのお問い合わせを送信する',
  privileges: {
    role: [apiRole.everyone, apiRole.mycaUser],
  },
  request: {
    body: z.object({
      kind: z.string().describe('お問い合わせの種類'),
      content: z.string().describe('お問合せ本文'),
      myca_item_id: z.number().optional().describe('MycaアプリのアイテムID'),
    }),
  },
  response: z.object({
    ok: z.string().describe('お問い合わせが送信されました'),
  }),
  error: {},
} satisfies BackendApiDef;

// ==========================================================================
// Order APIs
// ==========================================================================

/**
 * ECオーダー作成・更新API
 */
export const createOrUpdateEcOrderApi = {
  method: ApiMethod.POST,
  path: '/ec/order',
  summary: 'ECオーダー作成・更新',
  description: '顧客側でのECオーダー作成・更新API（確定は別のAPI）',
  privileges: {
    role: [apiRole.everyone, apiRole.mycaUser, apiRole.pos],
  },
  request: {
    query: z.object({
      includesShippingMethodCandidates: z
        .boolean()
        .optional()
        .describe(
          '配送方法候補を含めるかどうか（支払い方法を選択する前のみ） 配送方を指定していない場合、適当に一つ選ばれる',
        ),
      includesPaymentMethodCandidates: z
        .boolean()
        .optional()
        .describe(
          '支払い方法の候補を取得するかどうか（配送方法を選択した後のみ）',
        ),
    }),
    body: z.object({
      code: z
        .string()
        .optional()
        .describe('既存のカートを更新する場合、オーダーコードを指定'),
      shipping_address_prefecture: z
        .string()
        .optional()
        .describe('お届け先の県'),
      cart_stores: z.array(
        z.object({
          store_id: z.number().describe('ストアID'),
          shipping_method_id: z.number().optional().describe('配送方法ID'),
          products: z.array(
            z.object({
              product_id: z.number().describe('在庫ID'),
              original_item_count: z.number().describe('希望個数'),
            }),
          ),
        }),
      ),
    }),
  },
  response: z.object({
    id: z.number().describe('オーダーID'),
    code: z.string().describe('オーダーコード'),
    customer_name: z.string().nullable().describe('顧客名'),
    shipping_address: z.string().nullable().describe('お届け先住所'),
    shipping_address_prefecture: z.string().describe('お届け先の県'),
    shipping_total_fee: z.number().describe('送料合計'),
    total_price: z.number().describe('合計金額'),
    paymentMethodCandidates: z
      .array(z.nativeEnum(EcPaymentMethod))
      .optional()
      .describe('利用できる決済方法'),
    cart_stores: z.array(
      z.object({
        store_id: z.number().describe('ストアID'),
        total_price: z.number().describe('ストアごとの合計金額（送料も含む）'),
        shipping_method_id: z.number().nullable().describe('配送方法ID'),
        shipping_fee: z.number().describe('配送料'),
        shippingMethodCandidates: z
          .array(
            z.object({
              id: z.number().describe('配送方法ID'),
              display_name: z.string().describe('配送方法名'),
              fee: z.number().describe('配送料'),
              shipping_days: z.number().describe('発送日数'),
            }),
          )
          .optional()
          .describe('配送方法候補'),
        products: z.array(
          z.object({
            product_id: z.number().describe('在庫ID'),
            total_unit_price: z.number().describe('単価'),
            original_item_count: z.number().describe('希望個数'),
            product: z.object({
              condition_option: z.object({
                handle: z.string().describe('状態ハンドル'),
              }),
              item: z.object({
                myca_item_id: z.number().describe('Myca上のアイテムID'),
              }),
              description: z.string().nullable().describe('商品説明'),
              images: z.array(
                z.object({
                  image_url: z.string().describe('画像URL'),
                  description: z.string().describe('画像説明'),
                  order_number: z.number().describe('画像順番'),
                }),
              ),
              specialty: z
                .object({
                  handle: z.string().describe('特殊状態ハンドル'),
                })
                .nullable(),
            }),
          }),
        ),
      }),
    ),
    insufficientProducts: z
      .array(
        z.object({
          product_id: z.number().describe('在庫ID'),
          insufficient_count: z.number().describe('不足している個数'),
          item: z.object({
            id: z.number().describe('MycaアイテムID'),
            cardname: z.string().describe('カード名'),
            rarity: z.string().nullable().describe('レアリティ'),
            expansion: z.string().nullable().describe('エキスパンション'),
            cardnumber: z.string().nullable().describe('型番'),
            full_image_url: z.string().nullable().describe('画像URL'),
          }),
          condition_option: z.object({
            handle: z.string().describe('状態ハンドル'),
          }),
        }),
      )
      .optional()
      .describe('不足在庫情報'),
    notExistProducts: z
      .array(
        z.object({
          product_id: z.number().describe('在庫ID'),
        }),
      )
      .optional()
      .describe('存在しなかった在庫情報'),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * EC下書きカート取得API
 */
export const getEcDraftCartApi = {
  method: ApiMethod.GET,
  path: '/ec/order/draft-cart',
  summary: 'EC下書きカート取得',
  description: 'EC下書きカートの情報を取得する',
  privileges: {
    role: [apiRole.everyone, apiRole.mycaUser, apiRole.pos],
  },
  request: {
    query: z.object({
      code: z.string().optional().describe('オーダーコード'),
    }),
  },
  response: z.object({
    order: z
      .object({
        id: z.number().describe('オーダーID'),
        code: z.string().describe('オーダーコード'),
        totalItemCount: z.number().describe('合計商品数'),
      })
      .nullable()
      .describe('なかったらnull'),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * ECオーダー取得API
 */
export const getEcOrderApi = {
  method: ApiMethod.GET,
  path: '/ec/order',
  summary: 'ECオーダー取得',
  description: '顧客側でのECオーダー取得API',
  privileges: {
    role: [apiRole.mycaUser, apiRole.everyone],
  },
  request: {
    query: z.object({
      code: z
        .string()
        .optional()
        .describe('オーダーコード（ログインしていない場合必須）'),
      status: z
        .nativeEnum(EcOrderStatus)
        .optional()
        .describe('オーダーステータス'),
      id: z.number().optional().describe('オーダーID'),
      includesInsufficientProducts: z
        .boolean()
        .optional()
        .describe('不足在庫を含めるかどうか（下書き時のみ）'),
    }),
  },
  response: z.object({
    orders: z.array(
      z.object({
        id: z.number().describe('オーダーID'),
        code: z.string().describe('オーダーコード'),
        status: z.nativeEnum(EcOrderStatus).describe('ステータス'),
        payment_method: z
          .nativeEnum(EcPaymentMethod)
          .nullable()
          .describe('支払い方法'),
        payment_info: z
          .record(z.unknown())
          .describe('支払い情報 コンビニの支払い番号や銀行振込の口座番号など'),
        customer_name: z.string().nullable().describe('顧客名'),
        shipping_address: z.string().nullable().describe('お届け先住所'),
        shipping_address_prefecture: z.string().describe('お届け先の県'),
        shipping_total_fee: z.number().describe('送料合計'),
        total_price: z.number().describe('合計金額'),
        ordered_at: z.date().nullable().describe('注文日時'),
        insufficientProducts: z
          .array(
            z.object({
              product_id: z.number().describe('在庫ID'),
              insufficient_count: z.number().describe('不足している個数'),
              item: z.object({
                id: z.number().describe('MycaアイテムID'),
                cardname: z.string().describe('カード名'),
                rarity: z.string().nullable().describe('レアリティ'),
                expansion: z.string().nullable().describe('エキスパンション'),
                cardnumber: z.string().nullable().describe('型番'),
                full_image_url: z.string().nullable().describe('画像URL'),
              }),
              condition_option: z.object({
                handle: z.string().describe('状態ハンドル'),
              }),
            }),
          )
          .optional()
          .describe('不足在庫情報'),
        notExistProducts: z
          .array(
            z.object({
              product_id: z.number().describe('在庫ID'),
            }),
          )
          .optional()
          .describe('存在しなかった在庫情報'),
        cart_stores: z.array(
          z.object({
            store_id: z.number().describe('ストアID'),
            store: z.object({
              display_name: z.string().describe('ストア名'),
            }),
            total_price: z
              .number()
              .describe('ストアごとの合計金額（送料も含む）'),
            shipping_method_id: z.number().nullable().describe('配送方法ID'),
            shipping_fee: z.number().describe('配送料'),
            shipping_method: z.object({
              display_name: Shipping_MethodSchema.shape.display_name,
            }),
            shipping_company: Ec_Order_Cart_StoreSchema.shape.shipping_company,
            receipt_customer_name:
              Ec_Order_Cart_StoreSchema.shape.receipt_customer_name,
            shipping_tracking_code:
              Ec_Order_Cart_StoreSchema.shape.shipping_tracking_code,
            status: z.string().describe('ステータス'),
            code: z.string().describe('オーダーコード（ストアごと）'),
            products: z.array(
              z.object({
                product_id: z.number().describe('在庫ID'),
                total_unit_price: z.number().describe('単価'),
                original_item_count: z.number().describe('希望個数'),
                item_count: z.number().describe('在庫数'),
                product: z.object({
                  ec_stock_number: z.number().describe('EC在庫数'),
                  condition_option: z.object({
                    handle: z.string().describe('状態ハンドル'),
                  }),
                  item: z.object({
                    myca_item_id: z.number().describe('Myca上のアイテムID'),
                  }),
                  description: z.string().nullable().describe('商品説明'),
                  images: z.array(
                    z.object({
                      image_url: z.string().describe('画像URL'),
                      description: z.string().describe('画像説明'),
                      order_number: z.number().describe('画像順番'),
                    }),
                  ),
                  specialty: z
                    .object({
                      handle: z.string().describe('特殊状態ハンドル'),
                    })
                    .nullable(),
                  mycaItem: z.object({
                    id: z.number().describe('MycaアイテムID'),
                    cardname: z.string().describe('カード名'),
                    rarity: z.string().nullable().describe('レアリティ'),
                    expansion: z
                      .string()
                      .nullable()
                      .describe('エキスパンション'),
                    cardnumber: z.string().nullable().describe('型番'),
                    full_image_url: z.string().nullable().describe('画像URL'),
                  }),
                }),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
  error: {},
} satisfies BackendApiDef;

export const GmoCashPaymentInfoSchema = z.object({
  cashType: z.nativeEnum(GmoCashType).describe('現金払いの種類'),
  paymentExpiryDateTime: z.string().describe('支払い期限'),
  bankTransferPaymentInformation: z
    .object({
      bankCode: z.string().describe('銀行コード'),
      bankName: z.string().describe('銀行名'),
      branchCode: z.string().describe('支店コード'),
      branchName: z.string().describe('支店名'),
      accountType: z.string().describe('口座種類'),
      accountNumber: z.string().describe('口座番号'),
      accountHolderName: z.string().describe('口座名義'),
      depositAmount: z.string().describe('入金額'),
    })
    .optional()
    .describe('銀行振込の時のみ'),
  konbiniPaymentInformation: z
    .object({
      konbiniCode: z.nativeEnum(CONVENIENCE_CODE).describe('コンビニコード'),
      confirmationNumber: z.string().describe('確認番号'),
      receiptNumber: z.string().describe('受付番号'),
    })
    .optional()
    .describe('コンビニ払いの時のみ'),
});

/**
 * ECオーダー決済API
 */
export const payEcOrderApi = {
  method: ApiMethod.POST,
  path: '/ec/order/{order_id}/pay',
  summary: 'ECオーダー決済',
  description: 'ECオーダーの決済処理を行う',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: z.object({
      order_id: z.number().describe('オーダーID'),
    }),
    body: z.object({
      payment_method: z.nativeEnum(EcPaymentMethod).describe('支払い方法'),
      // card_token: z.string().optional().describe('GMOカードトークン'),
      card_id: Gmo_Credit_CardSchema.shape.id
        .optional()
        .describe('GMOカードID'),
      convenience_code: z
        .nativeEnum(CONVENIENCE_CODE)
        .optional()
        .describe('GMOコンビニコード'),
      total_price: z
        .number()
        .describe('合計金額（単価変動時にエラーを発するため）'),
    }),
  },
  response: z.object({
    id: z.number().describe('オーダーID'),
    code: z.string().describe('オーダーコード'),
    status: z.nativeEnum(EcOrderStatus).describe('ステータス').nullable(),
    payment_method: z
      .nativeEnum(EcPaymentMethod)
      .describe('支払い方法')
      .nullable(),
    // payment_info: z.string().nullable().describe('支払い情報'),
    cashPaymentInfo: GmoCashPaymentInfoSchema.nullable(),
    cardPaymentInfo: z
      .object({
        redirectUrl: z.string().describe('リダイレクトURL（3Dセキュア）'),
      })
      .nullable(),
    customer_name: z.string().nullable().describe('顧客名'),
    shipping_address: z.string().nullable().describe('お届け先住所'),
    shipping_address_prefecture: z.string().describe('お届け先の県').nullable(),
    shipping_total_fee: z.number().describe('送料合計'),
    total_price: z.number().describe('合計金額'),
    ordered_at: z.date().nullable().describe('注文日時'),
    cart_stores: z.array(
      z.object({
        store_id: z.number().describe('ストアID'),
        store: z.object({
          display_name: z.string().describe('ストア名').nullable(),
        }),
        total_price: z.number().describe('ストアごとの合計金額（送料も含む）'),
        shipping_method_id: z.number().nullable().describe('配送方法ID'),
        shipping_fee: z.number().describe('配送料'),
        status: z.string().describe('ステータス'),
        code: z.string().describe('オーダーコード（ストアごと）'),
        products: z.array(
          z.object({
            product_id: z.number().describe('在庫ID'),
            total_unit_price: z.number().describe('単価'),
            original_item_count: z.number().describe('希望個数'),
            product: z.object({
              ec_stock_number: z.number().describe('EC在庫数'),
              condition_option: z.object({
                handle: z.string().describe('状態ハンドル').nullable(),
              }),
              description: z.string().nullable().describe('商品説明'),
              images: z.array(
                z.object({
                  image_url: z.string().describe('画像URL'),
                  description: z.string().describe('画像説明'),
                  order_number: z.number().describe('画像順番'),
                }),
              ),
              specialty: z
                .object({
                  handle: z.string().describe('特殊状態ハンドル'),
                })
                .nullable(),
              item: z.object({
                myca_item_id: z
                  .number()
                  .describe('Myca上のアイテムID')
                  .nullable(),
              }),
              mycaItem: z.object({
                id: z.number().describe('MycaアイテムID'),
                cardname: z.string().describe('カード名'),
                rarity: z.string().nullable().describe('レアリティ'),
                expansion: z.string().nullable().describe('エキスパンション'),
                cardnumber: z.string().nullable().describe('型番'),
                full_image_url: z.string().nullable().describe('画像URL'),
              }),
            }),
          }),
        ),
      }),
    ),
  }),
  error: {
    noShippingMethod: {
      status: 400,
      messageText: '決済を行う前に配送方法の指定が必要です',
    },
    noShippingAddress: {
      status: 400,
      messageText: '決済を行う前に配送先の指定が必要です',
    },
    invalidShippingMethod: {
      status: 400,
      messageText: '利用できない配送方法です',
    },
    invalidTotalPrice: {
      status: 500,
      messageText:
        '合計金額が変動しました、再度商品価格が変更された可能性があります',
    },
  },
} satisfies BackendApiDef;

/**
 * ECオーダーお問合せAPI
 */
export const createEcOrderContactApi = {
  method: ApiMethod.POST,
  path: '/ec/order/contact',
  summary: 'ECオーダーお問合せ',
  description: 'ECオーダーに関するお問い合わせを送信する',
  privileges: {
    role: [apiRole.mycaUser, apiRole.pos],
  },
  request: {
    body: z.object({
      code: z.string().describe('ストアごとのオーダーコード'),
      kind: z.string().optional().describe('お問い合わせの種類'),
      title: z.string().optional().describe('件名'),
      content: z.string().optional().describe('内容'),
    }),
  },
  response: z.object({
    ecOrderContact: z
      .object({
        id: z.number().describe('お問い合わせID'),
        order_store_id: z.number().describe('オーダーストアID'),
        kind: z.string().describe('お問い合わせの種類'),
        status: z.nativeEnum(EcOrderContactStatus).describe('ステータス'),
        last_sent_at: z.date().describe('最終送信日時'),
        messages: z
          .array(
            z.object({
              id: z.number().describe('メッセージID'),
              content: z.string().nullable().describe('内容'),
              created_at: z.date().describe('作成日時'),
              myca_user_id: z.number().nullable().describe('ユーザーID'),
              staff_account_id: z
                .number()
                .nullable()
                .describe('スタッフアカウントID'),
            }),
          )
          .describe('メッセージリスト'),
      })
      .describe('お問い合わせ情報'),
  }),
  error: {
    kindTitle: {
      status: 400,
      messageText:
        '新規お問合せではお問合せ種類と件名とメッセージ本文が必須です',
    },
  },
} satisfies BackendApiDef;

/**
 * ECオーダーお問合せ取得API
 */
export const getEcOrderContactApi = {
  method: ApiMethod.GET,
  path: '/ec/order/contact',
  summary: 'ECオーダーお問合せ取得',
  description: 'ECオーダーに関するお問い合わせを取得する',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    query: z.object({
      code: z.string().optional().describe('ストアごとのオーダーコード'),
      skip: z.number().optional().describe('スキップする件数'),
      take: z.number().optional().describe('取得する件数'),
      includesMessages: z
        .boolean()
        .optional()
        .describe('メッセージContentを含めるかどうか'),
    }),
  },
  response: z.object({
    ecOrderContacts: z
      .array(
        z.object({
          order_store: z.object({
            order: z.object({
              id: z.number().describe('オーダーID'),
              code: z.string().describe('オーダーコード'),
            }),
            code: z.string().describe('オーダーコード（店舗ごとのやつ）'),
            store: z.object({
              display_name: z.string().describe('ストア名'),
            }),
          }),
          last_sent_at: z.date().describe('最後に送信した日時'),
          myca_user_last_read_at: z.date().nullable().describe('最終既読時間'),
          kind: z.string().describe('お問い合わせの種類'),
          title: z.string().describe('件名'),
          messages: z
            .array(
              z.object({
                id: z.number().describe('メッセージID'),
                content: z.string().nullable().optional().describe('内容'),
                created_at: z.date().describe('作成日時'),
                myca_user_id: z.number().nullable().describe('ユーザーID'),
              }),
            )
            .describe('メッセージリスト'),
        }),
      )
      .describe('お問い合わせ情報リスト'),
  }),
  error: {},
} satisfies BackendApiDef;

// ==========================================================================
// Store API endpoints (prefixed with /store/[store_id])
// ==========================================================================

/**
 * ストアがECのオーダーを取得するAPI
 */
export const getEcOrderByStoreApi = {
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/order',
  summary: 'ストアがECオーダーを取得する',
  description: 'ストアがEC経由で来た注文を取得するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
    }),
    query: z.object({
      orderBy: z.string().optional().describe('ソート順（ordered_at等）'),
      id: z.number().optional().describe('注文番号（ID）'),
      status: z
        .nativeEnum(EcOrderCartStoreStatus)
        .optional()
        .describe('ステータス'),
      order_payment_method: z
        .nativeEnum(EcPaymentMethod)
        .optional()
        .describe('支払い方法'),
      shipping_method_id: z.number().optional().describe('配送方法ID'),
      ...defPagination(),
      includesSummary: z
        .boolean()
        .optional()
        .describe('合計件数を含めるかどうか'),
      ordered_at_gte: z.date().optional().describe('注文日時（開始）'),
      ordered_at_lt: z.date().optional().describe('注文日時（終了）'),
      product_display_name: z.string().optional().describe('商品名'),
      genre_id: Item_GenreSchema.shape.id.optional(),
      platform: Ec_OrderSchema.shape.platform
        .optional()
        .describe('プラットフォーム'),
    }),
  },
  response: z.object({
    storeOrders: z.array(
      z.object({
        order: z.object({
          id: z.number().describe('オーダーの注文番号'),
          payment_method: z
            .nativeEnum(EcPaymentMethod)
            .describe('支払い方法')
            .nullable(),
          myca_user_id: z
            .number()
            .nullable()
            .describe('Mycaアプリ上でのユーザーID'),
          customer_name: z
            .string()
            .describe('注文時点でのお客様の名前')
            .nullable(),
          customer_email: z
            .string()
            .describe('注文時点でのお客様のメールアドレス')
            .nullable(),
          customer_phone: z
            .string()
            .describe('注文時点でのお客様の電話番号')
            .nullable(),
          shipping_address: z
            .string()
            .describe('注文時点でのお客様の住所')
            .nullable(),
          ordered_at: z.date().describe('受注日時').nullable(),
          platform: Ec_OrderSchema.shape.platform.describe('プラットフォーム'),
        }),
        shipping_method: z
          .object({
            id: z.number().describe('配送方法ID'),
            display_name: z.string().describe('配送方法名').nullable(),
          })
          .nullable(),
        shipping_tracking_code: z.string().nullable().describe('追跡コード'),
        shipping_company: z
          .nativeEnum(EcShippingCompany)
          .nullable()
          .describe('運送会社'),
        shipping_fee: z.number().describe('配送料（税込）').nullable(),
        total_price: z.number().describe('この店での合計金額'),
        status: z
          .nativeEnum(EcOrderCartStoreStatus)
          .describe('この店での処理のステータス'),
        read: z.boolean().describe('店がこの注文を確認したかどうか'),
        code: z.string().describe('オーダーコード（ストアごと）'),
        products: z.array(
          z.object({
            id: z.number().describe('カート自体のID'),
            displayNameWithMeta: z
              .string()
              .optional()
              .describe('型番とかを含む名前'),
            product: z.object({
              id: z.number().describe('商品ID'),
            }),
            total_unit_price: z.number().describe('最終的な単価'),
            original_item_count: z.number().describe('注文された時点での個数'),
            item_count: z.number().describe('実際に発送する個数'),
          }),
        ),
      }),
    ),
    summary: z
      .object({
        totalCount: z.number().describe('合計件数'),
      })
      .optional(),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * ストアがECのオーダーを変更するAPI
 */
export const updateEcOrderByStoreApi = {
  method: ApiMethod.PUT,
  path: '/store/{store_id}/ec/order/{order_id}',
  summary: 'ストアがECオーダーを更新する',
  description: 'ストアがEC経由で来た注文の情報を更新するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
      order_id: z.number().describe('オーダーID'),
    }),
    body: z.object({
      read: z.boolean().optional().describe('既読をつける'),
      status: z
        .nativeEnum(EcOrderCartStoreStatus)
        .optional()
        .describe('ステータスを変更'),
      cancelReason: z.string().optional().describe('キャンセル/欠品理由'),
      shipping_tracking_code: z.string().optional().describe('追跡番号'),
      shipping_company: z
        .nativeEnum(EcShippingCompany)
        .optional()
        .describe('運送会社'),
      products: z
        .array(
          z.object({
            product_id: z.number().describe('対象の在庫ID'),
            item_count: z.number().describe('実際に発送できる数を入力'),
          }),
        )
        .optional()
        .describe('欠品がある時はここを動かす'),
    }),
  },
  response: z.object({
    storeOrder: z.object({
      order_id: z.number(),
      store_id: z.number(),
      shipping_method_id: z.number().nullable(),
      shipping_tracking_code: z.string().nullable(),
      shipping_company: z.nativeEnum(EcShippingCompany).nullable(),
      shipping_fee: z.number(),
      total_price: z.number(),
      status: z.nativeEnum(EcOrderCartStoreStatus),
      read: z.boolean(),
      code: z.string(),
      products: z.array(
        z.object({
          id: z.number(),
          product_id: z.number(),
          total_unit_price: z.number(),
          original_item_count: z.number(),
          item_count: z.number(),
        }),
      ),
    }),
  }),
  error: {
    trackingCodeTiming: {
      status: 400,
      messageText: '追跡番号、運送会社は発送待機中にのみつけることができます',
    },
    waitForShippingTiming: {
      status: 400,
      messageText: '発送待機中にできるのは発送準備待ちの時のみです',
    },
    completedTiming: {
      status: 400,
      messageText: '発送完了にできるのは発送待機中の時のみです',
    },
    needShippingCompany: {
      status: 400,
      messageText: '発送完了にするには運送会社を登録する必要があります',
    },
    cancelAndProducts: {
      status: 400,
      messageText: 'キャンセルと同時に欠品登録することはできません',
    },
    invalidStatus: {
      status: 400,
      messageText: 'このステータスは指定できません',
    },
    missingItemTiming: {
      status: 400,
      messageText: '欠品登録できるのは発送準備待ちの時のみです',
    },
    alreadyMissingItem: {
      status: 400,
      messageText: 'この注文ではすでに欠品登録されています',
    },
    invalidMissingItemCount: {
      status: 400,
      messageText: '欠品報告数の指定が不適切です',
    },
  },
} satisfies BackendApiDef;

/**
 * ECオーダーお問い合わせ返信API
 */
export const replyEcOrderStoreContactApi = {
  method: ApiMethod.POST,
  path: '/store/{store_id}/ec/order/{order_id}/contact',
  summary: 'ECお問い合わせに返信する',
  description: 'ECオーダーに関するお問い合わせに返信するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
      order_id: z.number().describe('オーダーID'),
    }),
    body: z.object({
      status: z
        .nativeEnum(EcOrderContactStatus)
        .optional()
        .describe('ステータス'),
      content: z
        .string()
        .optional()
        .describe(
          '内容 これをundefinedにして、ステータスだけ更新することができる',
        ),
    }),
  },
  response: z.object({
    thisOrderContact: z.object({
      id: z.number(),
      kind: z.string(),
      status: z.nativeEnum(EcOrderContactStatus),
      last_sent_at: z.date().nullable(),
      messages: z.array(
        z.object({
          id: z.number(),
          content: z.string().nullable(),
          created_at: z.date(),
          myca_user_id: z.number().nullable(),
          staff_account_id: z.number().nullable(),
        }),
      ),
    }),
  }),
  error: {
    noStarted: {
      status: 400,
      messageText: 'まだメッセージがないので返信できません',
    },
  },
} satisfies BackendApiDef;

/**
 * お店向け、ECオーダーお問合せ取得API
 */
export const getEcOrderStoreContactApi = {
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/order/contact',
  summary: 'ECオーダーのお問い合わせを取得する',
  description: 'ECオーダーに関するお問い合わせを取得するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
    }),
    query: z.object({
      order_id: z.number().optional().describe('オーダーID'),
      code: z.string().optional().describe('ストアごとのオーダーコード'),
      kind: z.string().optional().describe('お問い合わせの種類'),
      skip: z.number().optional().describe('スキップする件数'),
      take: z.number().optional().describe('取得する件数'),
      orderBy: z
        .string()
        .optional()
        .describe('ソート順（last_sent_at, order_id等）'),
      status: z
        .nativeEnum(EcOrderContactStatus)
        .optional()
        .describe('ステータス'),
      includesMessages: z
        .boolean()
        .optional()
        .describe('メッセージを含めるかどうか'),
    }),
  },
  response: z.object({
    orderContacts: z.array(
      z.object({
        id: z.number(),
        kind: z.string(),
        status: z.nativeEnum(EcOrderContactStatus),
        last_sent_at: z.date().nullable(),
        order_store: z.object({
          order: z.object({
            id: z.number().describe('オーダーID'),
            code: z.string().describe('オーダーコード'),
          }),
          code: z.string().describe('オーダーコード（店舗ごとのやつ）'),
        }),
        messages: z.array(
          z.object({
            id: z.number().describe('メッセージID'),
            content: z
              .string()
              .nullable()
              .optional()
              .describe('メッセージ内容'),
            created_at: z.date().describe('作成日時'),
            myca_user_id: z
              .number()
              .nullable()
              .describe('メッセージを送信したユーザーID'),
            staff_account_id: z
              .number()
              .nullable()
              .describe('メッセージを送信したスタッフのID'),
          }),
        ),
      }),
    ),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * 配送方法取得API
 */
export const listShippingMethodApi = {
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/shipping-method',
  summary: '配送方法一覧を取得する',
  description: '店舗で設定した配送方法の一覧を取得するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
    }),
    query: z.object({
      includesFeeDefs: z
        .boolean()
        .optional()
        .describe('地域別配送料や重量別などの定義まで取得するかどうか'),
      id: z.number().optional().describe('配送方法ID'),
    }),
  },
  response: z.object({
    shippingMethods: z.array(
      z.object({
        id: z.number(),
        store_id: z.number(),
        display_name: z.string(),
        enabled_tracking: z.boolean(),
        enabled_cash_on_delivery: z.boolean(),
        order_number: z.number(),
        regions: z
          .array(
            z.object({
              id: z.number(),
              shipping_weight_id: z.number().nullable(),
              region_handle: z.string(),
              fee: z.number(),
            }),
          )
          .nullable()
          .optional(),
        weights: z
          .array(
            z.object({
              id: z.number(),
              display_name: z.string(),
              weight_gte: z.number(),
              weight_lte: z.number(),
              regions: z.array(
                z.object({
                  id: z.number(),
                  shipping_weight_id: z.number().nullable(),
                  region_handle: z.string(),
                  fee: z.number(),
                }),
              ),
            }),
          )
          .nullable()
          .optional(),
      }),
    ),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * 配送方法作成、更新API
 */
export const createOrUpdateShippingMethodApi = {
  method: ApiMethod.POST,
  path: '/store/{store_id}/ec/shipping-method',
  summary: '配送方法を作成または更新する',
  description: '店舗の配送方法を作成または更新するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
    }),
    body: z.object({
      id: z.number().optional().describe('既存のID（更新時）'),
      display_name: z.string().optional().describe('配送方法名'),
      is_store_pickup: z.boolean().optional().describe('店舗受け取りかどうか'),
      enabled_tracking: z
        .boolean()
        .optional()
        .describe('追跡を有効にするかどうか'),
      enabled_cash_on_delivery: z
        .boolean()
        .optional()
        .describe('代引きを許可する支払い方法かどうか'),
      order_number: z
        .number()
        .optional()
        .describe('並び順 若い方から優先的に表示される'),
      regions: z
        .array(
          z.object({
            region_handle: z
              .string()
              .describe('「全国一律」「東北エリア一律」「神奈川県」など'),
            fee: z.number().describe('送料'),
          }),
        )
        .optional()
        .describe('地域別で送料を指定する時'),
      weights: z
        .array(
          z.object({
            display_name: z.string().describe('サイズ名'),
            weight_gte: z.number().describe('重量制限開始ポイント'),
            weight_lte: z.number().describe('重量制限終了ポイント'),
            regions: z
              .array(
                z.object({
                  region_handle: z
                    .string()
                    .describe('「全国一律」「東北エリア一律」「神奈川県」など'),
                  fee: z.number().describe('送料'),
                }),
              )
              .describe('料金は地域別に指定する'),
          }),
        )
        .optional()
        .describe('重量別で送料を指定する時'),
    }),
  },
  response: z.object({
    id: z.number().describe('配送方法ID'),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * 配送方法削除API
 */
export const deleteShippingMethodApi = {
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/ec/shipping-method/{shipping_method_id}',
  summary: '配送方法を削除する',
  description: '店舗の配送方法を削除するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
      shipping_method_id: z.number().describe('配送方法ID'),
    }),
  },
  response: z.object({
    ok: z.string().describe('配送方法の削除に成功しました'),
  }),
  error: {},
} satisfies BackendApiDef;

/**
 * EC全出品API
 */
export const publishAllProductsToEcApi = {
  method: ApiMethod.POST,
  path: '/store/{store_id}/ec/publish-all-products',
  summary: 'すべての商品をECに出品する',
  description: '店舗のすべての商品をECに出品するAPI',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: z.number().describe('店舗ID'),
    }),
  },
  response: z.object({
    ok: z.string().describe('すべての商品がECに出品できました'),
  }),
  error: {},
} satisfies BackendApiDef;

export const getEcStoreApi = {
  summary: 'ECを利用しているストアの一覧を取得する',
  description: 'ECを利用しているストアの一覧を取得する',
  method: ApiMethod.GET,
  path: '/ec/store',
  // cache: 180,
  privileges: {
    role: [apiRole.everyone],
  },
  request: {},
  process: `

  `,
  response: z.object({
    stores: z.array(
      z.object({
        id: StoreSchema.shape.id,
        display_name: StoreSchema.shape.display_name,
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderReceiptApi = {
  summary: 'ECオーダーのストアごとの領収書を発行する',
  description: 'ECオーダーのストアごとの領収書を発行する',
  method: ApiMethod.GET,
  path: '/ec/order/{order_id}/receipt',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: z.object({
      order_id: Ec_OrderSchema.shape.id,
    }),

    query: z.object({
      store_id: StoreSchema.shape.id.describe('ストアID'),
      customer_name: z
        .string()
        .describe('宛名名（二回目以降は必要ない）')
        .optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    receiptUrl: z.string().describe('領収書URL（署名付） 30分間有効'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const registerEcUserCreditCardApi = {
  summary: 'ECユーザーのクレジットカードを保存する',
  description: 'ECユーザーのクレジットカードを保存する',
  method: ApiMethod.POST,
  path: '/ec/user/credit-card',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    body: z.object({
      token: z.string().describe('クレジットカードトークン'),
    }),
  },
  process: `

  `,
  response: Gmo_Credit_CardSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const getEcUserCreditCardApi = {
  summary: 'ECユーザーのクレジットカード情報を取得する',
  description: 'ECユーザーのクレジットカード情報を取得する',
  method: ApiMethod.GET,
  path: '/ec/user/credit-card',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {},
  process: `

  `,
  response: z.object({
    cards: z.array(Gmo_Credit_CardSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderDeliveryNoteApi = {
  summary: 'EC納品書取得',
  description: 'EC納品書取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/order/{order_id}/delivery-note',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      order_id: Ec_OrderSchema.shape.id,
    }),
    query: z.object({
      // display_name: Item_GenreSchema.shape.display_name.optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    deliveryNoteUrl: z.string().describe('納品書URL（署名付） 30分間有効'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcMessageCenterApi = {
  summary: 'メッセージセンター取得',
  description: 'メッセージセンター取得',
  method: ApiMethod.GET,
  path: '/ec/message-center',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    query: z.object({
      id: Ec_Message_CenterSchema.shape.id
        .optional()
        .describe('IDを指定した時だけ本文が取得できる'),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    messageCenters: z.array(
      Ec_Message_CenterSchema.extend({
        order_store: z
          .object({
            code: Ec_Order_Cart_StoreSchema.shape.code,
            store: z.object({
              display_name: StoreSchema.shape.display_name,
            }),
          })
          .nullable(),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const readEcMessageCenterApi = {
  summary: 'メッセージセンターの既読',
  description: 'メッセージセンターの既読',
  method: ApiMethod.POST,
  path: '/ec/message-center/{message_id}/read',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: z.object({
      message_id: Ec_Message_CenterSchema.shape.id,
    }),
  },
  process: `

  `,
  response: Ec_Message_CenterSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderKuronekoShippingLabelCsvApi = {
  summary: 'ヤマト発送用の送り状CSVの発行',
  description: 'ヤマト発送用の送り状CSVの発行',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/order/shipping-label/kuroneko',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      order_id: z.string().describe('ECオーダーID カンマ区切りで複数'),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const editEcAboutUsApi = {
  summary: 'ECのショップについてを編集',
  description: 'ECのショップについてを編集',
  method: ApiMethod.POST,
  path: '/store/{store_id}/ec/about-us',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    body: z
      .object({
        shop_pr: Ec_About_UsSchema.shape.shop_pr,
        images: z.array(z.string()).describe('画像のURLの配列'),
        about_shipping: Ec_About_UsSchema.shape.about_shipping,
        about_shipping_fee: Ec_About_UsSchema.shape.about_shipping_fee,
        cancel_policy: Ec_About_UsSchema.shape.cancel_policy,
        return_policy: Ec_About_UsSchema.shape.return_policy,
      })
      .describe('すべての項目が必須'),
  },
  process: `

  `,
  response: z.object({
    ...Ec_About_UsSchema.shape,
    images: z.array(z.string()).describe('画像のURLの配列'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcStoreAboutUsApi = {
  summary: 'EC店舗の紹介文を取得',
  description: 'EC店舗の紹介文を取得',
  method: ApiMethod.GET,
  path: '/ec/store/{ec_store_id}/about-us',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    params: z.object({
      ec_store_id: Ec_About_UsSchema.shape.store_id,
    }),
  },
  process: `

  `,
  response: z.object({
    ...Ec_About_UsSchema.shape,
    images: z.array(z.string()).describe('画像のURLの配列'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getEcOrderShippingInstructionApi = {
  summary: 'ECの出荷指示書を発行する',
  description: 'ECの出荷指示書を発行する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/ec/order/{order_id}/shipping-instruction',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      order_id: Ec_OrderSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('出荷指示書URL（署名付） 30分間有効'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const setEcBannerApi = {
  summary: 'ECのバナー設定',
  description: 'ECのバナー設定',
  method: ApiMethod.POST,
  path: '/ec/banner',
  privileges: {
    role: [apiRole.admin],
  },
  request: {
    body: z.object({
      banners: z.array(
        z.object({
          title: Ec_BannerSchema.shape.title,
          place: Ec_BannerSchema.shape.place,
          image_url: Ec_BannerSchema.shape.image_url,
          order_number: Ec_BannerSchema.shape.order_number,
          url: Ec_BannerSchema.shape.url,
        }),
      ),
    }),
  },
  process: `

  `,
  response: z.object({
    banners: z.array(Ec_BannerSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;
