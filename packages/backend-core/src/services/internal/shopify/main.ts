import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { BackendCoreProductService } from '@/services/internal/product/main';
import { getSdk, MediaContentType } from '@/services/internal/shopify/gql/sdk';
import { assembleWithProductNdjson } from '@/services/internal/shopify/jsonl/main';
import { Product } from '@prisma/client';
import { GraphQLClient } from 'graphql-request';

export class BackendCoreShopifyService extends BackendService {
  //動的な設定値
  public config = {
    accessToken: '', //動的に設定する場合
    shopDomain: '', //動的に設定する場合
    locationId: '', //動的に設定する場合
  };

  public gqlClient?: GraphQLClient;

  public get gqlSdk() {
    return getSdk(this.gqlClient!);
  }

  //POSシステムで決まっているスタティックな設定値
  public static config = {
    apiVersion: '2025-07',
    applicationId: process.env.SHOPIFY_APP_CLIENT_ID || '',
    applicationSecret: process.env.SHOPIFY_APP_CLIENT_SECRET || '',
    oAuthUrl: process.env.SQUARE_OAUTH_URL,
    oAuthStateKey: 'Shopify_OAuth_State',
    callbackUrl: process.env.SHOPIFY_OAUTH_CALLBACK_URI || '',
  };

  constructor() {
    super();
  }

  public async getApiClient() {
    const { GraphQLClient } = await import('graphql-request');
    const gqlClient = new GraphQLClient(
      `https://${this.config.shopDomain}/admin/api/${BackendCoreShopifyService.config.apiVersion}/graphql.json`,
      {
        headers: {
          'X-Shopify-Access-Token': this.config.accessToken,
        },
      },
    );

    // gqlClient.requestConfig.responseMiddleware = (res) => {
    //   //@ts-expect-error because
    //   console.log(res.extensions?.cost?.throttleStatus);
    // };

    // const testRes = await fetch(
    //   `https://${this.config.shopDomain}/admin/api/${BackendCoreShopifyService.config.apiVersion}/locations.json`,
    //   {
    //     headers: {
    //       'X-Shopify-Access-Token': this.config.accessToken,
    //     },
    //   },
    // );

    // const testResJson = await testRes.json();
    // console.log(JSON.stringify(testResJson, null, 2));

    return gqlClient;
  }

  public async test() {
    const result = await this.gqlSdk.test();
    console.log(JSON.stringify(result, null, 2));
  }

  /**
   * 注文情報取得
   */
  public async getOrder(orderId: string) {
    const result = await this.gqlSdk.getOrder({
      orderId,
    });

    return result.order;
  }

  /**
   * 在庫作成
   */
  public async createProduct(data: {
    title: string; //商品名
    descriptionHtml: string; //商品説明
    imageUrl: string; //商品画像 httpsから始まる
  }) {
    const result = await this.gqlSdk.createProduct({
      product: {
        title: data.title,
        descriptionHtml: data.descriptionHtml,
      },
      media: [
        {
          originalSource: data.imageUrl,
          alt: '商品画像',
          mediaContentType: MediaContentType.Image,
        },
      ],
    });

    //在庫ID
    const productInfo = result.productCreate?.product;

    if (!productInfo) {
      throw new BackendCoreError({
        internalMessage: '商品作成に失敗しました',
        externalMessage: '商品作成に失敗しました',
      });
    }

    const productId = productInfo.id;

    const variantInfo = productInfo.variants.edges[0];

    if (!variantInfo) {
      throw new BackendCoreError({
        internalMessage: '商品作成に失敗しました',
        externalMessage: '商品作成に失敗しました',
      });
    }

    const variantId = variantInfo.node.id;

    const inventoryItemInfo = variantInfo.node.inventoryItem;

    if (!inventoryItemInfo) {
      throw new BackendCoreError({
        internalMessage: '商品作成に失敗しました',
        externalMessage: '商品作成に失敗しました',
      });
    }

    const inventoryItemId = inventoryItemInfo.id;

    return {
      productId,
      variantId,
      inventoryItemId,
    };
  }

  public async updatePriceBulk(
    data: Array<{
      productId: string;
      variantId: string;
      price: number;
    }>,
  ) {
    const chunkSize = 10; // 同時並列数

    for (let i = 0; i < data.length; i += chunkSize) {
      const results = await Promise.all(
        data
          .slice(i, i + chunkSize)
          .map((m) => this.updatePrice(m.productId, m.variantId, m.price)),
      );
    }
  }

  /**
   * 価格更新
   */
  public async updatePrice(
    productId: string,
    variantId: string,
    price: number,
  ) {
    const result = await this.gqlSdk.updateVariant({
      productId,
      variants: [
        {
          id: variantId,
          price,
        },
      ],
    });

    const thisUpdateRes =
      result.productVariantsBulkUpdate?.productVariants?.[0];

    if (!thisUpdateRes) {
      throw new BackendCoreError({
        internalMessage: '価格更新に失敗しました',
        externalMessage: '価格更新に失敗しました',
      });
    }

    return thisUpdateRes;
  }

  /**
   * InventoryItemの更新
   * 在庫追跡を有効にするために使う
   */
  public async updateInventoryItem(
    inventoryItemId: string,
    value: {
      tracked: boolean;
    },
  ) {
    const result = await this.gqlSdk.updateInventoryItem({
      id: inventoryItemId,
      input: value,
    });

    return result.inventoryItemUpdate?.inventoryItem;
  }

  /**
   * 在庫数調整
   */
  public async setInventoryItemQuantity(
    data: Array<{
      inventoryItemId: string;
      quantity: number;
    }>,
  ) {
    if (!this.config.locationId) {
      throw new BackendCoreError({
        internalMessage: 'ShopifyのロケーションIDが設定されていません',
        externalMessage: 'ShopifyのロケーションIDが設定されていません',
      });
    }

    //100個以上は指定できないためエラー
    if (data.length > 100)
      throw new BackendCoreError({
        internalMessage: `100個以上の在庫を指定することはできません`,
      });

    const result = await this.gqlSdk.setInventoryItemQuantity({
      input: {
        name: 'available',
        reason: 'correction',
        ignoreCompareQuantity: true,
        quantities: data.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          locationId: this.config.locationId,
          quantity: item.quantity,
        })),
      },
    });

    return result.inventorySetQuantities?.inventoryAdjustmentGroup?.changes;
  }

  /**
   * Shopify側に新規在庫作成
   */
  @BackendService.WithIds(['storeId'])
  public async createProductByPosProduct(posProductId: Product['id']) {
    //情報を取得する
    const posProductInfo = await this.db.product.findUniqueExists({
      where: {
        store_id: this.ids.storeId,
        id: posProductId,
      },
      include: {
        condition_option: true,
        specialty: true,
        item: true,
      },
    });

    if (!posProductInfo)
      throw new BackendCoreError({
        internalMessage: '商品が見つかりません',
        externalMessage: '商品が見つかりません',
      });

    //すでに連携されてたらエラー
    if (
      posProductInfo.shopify_product_id &&
      posProductInfo.shopify_inventory_item_id &&
      posProductInfo.shopify_product_variant_id
    ) {
      throw new BackendCoreError({
        internalMessage: 'すでにShopifyと連携されている商品です',
        externalMessage: 'すでにShopifyと連携されている商品です',
        errorCode: 'SHOPIFY_PRODUCT_ALREADY_LINKED',
      });
    }

    const productService = new BackendCoreProductService(posProductInfo.id);
    this.give(productService);

    const productName = productService.getEcProductName(posProductInfo);

    //在庫作成
    const shopifyProductInfo = await this.createProduct({
      title: productName,
      descriptionHtml: posProductInfo.description ?? '',
      imageUrl: posProductInfo.image_url ?? '',
    });

    //作成結果を登録していく
    if (
      !shopifyProductInfo.productId ||
      !shopifyProductInfo.variantId ||
      !shopifyProductInfo.inventoryItemId
    ) {
      throw new BackendCoreError({
        internalMessage: 'Shopify商品作成に失敗しました',
        externalMessage: 'Shopify商品作成に失敗しました',
      });
    }

    //在庫追跡モードにする
    await this.updateInventoryItem(shopifyProductInfo.inventoryItemId, {
      tracked: true,
    });

    //現在の価格と現在の在庫数を入力する
    await this.updatePrice(
      shopifyProductInfo.productId,
      shopifyProductInfo.variantId,
      posProductInfo.actual_ec_sell_price!,
    );

    await this.setInventoryItemQuantity([
      {
        inventoryItemId: shopifyProductInfo.inventoryItemId,
        quantity: posProductInfo.ec_stock_number!,
      },
    ]);

    const updateRes = await this.db.product.update({
      where: {
        id: posProductId,
      },
      data: {
        shopify_product_id: shopifyProductInfo.productId,
        shopify_inventory_item_id: shopifyProductInfo.inventoryItemId,
        shopify_product_variant_id: shopifyProductInfo.variantId,
      },
    });

    //EC連携を有効にする
    await productService.enableEc({
      shopify_ec_enabled: true,
    });

    return {
      posProduct: updateRes,
      shopifyProduct: shopifyProductInfo,
    };
  }

  /**
   * Bulkを使って全在庫取得
   */
  public async getAllProducts() {
    const result = await this.gqlSdk.getAllProducts();

    //idを取得する
    const operationId = result.bulkOperationRunQuery?.bulkOperation?.id;

    if (!operationId) {
      throw new BackendCoreError({
        internalMessage: 'Bulk操作IDが取得できませんでした',
        externalMessage: 'Bulk操作IDが取得できませんでした',
      });
    }

    //5秒に1回確認する 最大で5分間待つ
    let dataUrl = '';

    for (let i = 0; i < 60; i++) {
      const targetOperation = await this.getBulkOperationStatus();
      if (targetOperation?.id != operationId) {
        throw new BackendCoreError({
          internalMessage: 'Bulk操作に失敗しました',
          externalMessage: 'Bulk操作に失敗しました',
        });
      }
      if (targetOperation?.status == 'COMPLETED') {
        dataUrl = targetOperation.url;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    //オブジェクト化
    const parsed = await assembleWithProductNdjson(dataUrl);

    return parsed;
  }

  /**
   * Bulkのステータスを取得
   */
  public async getBulkOperationStatus() {
    const result = await this.gqlSdk.getBulkOperationStatus();
    return result.currentBulkOperation;
  }

  /**
   * ロケーション取得
   */
  public async getTargetLocation() {
    const result = await this.gqlSdk.getLocations();

    //isPrimaryがtrueでisActiveなものを取得
    const targetLocation = result.locations.edges.find(
      (edge) => edge.node.isActive,
    )?.node;

    if (!targetLocation) {
      throw new BackendCoreError({
        internalMessage: 'ロケーションが見つからないか、有効になっていません',
        externalMessage: 'ロケーションが見つからないか、有効になっていません',
      });
    }

    return targetLocation;
  }

  /**
   * ストアドメインからストアIDを取得する
   */
  @BackendService.UseCache(300)
  public async fetchStoreIdAndToken(shopDomain: string) {
    const store = await this.db.ec_Setting.findUnique({
      where: {
        shopify_shop_domain: shopDomain,
        store: {
          shopify_ec_enabled: true,
        },
      },
      select: {
        store_id: true,
        shopify_access_token: true,
        shopify_location_id: true,
        shopify_shop_domain: true,
      },
    });

    if (!store || !store.shopify_access_token || !store.shopify_shop_domain) {
      throw new BackendCoreError({
        internalMessage:
          '指定されたロケーションに結びついているストアが見つかりませんでした',
      });
    }

    return {
      storeId: store.store_id,
      accessToken: store.shopify_access_token,
      shopDomain: store.shopify_shop_domain,
      locationId: store.shopify_location_id,
    };
  }

  /**
   * アクセストークンを取得する 5分はキャッシュ
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.UseCache(300)
  public async fetchToken() {
    //Shopifyが有効になっているか確認しつつ、アクセストークンを取得する
    //[TODO] 有効になっているのか確認する必要があるかどうか微妙
    const storeInfo = await this.db.ec_Setting.findUnique({
      where: {
        store_id: this.ids.storeId,
        store: {
          shopify_ec_enabled: true,
        },
      },
      select: {
        shopify_access_token: true,
        shopify_shop_domain: true,
        shopify_location_id: true,
      },
    });

    if (
      !storeInfo ||
      !storeInfo.shopify_access_token ||
      !storeInfo.shopify_shop_domain
    )
      throw new BackendCoreError({
        internalMessage:
          'ストア情報が見つからないか、ShopifyのECが有効になっていません',
        externalMessage:
          'ストア情報が見つからないか、ShopifyのECが有効になっていません',
      });

    return {
      accessToken: storeInfo.shopify_access_token,
      shopDomain: storeInfo.shopify_shop_domain,
      locationId: storeInfo.shopify_location_id,
    };
  }

  /**
   * APIアクセスができる状態にする
   */
  public async grantToken(locationId?: string) {
    //あったら無視する
    if (this.config.accessToken && this.config.shopDomain) {
      this.gqlClient = await this.getApiClient();
      return;
    }

    //なかったら、resourcesにあるか確認する
    if (this.resources.store?.ec_setting) {
      if (
        this.resources.store.ec_setting.shopify_access_token &&
        this.resources.store.ec_setting.shopify_shop_domain
      ) {
        this.config.accessToken =
          this.resources.store.ec_setting.shopify_access_token;
        this.config.shopDomain =
          this.resources.store.ec_setting.shopify_shop_domain;
        this.config.locationId =
          this.resources.store.ec_setting.shopify_location_id!;
        this.gqlClient = await this.getApiClient();
        return;
      }
    }

    //なかったらトークンをフェッチしてくる
    if (this.ids.storeId) {
      const tokenInfo = await this.fetchToken();
      this.config.accessToken = tokenInfo.accessToken;
      this.config.shopDomain = tokenInfo.shopDomain;
      this.config.locationId = tokenInfo.locationId!;
      this.gqlClient = await this.getApiClient();
    } else if (locationId) {
      const storeInfo = await this.fetchStoreIdAndToken(locationId);
      console.log(`ロケーションIDからstoreIdとかを取得しました`);
      this.setIds({
        storeId: storeInfo.storeId,
      });
      this.config.accessToken = storeInfo.accessToken;
      this.config.shopDomain = storeInfo.shopDomain;
      this.config.locationId = storeInfo.locationId!;
      this.gqlClient = await this.getApiClient();
    } else {
      throw new BackendCoreError({
        internalMessage: 'ストアIDが必要です',
        externalMessage: 'ストアIDが必要です',
      });
    }
  }
}

export namespace BackendShopifyService {}
