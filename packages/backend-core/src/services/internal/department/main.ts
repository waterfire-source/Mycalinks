//ジャンルカテゴリをまとめて「department」と呼ぶ

import { BackendCoreError } from '@/error/main';
import { BackendExternalMycaAppService } from '@/services/external';
import { BackendCoreItemService } from '@/services/internal/item/main';
import { BackendService } from '@/services/internal/main';
import { TaskManager } from '@/task/main';
import {
  ConditionOptionHandle,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  ItemCategoryHandle,
  Prisma,
  Store,
  TaskSourceKind,
} from '@prisma/client';

/**
 * カテゴリ、ジャンルなどを担うサービスクラス
 */
export class BackendCoreDepartmentService extends BackendService {
  public allItemCategories?: Array<
    Item_Category & {
      condition_options: Array<Item_Category_Condition_Option>;
    }
  >;
  public allItemGenres?: Array<Item_Genre>;

  public config = {
    fixed: {
      itemCategory: {
        BUNDLE: 'バンドル',
        ORIGINAL_PACK: 'オリパ',
        LUCKY_BAG: '福袋',
        DECK: 'デッキ',
        CARD: 'カード',
        BOX: 'ボックス',
        STORAGE: 'ストレージ',
        PURCHASE_GUARANTEE: '買取保証',
        OTHER: 'その他',
      },
    },
  };

  constructor(storeId?: Store['id']) {
    super();
    this.setIds({
      storeId,
    });
  }

  //ストアの全ての商品種別を取得する
  @BackendService.WithIds(['storeId'])
  public getAllItemCategories = async () => {
    const categories =
      this.allItemCategories ||
      (await this.db.item_Category.findMany({
        where: {
          store_id: Number(this.ids.storeId),
        },
        include: {
          condition_options: true,
        },
      }));
    this.allItemCategories = categories;
    return this.allItemCategories;
  };

  //ストアの全てのジャンルを取得する
  @BackendService.WithIds(['storeId'])
  public getAllItemGenres = async () => {
    const genres =
      this.allItemGenres ||
      (await this.db.item_Genre.findMany({
        where: {
          store_id: Number(this.ids.storeId),
        },
      }));
    this.allItemGenres = genres;
    return this.allItemGenres;
  };

  //固定ジャンルを作成する
  @BackendService.WithIds(['storeId'])
  public createFixedItemGenre = async (
    specificHandle: string, //Mycaアプリ上でのジャンル名
  ) => {
    const allItemGenres = await this.getAllItemGenres();

    //全部作ってあったら作る必要がないためreturn
    const already = allItemGenres.find((e) => e.handle == specificHandle);
    if (already) return already;

    //自動作成するなら、ジャンル情報を取得する
    const mycaApp = new BackendExternalMycaAppService();
    const allGenres = await mycaApp.item.getGenres();
    const thisMycaGenre = allGenres.find((e) => e.name == specificHandle);

    if (!thisMycaGenre)
      throw new BackendCoreError({
        internalMessage: 'ジャンルが見つかりません',
      });

    const createRes = await this.db.item_Genre.create({
      data: {
        store_id: Number(this.ids.storeId),
        display_name: thisMycaGenre.display_name,
        handle: specificHandle,
      },
    });

    this.allItemGenres!.push(createRes);

    return createRes;
  };

  //固定商品種別を作成する
  public createFixedItemCategory = async (
    specificHandle: ItemCategoryHandle,
  ) => {
    const allItemCategories = await this.getAllItemCategories();

    //全部作ってあったら作る必要がないためreturn
    const already = allItemCategories.find((e) => e.handle == specificHandle);
    if (already) return already;

    const createRes = await this.createCategory({
      display_name: this.config.fixed.itemCategory[specificHandle],
      handle: specificHandle,
    });

    this.allItemCategories!.push(createRes);

    return createRes;
  };

  //一気に固定商品種別を作成する（アクティベート用）
  public createAllFixedItemCategory = async () => {
    for (const c of Object.values(ItemCategoryHandle)) {
      await this.createFixedItemCategory(c);
    }
  };

  //カテゴリを作る
  //カードの場合100%のA
  //特定のもの以外は新品、未使用、中古　でそれぞれ一旦100%
  @BackendService.WithIds(['storeId'])
  public createCategory = async ({
    display_name,
    handle,
  }: {
    display_name: Item_Category['display_name'];
    handle?: Item_Category['handle'];
  }) => {
    let condition_options:
      | Prisma.Item_Category_Condition_OptionUncheckedCreateNestedManyWithoutItem_categoryInput
      | undefined = undefined;

    switch (handle) {
      case ItemCategoryHandle.CARD: {
        //カードだったら状態Aを作る
        condition_options = {
          create: {
            display_name: '状態A',
            handle: ConditionOptionHandle.O2_A,
            rate_variants: {
              create: {
                auto_buy_price_adjustment: '100%',
                auto_sell_price_adjustment: '100%',
              },
            },
          },
        };

        break;
      }

      //こいつらは状態を作る必要がない
      case ItemCategoryHandle.BUNDLE:
      case ItemCategoryHandle.ORIGINAL_PACK:
      case ItemCategoryHandle.LUCKY_BAG:
      case ItemCategoryHandle.DECK:
      case ItemCategoryHandle.STORAGE:
      case ItemCategoryHandle.PURCHASE_GUARANTEE:
        //状態なしという名前の状態を作る
        condition_options = {
          create: {
            display_name: '状態なし',
            rate_variants: {
              create: {
                auto_buy_price_adjustment: '100%',
                auto_sell_price_adjustment: '100%',
              },
            },
          },
        };

        break;

      //他はすべて「新品」「未使用」「中古」
      default: {
        condition_options = {
          create: [
            {
              display_name: '新品',
              handle: ConditionOptionHandle.O1_BRAND_NEW,
              rate_variants: {
                create: {
                  auto_buy_price_adjustment: '100%',
                  auto_sell_price_adjustment: '100%',
                },
              },
            },
            {
              display_name: '未使用',
              handle: ConditionOptionHandle.O2_LIKE_NEW,
              rate_variants: {
                create: {
                  auto_buy_price_adjustment: '100%',
                  auto_sell_price_adjustment: '100%',
                },
              },
            },
            {
              display_name: '中古',
              handle: ConditionOptionHandle.O3_USED,
              rate_variants: {
                create: {
                  auto_buy_price_adjustment: '100%',
                  auto_sell_price_adjustment: '100%',
                },
              },
            },
          ],
        };

        break;
      }
    }

    const createRes = await this.db.item_Category.create({
      data: {
        store_id: Number(this.ids.storeId),
        display_name,
        handle,
        condition_options,
      },
      include: {
        condition_options: true,
      },
    });

    return createRes;
  };

  /**
   * 特定のCondition Optionを商品マスタに対して増やしていく
   * この中でCondition Option自体の追加処理までやってしまうとクライアントにレスポンスを返せなくなるためしない
   */
  public addConditionOption = async (
    optionId: Item_Category_Condition_Option['id'],
  ) => {
    const thisConditionOption =
      await this.db.item_Category_Condition_Option.findUnique({
        where: {
          id: optionId,
        },
      });

    if (!thisConditionOption)
      throw new BackendCoreError({
        internalMessage: '条件オプションが見つかりません',
      });

    //まずこのコンディションに結びついている商品マスタを取得する
    //すでにこのコンディションを持っているものは除く
    const allItems = await this.db.item.findMany({
      where: {
        store_id: this.ids.storeId,
        category: {
          condition_options: {
            some: {
              id: optionId,
            },
          },
        },
        products: {
          every: {
            condition_option_id: {
              not: optionId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    const taskManager = new TaskManager({
      targetWorker: 'item',
      kind: 'addConditionOption',
    });

    await taskManager.publish({
      body: allItems.map((e) => ({
        item_id: e.id,
        condition_option_id: optionId,
      })),
      service: this,
      source: TaskSourceKind.API,
      metadata: [
        {
          kind: 'conditionOptionInfo',
          conditionOptionId: thisConditionOption.id,
          conditionOptionName: thisConditionOption.display_name,
        },
      ],
      processDescription: `状態選択肢:${thisConditionOption.display_name} の在庫を追加します`,
    });
  };

  /**
   * 特定のカテゴリの価格を再計算
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public recalculateCategoryPrice = async (categoryId: Item_Category['id']) => {
    const thisCategory = await this.db.item_Category.findUnique({
      where: {
        id: categoryId,
        store_id: Number(this.ids.storeId),
      },
    });

    if (!thisCategory)
      throw new BackendCoreError({
        internalMessage: '条件オプションが見つかりません',
      });

    //まずこのコンディションに結びついている商品マスタを取得する
    //すでにこのコンディションを持っているものは除く
    const allItems = await this.db.item.findMany({
      where: {
        category_id: categoryId,
        store_id: this.ids.storeId,
      },
      select: {
        id: true,
      },
    });

    const taskManager = new TaskManager({
      targetWorker: 'item',
      kind: 'updateItem',
    });

    await taskManager.publish({
      body: allItems.map((e) => ({
        id: e.id,
        recalculatePrice: true,
      })),
      service: this,
      processDescription: `カテゴリ:${thisCategory.display_name} の価格を再計算します`,
    });
  };
}
