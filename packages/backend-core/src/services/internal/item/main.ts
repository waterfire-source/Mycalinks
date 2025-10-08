import { BackendCoreError } from '@/error/main';
import { BackendExternalMycaAppService, MycaItem } from '@/services/external';
import { BackendCoreDepartmentService } from '@/services/internal/department/main';
import { BackendCoreBundleService } from '@/services/internal/item/bundle/main';
import { BackendService } from '@/services/internal/main';
import { ItemTask } from '@/task/main';
import {
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  ItemCategoryHandle,
  ItemStatus,
  Myca_Item,
  Prisma,
  Product,
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { customDayjs, posCommonConstants } from 'common';
export * from '@/services/internal/item/bundle/main';

export class BackendCoreItemService extends BackendService {
  constructor(itemId?: Item['id']) {
    super();
    this.setIds({
      itemId,
    });
    this.bundle = new BackendCoreBundleService();
    this.bind(this.bundle);
  }

  declare targetObject?: Item;
  public bundle: BackendCoreBundleService; //バンドル商品系のサービス

  /**
   * 存在を確認する関数
   * @returns - 存在したら何も返さず、しなかったらエラーをthrow
   */
  @BackendService.WithIds(['itemId', 'storeId'])
  public ifExists = async (customWhere: Prisma.ItemWhereInput = {}) => {
    const thisItemInfo = await this.db.item.findUniqueExists({
      where: {
        ...customWhere,
        store_id: this.ids.storeId || 0,
        id: this.ids.itemId || 0,
      } as Prisma.ItemWhereUniqueInput,
    });

    if (!thisItemInfo)
      throw new BackendCoreError({
        internalMessage: '商品が見つかりません',
        externalMessage: '商品が見つかりません',
      });

    this.targetObject = thisItemInfo;
  };

  /**
   * 商品マスタから在庫を生成する関数
   * 商品マスタのIDはクラスプロパティから取得する
   * 現状、在庫を作成するときは必ずこの関数を通る
   * @deprecated 廃止予定
   */
  @BackendService.WithTx
  @BackendService.WithIds(['itemId', 'storeId'])
  @BackendService.WithResources(['store'])
  public async createProducts({
    specificConditionOptionId,
    specificItemInfo,
    specificConditionOptions,
    productField,
    needIds,
    dontAdjustPrice,
  }: {
    specificConditionOptionId?: Item_Category_Condition_Option['id'] | null;
    specificItemInfo?: any;
    specificConditionOptions?: Array<Item_Category_Condition_Option>;
    productField?: Partial<Product>;
    needIds?: boolean;
    dontAdjustPrice?: boolean; //在庫作成後に価格調整をするかどうか
  }): Promise<Array<Product['id']>> {
    const db = this.db;

    //アイテム情報を取得する
    const thisItemInfo =
      specificItemInfo ||
      (await db.item.findUnique({
        where: {
          id: this.ids.itemId,
          status: {
            not: ItemStatus.DELETED,
          },
        },
        include: {
          category: {
            include: {
              condition_options: true,
            },
          },
        },
      }));

    if (!thisItemInfo)
      throw new BackendCoreError({
        internalMessage: '在庫の作成には商品マスタの指定が必要です',
        externalMessage: '在庫の作成には商品マスタの指定が必要です',
      });

    //すべての状態のパターンを割り出す
    let allConditionOptions: Array<Item_Category_Condition_Option['id']> =
      !specificConditionOptions
        ? thisItemInfo.category.condition_options
            .filter((e: any) => !e.deleted)
            .map((e: any) => e.id)
        : specificConditionOptions.map((e) => e.id);

    //特定の状態IDが指定されている場合は、その状態だけ作成
    if (specificConditionOptionId) {
      allConditionOptions = [specificConditionOptionId];
    }

    console.log('在庫作成コンディションは', allConditionOptions);

    //要素がない場合、在庫は作らない
    if (!allConditionOptions.length) {
      return [];
    }

    //状態を持っていない在庫も登録できるようにする

    const productIds: Array<Product['id']> = [];

    //自動出品がONになっていたらmycalinks_ec_enabledをtrueにする
    let mycalinks_ec_enabled: Product['mycalinks_ec_enabled'] | undefined =
      undefined;

    if (
      this.resources.store?.ec_setting &&
      this.resources.store.ec_setting.auto_listing
    ) {
      mycalinks_ec_enabled = true;
    }

    await Promise.all(
      allConditionOptions.map(async (eachOptionId) => {
        const createResult = await db.product.create({
          data: {
            store_id: thisItemInfo.store_id,
            item_id: thisItemInfo.id,
            display_name: thisItemInfo.display_name || '',
            is_buy_only: thisItemInfo.is_buy_only,
            image_url: thisItemInfo.image_url, //ここら辺のデータは継承する
            readonly_product_code: thisItemInfo.readonly_product_code,
            condition_option_id: eachOptionId || null,
            mycalinks_ec_enabled,
            is_active: thisItemInfo.infinite_stock ? true : undefined,
            stock_number: thisItemInfo.infinite_stock ? 1 : undefined,
            ...productField,
          },
        });

        productIds.push(createResult.id);
      }),
    );

    //Productに価格を反映するプロシージャを実行
    if (!dontAdjustPrice) {
      this.addAfterCommit(async (db) => {
        await db.$queryRaw`
        CALL AdjustedPriceInsertIntoProduct(${thisItemInfo.id}, 0)
        `;
        console.log(
          'トランザクションが終わったので在庫価格の算出をしなおしました',
        );
      });
    }

    return productIds;
  }

  //Mycaアプリからアイテムを自動で追加する
  //関数内でcreate処理をするのではなく、クエリを作る感じ
  //トランザクション必要なさそう？
  @BackendService.WithIds(['storeId'])
  public createQueryFromMycaApp = async ({
    props = {},
    genreId,
    categoryId,
    tx,
    specificMycaAppItems,
  }: {
    props?: Record<string, unknown>;
    genreId?: Item_Genre['id']; //ジャンル指定
    categoryId?: Item_Category['id']; //商品種別指定
    tx?: unknown;
    specificMycaAppItems?: Array<MycaItem>;
  }) => {
    const db = this.db;
    const mycaAppClient = new BackendExternalMycaAppService();
    const departmentModel = new BackendCoreDepartmentService(
      Number(this.ids.storeId),
    );
    this.give(departmentModel);

    await departmentModel.getAllItemCategories();
    await departmentModel.getAllItemGenres();

    //ジャンルを指定されていた場合
    if (genreId) {
      const thisGenreInfo = departmentModel.allItemGenres!.find(
        (e) => e.id == genreId,
      );
      if (!thisGenreInfo?.handle)
        throw new BackendCoreError({
          internalMessage: 'ジャンル指定が不適切です',
          externalMessage: 'ジャンル指定が不適切です',
        });

      const MycaAppGenres = await mycaAppClient.item.getGenres();

      const thisGenreOnApp = MycaAppGenres.find(
        (e) => e.name == thisGenreInfo.handle,
      );
      if (!thisGenreOnApp?.id)
        throw new BackendCoreError({
          internalMessage: 'ジャンル指定が不適切です',
          externalMessage: 'ジャンル指定が不適切です',
        });

      props.genre = thisGenreOnApp.id; //ジャンルID
    }

    //商品種別を指定されていた場合
    if (categoryId) {
      const thisCategoryInfo = departmentModel.allItemCategories!.find(
        (e) => e.id == categoryId,
      );
      if (
        thisCategoryInfo?.handle != ItemCategoryHandle.CARD &&
        thisCategoryInfo?.handle != ItemCategoryHandle.BOX
      )
        throw new BackendCoreError({
          internalMessage: '商品種別指定が不適切です',
          externalMessage: '商品種別指定が不適切です',
        });

      props.displaytype1 = `%${
        thisCategoryInfo.handle == ItemCategoryHandle.CARD
          ? 'カード'
          : 'ボックス'
      }%`;
    }

    const mycaAppItems =
      specificMycaAppItems ||
      (await mycaAppClient.item.getAllDetail(props, {
        detail: 1,
      }));

    let returnQueries: Array<ItemTask.CreateItemData> = [];

    for (const item of mycaAppItems) {
      //カードかボックスじゃなかったら飛ばす（PSAなど対策）
      if (
        !item.displaytype1?.includes(mycaAppClient.config.fixed.card) &&
        !item.displaytype1?.includes(mycaAppClient.config.fixed.box)
      )
        continue;

      const categoryInfo = await departmentModel.createFixedItemCategory(
        item.displaytype1?.includes(mycaAppClient.config.fixed.card)
          ? ItemCategoryHandle.CARD
          : ItemCategoryHandle.BOX,
      );
      const genreInfo = await departmentModel.createFixedItemGenre(
        item.cardgenre,
      );

      if (!categoryInfo || !genreInfo)
        throw new BackendCoreError({
          internalMessage: '部門が存在しません',
          externalMessage: '部門が存在しません',
        });

      //release_dateがあったらrelease_atにも格納する ポケモンだったら7時に変換する
      let release_at: Date | undefined = undefined;

      if (item.release_date) {
        if (genreInfo.handle == 'ポケモン') {
          release_at = customDayjs
            .tz(item.release_date)
            .set('hour', 7)
            .toDate();
        } else {
          release_at = customDayjs.tz(item.release_date).toDate();
        }
      }

      returnQueries.push({
        genre: {
          connect: {
            id: genreInfo.id,
          },
        },
        category: {
          connect: {
            id: categoryInfo.id,
          },
        },
        image_url: item.full_image_url,
        display_name: item.cardname,
        rarity: item.rarity,
        pack_name: item.pack,
        expansion: item.expansion,
        keyword: item.keyword,
        cardnumber: item.cardnumber,
        cardseries: item.cardseries,
        card_type: item.type,
        option1: item.option1,
        option2: item.option2,
        option3: item.option3,
        option4: item.option4,
        option5: item.option5,
        option6: item.option6,
        displaytype1: item.displaytype1,
        displaytype2: item.displaytype2,
        release_date: item.release_date,
        release_at,
        myca_item: {
          connectOrCreate: {
            where: {
              myca_item_id: item.id,
            },
            create: {
              myca_item_id: item.id,
              market_price: item.price,
            },
          },
        },
        myca_pack_id: item.item_pack_id,
        box_pack_count: item.box_pack_count,
        myca_primary_pack_id: item.cardpackid,
        weight: item.weight,
        sell_price: item.fixed_price ?? undefined,
      });
    }

    //すでに登録されているものは間引く
    //クエリ文字数を抑えるために、10000件ずつに分けて取得する
    const chunkSize = 10000;
    const chunkedReturnQueries: (typeof returnQueries)[] = [];

    for (let i = 0; i < returnQueries.length; i += chunkSize) {
      chunkedReturnQueries.push(returnQueries.slice(i, i + chunkSize));
    }

    const alreadyRegisteredMycaItemIds: Set<number> = new Set();

    for (const chunk of chunkedReturnQueries) {
      (
        await db.item.findMany({
          where: {
            store_id: Number(this.ids.storeId),
            myca_item_id: {
              in: chunk.map((e) =>
                Number(e.myca_item?.connectOrCreate.where.myca_item_id),
              ),
            },
          },
          select: {
            myca_item_id: true,
          },
        })
      ).forEach((e) => {
        alreadyRegisteredMycaItemIds.add(e.myca_item_id!);
      });
    }

    //間引く
    returnQueries = returnQueries.filter(
      (e) =>
        !alreadyRegisteredMycaItemIds.has(
          Number(e.myca_item?.connectOrCreate.where.myca_item_id),
        ),
    );

    return {
      itemQueries: returnQueries,
    };
  };

  //特定の状態IDのProductを取得する
  //スペシャルタグ（genre1に値が入っているもの）は除く
  // @BackendService.WithIds(['itemId'])
  // public getSpecificProductInfo = async ({
  //   conditionOptionId,
  // }: {
  //   conditionOptionId: Product['condition_option_id'];
  // }) => {
  //   const productInfo = await this.db.product.findFirstExists({
  //     where: {
  //       item_id: this.ids.itemId,
  //       condition_option_id: conditionOptionId,
  //       tags: {
  //         every: {
  //           tag: {
  //             genre1: null,
  //             genre2: null,
  //           },
  //         },
  //       },
  //     },
  //   });

  //   return productInfo;
  // };

  /**
   * 商品マスタの情報を更新
   */
  @BackendService.WithIds(['itemId', 'storeId'])
  public update = async (data: ItemUpdateData) => {
    const updateResult = await this.safeTransaction(async (tx) => {
      const { recalculatePrice, ...updateData } = data;

      console.log(updateData);

      //release_dateが指定されていたらrelease_atにも格納する
      if (updateData.release_date) {
        const thisDate = customDayjs.tz(updateData.release_date).toDate();
        updateData.release_at =
          isNaN(thisDate.getTime()) || thisDate.getTime() < 0 ? null : thisDate;
      }

      let updateResult: Item | null = null;
      if (Object.keys(updateData).length > 0) {
        updateResult = await tx.item.update({
          where: { id: this.ids.itemId, store_id: this.ids.storeId },
          data: updateData,
        });
      }

      //価格再計算が必要かどうか
      if (recalculatePrice) {
        await this.db.$queryRaw`
        CALL AdjustedPriceInsertIntoProduct(${this.ids.itemId}, 1)
        `;
      }

      //Productの方も変える
      const forProductFields: Array<keyof ItemUpdateData> = [
        'image_url',
        'display_name',
        'readonly_product_code',
        'is_buy_only',
        'tablet_allowed',
      ];

      const updateProductValues: Record<string, unknown> = {};

      forProductFields.forEach((field) => {
        //送信されたデータに含まれているかどうか
        if (field in data) {
          let value: any = data[field];
          switch (field) {
            default:
              updateProductValues[field] = value;
          }
        }
      });

      //無限商品にされてたら、在庫を1000000にする（在庫変動履歴はつけない）
      if (data.infinite_stock) {
        updateProductValues.stock_number =
          posCommonConstants.infiniteItemDefaultStockNumber;
        updateProductValues.is_active = true;
      }

      //Productを更新する
      if (Object.keys(updateProductValues).length > 0) {
        await this.db.product.updateMany({
          where: {
            item_id: this.ids.itemId,
            store_id: this.ids.storeId,
          },
          data: {
            ...updateProductValues,
          },
        });
      }

      return updateResult;
    });
    return updateResult;
  };

  /**
   * 商品マスタ作成
   */
  @BackendService.WithIds(['storeId'])
  public create = async ({
    data,
    specificConditionOptions,
    ignoreError,
  }: {
    data: ItemCreateData;
    specificConditionOptions?: Array<Item_Category_Condition_Option>;
    ignoreError?: boolean;
  }) => {
    let products_stock_number = 0;

    //無限在庫の場合は最初からproducts_stock_numberを1000000にする
    if (data.infinite_stock) {
      products_stock_number = posCommonConstants.infiniteItemDefaultStockNumber;
    }

    const createResult = await this.safeTransaction(async (tx) => {
      let createResult: Item | null = null;
      try {
        createResult = await this.db.item.create({
          data: {
            ...data,
            store: {
              connect: {
                id: this.ids.storeId,
              },
            },
            products_stock_number,
          },
          include: {
            category: {
              include: {
                condition_options: true,
              },
            },
          },
        });
      } catch (error) {
        if (!ignoreError) {
          throw error;
        }

        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            console.error('ユニーク制約');
            return null;
          }
        }
        throw error;
      }

      this.setIds({
        itemId: createResult.id,
      });

      //[TODO] 無駄に在庫を作らないロジックにする時、ここは必要なくなる
      await this.createProducts({
        specificItemInfo: createResult,
        specificConditionOptions,
      });

      return createResult;
    });
    this.targetObject = createResult!;
    return createResult!;
  };

  /**
   * 特定のパックの中のカードを全て取得する
   */
  @BackendService.WithIds(['storeId'])
  public async getPackItemQuery(mycaPackId: Item['myca_pack_id']) {
    const mycaApp = new BackendExternalMycaAppService();
    const thisPackInfo = await mycaApp.item.getAllDetail(
      {
        is_pack: 1,
        id: mycaPackId,
      },
      {
        detail: 1,
      },
    );

    if (!thisPackInfo.length)
      throw new BackendCoreError({
        internalMessage: 'パックが見つかりません',
        externalMessage: 'パックが見つかりません',
      });

    const createItemQueryRes = await this.createQueryFromMycaApp({
      props: {
        pack: mycaPackId,
      },
    });

    const itemQueries = createItemQueryRes.itemQueries;

    return { itemQueries, thisPackInfo };
  }

  //where
  public static getDisplayNameQuery = (value: string) =>
    ({
      OR: [
        {
          search_keyword: {
            contains: value,
          },
        },
        !isNaN(Number(value)) && {
          products: {
            some: {
              id: Number(value || 0) - posCommonConstants.productCodePrefix,
            },
          },
        },
      ].filter(Boolean),
    }) as Prisma.ItemWhereInput;

  //itemTypeの件
  public static itemTypeToCategoryQuery = (
    type: ItemType,
  ): Prisma.ItemWhereInput => {
    return type == 'NORMAL'
      ? {
          category: {
            OR: [
              {
                handle: {
                  notIn: [
                    ItemCategoryHandle.BUNDLE,
                    ItemCategoryHandle.ORIGINAL_PACK,
                    ItemCategoryHandle.LUCKY_BAG,
                    ItemCategoryHandle.DECK,
                  ],
                },
              },
              {
                handle: null,
              },
            ],
          },
        }
      : type == 'ORIGINAL_PACK'
      ? {
          category: {
            handle: {
              in: [
                ItemCategoryHandle.ORIGINAL_PACK,
                ItemCategoryHandle.LUCKY_BAG,
                ItemCategoryHandle.DECK,
              ],
            },
          },
        }
      : type == 'BUNDLE'
      ? {
          category: {
            handle: ItemCategoryHandle.BUNDLE,
          },
        }
      : {};
  };
}

export type ItemType = 'ORIGINAL_PACK' | 'BUNDLE' | 'NORMAL';

export type ItemUpdateData = {
  display_name?: Item['display_name'];
  display_name_ruby?: Item['display_name_ruby'];
  sell_price?: Item['sell_price'];
  buy_price?: Item['buy_price'];
  recalculatePrice?: boolean; //価格の再計算を行うかどうか
  is_buy_only?: Item['is_buy_only'];
  order_number?: Item['order_number'];
  readonly_product_code?: Item['readonly_product_code'];
  description?: Item['description'];
  rarity?: Item['rarity'];
  pack_name?: Item['pack_name'];
  expansion?: Item['expansion'];
  keyword?: Item['keyword'];
  cardnumber?: Item['cardnumber'];
  cardseries?: Item['cardseries'];
  card_type?: Item['card_type'];
  option1?: Item['option1'];
  option2?: Item['option2'];
  option3?: Item['option3'];
  option4?: Item['option4'];
  option5?: Item['option5'];
  option6?: Item['option6'];
  displaytype1?: Item['displaytype1'];
  displaytype2?: Item['displaytype2'];
  release_date?: Item['release_date'];
  release_at?: Item['release_at'];
  myca_item_id?: Item['myca_item_id'];
  myca_pack_id?: Item['myca_pack_id'];
  weight?: Item['weight'];
  status?: Item['status'];
  image_url?: Item['image_url'];
  tablet_allowed?: Item['tablet_allowed'];
  infinite_stock?: Item['infinite_stock'];
  allow_round?: Item['allow_round'];
  box_pack_count?: Item['box_pack_count'];
  myca_primary_pack_id?: Item['myca_primary_pack_id'];
};

export type ItemCreateData = {
  genre: {
    connect: {
      id: Item_Genre['id'];
    };
  };
  category: {
    connect: {
      id: Item_Category['id'];
    };
  };
  myca_item?: {
    connectOrCreate: {
      where: {
        myca_item_id: Myca_Item['myca_item_id'];
      };
      create: {
        myca_item_id: Myca_Item['myca_item_id'];
        market_price: Myca_Item['market_price'];
      };
    };
  };
  image_url?: Item['image_url'];
  display_name: Item['display_name'];
  display_name_ruby?: Item['display_name_ruby'];
  sell_price?: Item['sell_price'];
  buy_price?: Item['buy_price'];
  is_buy_only?: Item['is_buy_only'];
  order_number?: Item['order_number'];
  readonly_product_code?: Item['readonly_product_code'];
  description?: Item['description'];
  rarity?: Item['rarity'];
  pack_name?: Item['pack_name'];
  expansion?: Item['expansion'];
  keyword?: Item['keyword'];
  cardnumber?: Item['cardnumber'];
  cardseries?: Item['cardseries'];
  card_type?: Item['card_type'];
  option1?: Item['option1'];
  option2?: Item['option2'];
  option3?: Item['option3'];
  option4?: Item['option4'];
  option5?: Item['option5'];
  option6?: Item['option6'];
  displaytype1?: Item['displaytype1'];
  displaytype2?: Item['displaytype2'];
  release_date?: Item['release_date'];
  release_at?: Item['release_at'];
  myca_pack_id?: Item['myca_pack_id'];
  box_pack_count?: Item['box_pack_count'];
  myca_primary_pack_id?: Item['myca_primary_pack_id'];
  weight?: Item['weight'];
  allow_auto_print_label?: Item['allow_auto_print_label'];
  allow_round?: Item['allow_round'];
  infinite_stock?: Item['infinite_stock'];
  tablet_allowed?: Item['tablet_allowed'];
};
