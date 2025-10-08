export * from '@/services/internal/product/wholesalePrice/main';
//仕入れ値関連
import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { BackendCoreProductWholesalePriceService } from '@/services/internal/product/main';
import { WholesalePriceRecord } from '@/services/internal/product/main';
import { customDayjs, ecConstants, posCommonConstants } from 'common';

import {
  Consignment_Client,
  Consignment_Client_Mapping,
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Category_Condition_Option_Mapping,
  Item_Category_Mapping,
  Item_Genre,
  Item_Genre_Mapping,
  Item_Mapping,
  ItemCategoryHandle,
  ItemStatus,
  Prisma,
  Product,
  Product_Ec_Stock_History,
  Product_Stock_History,
  Product_Wholesale_Price_History,
  ProductEcStockHistorySourceKind,
  ProductStockHistorySourceKind,
  Specialty,
  Specialty_Mapping,
  SpecialtyKind,
  Store,
  WholesalePriceHistoryResourceType,
} from '@prisma/client';
import { BackendCoreDepartmentService } from '@/services/internal/department/main';
import {
  BackendCoreItemService,
  ItemCreateData,
} from '@/services/internal/item/main';
import { MappingDef } from '@/services/internal/store-shipment/main';

/**
 * 在庫数関連
 */
export class BackendCoreProductService extends BackendService {
  constructor(productId?: Product['id'], storeId?: Store['id']) {
    super();
    this.wholesalePrice = new BackendCoreProductWholesalePriceService();
    this.bind(this.wholesalePrice);
    this.setIds({
      productId,
      storeId,
    });
  }

  public declare targetObject?: Product;
  public wholesalePrice: BackendCoreProductWholesalePriceService;

  /**
   * 存在を確認する関数
   * @returns - 存在したら何も返さず、しなかったらエラーをthrow
   */
  @BackendService.WithIds(['productId', 'storeId'])
  public ifExists = async (customWhere: Prisma.ProductWhereInput = {}) => {
    const thisProductInfo = await this.db.product.findUniqueExists({
      where: {
        ...customWhere,
        id: this.ids.productId || 0,
        store_id: this.ids.storeId || 0,
      },
    });

    if (!thisProductInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    this.targetObject = thisProductInfo;

    return thisProductInfo;
  };

  private sourceKindResourceTypeDict = {
    [ProductStockHistorySourceKind.original_pack]:
      WholesalePriceHistoryResourceType.ORIGINAL_PACK,
    [ProductStockHistorySourceKind.bundle]:
      WholesalePriceHistoryResourceType.BUNDLE,
    [ProductStockHistorySourceKind.loss]:
      WholesalePriceHistoryResourceType.LOSS,
    [ProductStockHistorySourceKind.transaction_sell]:
      WholesalePriceHistoryResourceType.TRANSACTION,
    [ProductStockHistorySourceKind.transaction_sell_return]:
      WholesalePriceHistoryResourceType.TRANSACTION,
    [ProductStockHistorySourceKind.appraisal_create]:
      WholesalePriceHistoryResourceType.APPRAISAL,
    [ProductStockHistorySourceKind.ec_sell]:
      WholesalePriceHistoryResourceType.EC_ORDER,
    [ProductStockHistorySourceKind.ec_sell_return]:
      WholesalePriceHistoryResourceType.EC_ORDER,
    [ProductStockHistorySourceKind.pack_opening]:
      WholesalePriceHistoryResourceType.PACK_OPENING,
    [ProductStockHistorySourceKind.stocking_rollback]:
      WholesalePriceHistoryResourceType.STOCKING,
    [ProductStockHistorySourceKind.stocking]:
      WholesalePriceHistoryResourceType.STOCKING,
    [ProductStockHistorySourceKind.pack_opening_rollback]:
      WholesalePriceHistoryResourceType.PACK_OPENING,
    [ProductStockHistorySourceKind.pack_opening_unregister]:
      WholesalePriceHistoryResourceType.PACK_OPENING_UNREGISTER,
    [ProductStockHistorySourceKind.pack_opening_unregister_rollback]:
      WholesalePriceHistoryResourceType.PACK_OPENING_UNREGISTER,
    [ProductStockHistorySourceKind.loss_rollback]:
      WholesalePriceHistoryResourceType.LOSS,
    [ProductStockHistorySourceKind.store_shipment]:
      WholesalePriceHistoryResourceType.STORE_SHIPMENT,
    [ProductStockHistorySourceKind.store_shipment_rollback]:
      WholesalePriceHistoryResourceType.STORE_SHIPMENT,
    [ProductStockHistorySourceKind.location]:
      WholesalePriceHistoryResourceType.LOCATION,
    [ProductStockHistorySourceKind.location_release]:
      WholesalePriceHistoryResourceType.LOCATION,
  };

  //product_idはクラスプロパティからのみ入力できるようにする（クラスとしての意義を確立）
  /**
   * 在庫数を増加させる関数
   * @params kind: 変動の種類 これによって仕入れ値の扱い方など変わってくるため指定必須
   * @params description?: 説明
   * @params transaction_id?: 紐づける取引のID 返品の場合、元の取引のID
   *
   */
  @BackendService.WithTx
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public increaseStock = async ({
    increaseCount,
    source_kind,
    source_id,
    description,
    wholesaleRecords,
    specificProductInfo,
  }: {
    increaseCount: number; //増やす量
    source_kind: Product_Stock_History['source_kind'];
    source_id?: Product_Stock_History['source_id']; //transactionの場合はそのidになる
    description?: Product_Stock_History['description'];
    wholesaleRecords?: Array<WholesalePriceRecord>;
    specificProductInfo?: Product & {
      specialty: Specialty | null;
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    };
  }): Promise<{
    stockHistory: Product_Stock_History | null;
    ecStockHistory: Product_Ec_Stock_History | null;
    recordInfo?: Awaited<
      ReturnType<
        typeof BackendCoreProductWholesalePriceService.prototype.getRecords
      >
    > | null;
    createdRecords: Array<Product_Wholesale_Price_History>;
  }> => {
    const db = this.db;

    const staff_account_id =
      this.resources?.actionAccount?.id ??
      BackendService.coreConfig.systemAccountId;

    let createdRecords: Array<Product_Wholesale_Price_History> = [];

    let recordInfo:
      | Awaited<
          ReturnType<
            typeof BackendCoreProductWholesalePriceService.prototype.getRecords
          >
        >
      | undefined = undefined;

    if (increaseCount <= 0)
      throw new BackendCoreError({
        internalMessage: '在庫変動数を0より大きい数で指定してください',
        externalMessage: '在庫変動数を0より大きい数で指定してください',
      });

    let ecStockHistory: Product_Ec_Stock_History | null = null;

    //recordsが指定されている場合、その合計数がincreaseCountと同じか確認
    if (wholesaleRecords) {
      if (
        wholesaleRecords.reduce((curSum, e) => curSum + e.item_count, 0) !=
        increaseCount
      )
        throw new BackendCoreError({
          internalMessage:
            '指定された仕入れ値レコードの合計数と指定増加数が一致しません',
          externalMessage:
            '指定された仕入れ値レコードの合計数と指定増加数が一致しません',
        });
    }

    //在庫の情報を取得する
    let thisProductInfo =
      specificProductInfo ??
      (await db.product.findUnique({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
          deleted: false,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      }));

    if (!thisProductInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    let thisHistoryInfo: Product_Stock_History | null = null;

    //ここだけでも関数化したいかも
    //無限商品だったらとりあえず在庫変動をさせない
    if (!thisProductInfo.item.infinite_stock) {
      thisProductInfo = await db.product.update({
        where: {
          id: thisProductInfo.id,
        },
        data: {
          stock_number: {
            increment: increaseCount,
          },
          is_active: true,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      });

      //必要に応じてEC側の在庫数も変動させる
      //EC返品の場合は無視する
      if (
        source_kind != ProductStockHistorySourceKind.ec_sell_return &&
        (await this.checkIfEcAvailable(thisProductInfo))
      ) {
        //増やせる最大量を取得 その分だけ増やす
        const ecStockNumberMargin =
          this.checkEcStockNumberIsValid(thisProductInfo);

        if (ecStockNumberMargin > 0) {
          //補充する量を取得
          const ecIncreaseCount = Math.min(increaseCount, ecStockNumberMargin);

          //EC在庫変動を起こす
          const changeResult = await this.increaseEcStock({
            increaseCount: ecIncreaseCount,
            source_kind: ProductEcStockHistorySourceKind.auto_stocking,
            source_id: source_id,
            description:
              description +
              `\n POS上で在庫数が増加したため、ECにも在庫増加を伝達しました`,
            specificProductInfo: thisProductInfo,
          });
          console.log(changeResult);
          ecStockHistory = changeResult.ecStockHistory;
        }
      }
    }

    thisHistoryInfo = await db.product_Stock_History.create({
      data: {
        product_id: thisProductInfo.id,
        staff_account_id,
        source_kind,
        source_id,
        item_count: increaseCount,
        unit_price: wholesaleRecords
          ? Math.round(
              wholesaleRecords.reduce(
                (curSum, e) => curSum + e.item_count * e.unit_price,
                0,
              ) / increaseCount,
            )
          : 0, //増加なのでここは仕入れ値が入る形になる recordsが指定されている場合、とりあえず合計仕入れ値 / 仕入れ数を四捨五入したものを入れる ない場合は後で入れる
        result_stock_number: thisProductInfo.stock_number,
        description,
      },
    });

    const productInfoString = `
商品名: ${this.getProductNameWithMeta(thisProductInfo)}
    `;

    let newUnitPrice: number | null = null;

    const productCategoryHandle = thisProductInfo.item.category.handle;

    //商品の種類によって処理を分ける
    switch (productCategoryHandle) {
      case ItemCategoryHandle.BUNDLE: {
        //無限のバンドル商品は存在しないためエラー
        if (thisProductInfo.item.infinite_stock) {
          throw new BackendCoreError({
            internalMessage: 'バンドル在庫を無限在庫として扱うことはできません',
            externalMessage: `バンドル在庫を無限在庫として扱うことはできません
${productInfoString}`,
          });
        }

        switch (source_kind) {
          //バンドル商品の追加だったら
          case ProductStockHistorySourceKind.bundle: {
            //バンドルの定義を取得
            const bundleDef = await db.bundle_Item_Product.findMany({
              where: {
                item_id: thisProductInfo.item_id,
              },
            });

            newUnitPrice = 0;

            //それぞれの商品ごとに仕入れ値レコードを作っていく
            for (const childProduct of bundleDef) {
              //ここで在庫減少関数を使って在庫を減少させる

              const totalCount = increaseCount * childProduct.item_count;

              const thisProduct = new BackendCoreProductService(
                childProduct.product_id,
                this.ids.storeId!,
              );
              this.give(thisProduct);

              const decreaseStockRes = await thisProduct.decreaseStock({
                description: `バンドル商品: ${thisProductInfo.id} の在庫増加に付随して減少`,
                source_kind: ProductStockHistorySourceKind.bundle,
                source_id: thisProductInfo.id,
                decreaseCount: totalCount,
              });

              if (!decreaseStockRes)
                throw new BackendCoreError({
                  internalMessage: '無限商品が含まれています',
                  externalMessage: `無限商品が含まれています
${productInfoString}`,
                });

              //合計仕入れ値から平均仕入れ値を取得する
              newUnitPrice +=
                decreaseStockRes.recordInfo!.totalWholesalePrice /
                increaseCount;
            }

            newUnitPrice = Math.round(newUnitPrice);

            //この平均仕入れ値のレコードを作成する
            await this.wholesalePrice.setRecords({
              records: [
                {
                  unit_price: newUnitPrice,
                  item_count: increaseCount,
                  product_id: thisProductInfo.id,
                },
              ],
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });

            console.log(
              `BUNDLE在庫 ${thisProductInfo.id} の在庫数を増やしました`,
            );

            break;
          }

          //販売取引での返品だったら
          case ProductStockHistorySourceKind.transaction_sell_return: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
                externalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
              });

            //このTRANSACTIONに結びついている仕入れ値レコードを逆順で取得しつつ、消費する
            const recordInfo = await this.wholesalePrice.getRecords({
              item_count: increaseCount,
              resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
              resource_id: source_id,
              spend: true,
              reverse: true,
            });

            //仕入れ平均値を取得
            newUnitPrice = Math.round(
              recordInfo.totalWholesalePrice / increaseCount,
            );

            //仕入れ値子レコードを全て取得する
            const childrenRecords = recordInfo.useRecords
              .map((e) => e.children || [])
              .flat();

            await this.wholesalePrice.setRecords({
              records: childrenRecords,
              resource_type: WholesalePriceHistoryResourceType.BUNDLE,
              resource_id: thisProductInfo.id,
            });

            //PRODUCT仕入れ値レコードを復活させる
            await this.wholesalePrice.setRecords({
              records: [
                {
                  unit_price: newUnitPrice,
                  item_count: increaseCount,
                  product_id: thisProductInfo.id,
                },
              ],
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });

            console.log(
              `BUNDLE在庫 ${thisProductInfo.id} の在庫数を取引に紐づいている仕入れ値レコードを使って増加させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
            });
        }

        break;
      }

      //オリパだったら
      case ItemCategoryHandle.LUCKY_BAG:
      case ItemCategoryHandle.DECK:
      case ItemCategoryHandle.ORIGINAL_PACK: {
        //無限のオリパ商品は存在しないためエラー
        if (thisProductInfo.item.infinite_stock) {
          throw new BackendCoreError({
            internalMessage: 'オリパ在庫を無限在庫として扱うことはできません',
            externalMessage: `オリパ在庫を無限在庫として扱うことはできません
${productInfoString}`,
          });
        }

        switch (source_kind) {
          //オリパの追加だったら
          case ProductStockHistorySourceKind.original_pack: {
            if (!thisProductInfo.item_id)
              throw new BackendCoreError({
                internalMessage:
                  'オリパ商品は商品マスタと結び付けられてある必要があります',
                externalMessage:
                  'オリパ商品は商品マスタと結び付けられてある必要があります',
              });

            //オリパの定義を取得
            const originalPackDef = await db.original_Pack_Product.findMany({
              where: {
                item_id: thisProductInfo.item_id,
              },
            });
            let targetDef = originalPackDef;

            //process_idがoriginal以外のものがあったら追加モードであるため、現在のprocess_idと一致しているものだけを対象とする
            const additionalDef = originalPackDef.filter(
              (e) => e.process_id != 'original',
            );

            //追加モードの場合、process_idが一致するか調べる
            if (additionalDef.length > 0) {
              targetDef = additionalDef.filter(
                (e) => e.process_id === String(this.processId),
              );

              if (targetDef.length == 0) {
                throw new BackendCoreError({
                  internalMessage: '追加するオリパの対象商品が見つかりません',
                  externalMessage: '追加するオリパの対象商品が見つかりません',
                });
              }
            }

            newUnitPrice = 0;

            //それぞれの商品ごとに仕入れ値レコードを作っていく
            for (const eachProduct of targetDef) {
              //ここで在庫減少関数を使って在庫を減少させる

              const totalCount = eachProduct.item_count; //減少させる量は定義から取得する

              const thisProduct = new BackendCoreProductService(
                eachProduct.product_id,
                this.ids.storeId!,
              );
              this.give(thisProduct);

              const decreaseStockRes = await thisProduct.decreaseStock({
                description: `オリジナルパック商品在庫: ${thisProductInfo.id} の在庫増加に付随して減少`,
                source_kind: ProductStockHistorySourceKind.original_pack,
                source_id: thisProductInfo.item_id,
                decreaseCount: totalCount,
              });

              if (!decreaseStockRes)
                throw new BackendCoreError({
                  internalMessage: '無限商品が含まれています',
                  externalMessage: `無限商品が含まれています
${productInfoString}`,
                });

              //合計仕入れ値から平均仕入れ値を取得する
              newUnitPrice +=
                decreaseStockRes.recordInfo!.totalWholesalePrice /
                increaseCount;
            }

            newUnitPrice = Math.round(newUnitPrice);

            //オリパ在庫自体の仕入れ値レコードを作成していく
            //一度、このオリパ在庫自体に紐づいている仕入れ値レコードを削除する
            //同時に、オリパに結びついているレコードを全て取得する
            const [originalPackRecords] = await Promise.all([
              this.db.product_Wholesale_Price_History.findMany({
                where: {
                  resource_type:
                    WholesalePriceHistoryResourceType.ORIGINAL_PACK,
                  resource_id: thisProductInfo.item_id,
                },
              }),
              this.db.product_Wholesale_Price_History.deleteMany({
                where: {
                  product_id: thisProductInfo.id,
                  resource_type: WholesalePriceHistoryResourceType.PRODUCT,
                },
              }),
            ]);

            //合計仕入れ値を取得
            const sumWholesalePrice = originalPackRecords.reduce(
              (curSum, e) => curSum + e.unit_price * e.item_count,
              0,
            );

            //初期在庫数を取得
            const initStockNumber =
              thisProductInfo.item?.init_stock_number ?? 0;

            const unitWholesalePrice = Math.round(
              sumWholesalePrice / initStockNumber,
            );

            //新しい在庫数分、新しい平均仕入れ値でレコードを入れる
            await this.wholesalePrice.setRecords({
              records: [
                {
                  unit_price: unitWholesalePrice,
                  item_count: thisProductInfo.stock_number,
                  product_id: thisProductInfo.id,
                },
              ],
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });

            break;
          }

          //販売取引での返品だったら
          case ProductStockHistorySourceKind.ec_sell_return:
          case ProductStockHistorySourceKind.transaction_sell_return: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
                externalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
              });

            //このTRANSACTIONに結びついている仕入れ値レコードを逆順で取得する
            const thisRecordInfo = await this.wholesalePrice.getRecords({
              item_count: increaseCount,
              resource_type: this.sourceKindResourceTypeDict[source_kind],
              resource_id: source_id,
              spend: true,
              reverse: true,
            });

            //仕入れ平均値を取得
            newUnitPrice = Math.round(
              thisRecordInfo.totalWholesalePrice / increaseCount,
            );

            //仕入れ値レコードを復元させる
            await this.wholesalePrice.setRecords({
              records: thisRecordInfo.useRecords,
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });

            console.log(
              `ORIGINAL_PACK在庫 ${thisProductInfo.id} の在庫数を取引に紐づいている仕入れ値レコードを使って増加させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
            });
        }

        break;
      }

      default: {
        //それ以外
        switch (source_kind) {
          case ProductStockHistorySourceKind.transaction_buy:
          case ProductStockHistorySourceKind.box_opening:
          case ProductStockHistorySourceKind.box_create:
          case ProductStockHistorySourceKind.carton_opening:
          case ProductStockHistorySourceKind.carton_create:
          case ProductStockHistorySourceKind.transfer:
          case ProductStockHistorySourceKind.bundle_release:
          case ProductStockHistorySourceKind.original_pack_release:
          case ProductStockHistorySourceKind.appraisal_return: //鑑定結果から戻す時
          case ProductStockHistorySourceKind.appraisal_cancel: //鑑定キャンセルから戻す時
          case ProductStockHistorySourceKind.product: {
            //無限在庫もアリエル

            //recordsが指定されてなかったらOUT
            if (!wholesaleRecords)
              throw new BackendCoreError({
                internalMessage:
                  'NORMAL商品の在庫増加にはwholesaleRecordsの指定が必要です',
                externalMessage:
                  'NORMAL商品の在庫増加にはwholesaleRecordsの指定が必要です',
              });

            //仕入れ値を登録する
            const setRecordsRes = await this.wholesalePrice.setRecords({
              records: wholesaleRecords,
              product_id: thisProductInfo.id,
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });
            console.log(
              `NORMAL在庫 ${thisProductInfo.id} の在庫数を与えられた仕入れ値レコードを使って増加させました`,
            );

            createdRecords = setRecordsRes.createdRecords;

            break;
          }

          //委託在庫の場合は仕入れ値がなくても大丈夫
          case ProductStockHistorySourceKind.consignment_create: {
            const wholesaleRecords: Array<WholesalePriceRecord> = [
              {
                unit_price: 0,
                item_count: increaseCount,
                product_id: thisProductInfo.id,
              },
            ];

            //仕入れ値を登録する
            await this.wholesalePrice.setRecords({
              records: wholesaleRecords,
              product_id: thisProductInfo.id,
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });
            console.log(
              `NORMAL 委託在庫 ${thisProductInfo.id} の在庫数を増加させました`,
            );

            break;
          }

          case ProductStockHistorySourceKind.stocking:
          case ProductStockHistorySourceKind.pack_opening:
          case ProductStockHistorySourceKind.pack_opening_unregister: {
            //無限在庫もアリエル

            //recordsが指定されてなかったらOUT
            if (!wholesaleRecords || !source_id)
              throw new BackendCoreError({
                internalMessage:
                  'パック開封・入荷にはwholesaleRecordsとsource_idの指定が必要です',
                externalMessage:
                  'パック開封・入荷にはwholesaleRecordsとsource_idの指定が必要です',
              });

            //仕入れ値を登録する
            await this.wholesalePrice.setRecords({
              records: wholesaleRecords,
              product_id: thisProductInfo.id,
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });

            await this.wholesalePrice.setRecords({
              records: wholesaleRecords,
              product_id: thisProductInfo.id,
              resource_type: this.sourceKindResourceTypeDict[source_kind],
              resource_id: source_id,
            });

            console.log(
              `NORMAL在庫 ${thisProductInfo.id} の在庫数を与えられた仕入れ値レコードを使って増加させました`,
            );

            break;
          }

          //ロールバック系
          case ProductStockHistorySourceKind.loss_rollback:
          case ProductStockHistorySourceKind.location_release:
          case ProductStockHistorySourceKind.store_shipment_rollback:
          case ProductStockHistorySourceKind.pack_opening_rollback:
          case ProductStockHistorySourceKind.ec_sell_return:
          case ProductStockHistorySourceKind.transaction_sell_return: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
                externalMessage:
                  '販売取引返品の在庫変動ではtransaction_idを指定する必要があります',
              });

            //このTRANSACTIONに結びついている仕入れ値レコードを逆順で取得する
            const thisRecordInfo = await this.wholesalePrice.getRecords({
              item_count: increaseCount,
              resource_type: this.sourceKindResourceTypeDict[source_kind],
              resource_id: source_id,
              spend: true,
              reverse: true,
            });

            //仕入れ平均値を取得
            newUnitPrice = Math.round(
              thisRecordInfo.totalWholesalePrice / increaseCount,
            );

            recordInfo = thisRecordInfo;

            //仕入れ値レコードを復元させる
            await this.wholesalePrice.setRecords({
              records: recordInfo.useRecords,
              resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              resource_id: thisProductInfo.id,
            });
            console.log(
              `NORMAL在庫 ${thisProductInfo.id} の在庫数を取引に紐づいている仕入れ値レコードを使って増加させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を増加させるのに対応していません`,
            });
        }

        break;
      }
    }

    if (newUnitPrice != null && thisHistoryInfo) {
      thisHistoryInfo = await db.product_Stock_History.update({
        where: {
          id: thisHistoryInfo.id,
        },
        data: {
          unit_price: newUnitPrice,
        },
      });
    }

    return {
      stockHistory: thisHistoryInfo,
      ecStockHistory,
      recordInfo,
      createdRecords,
    };
  };
  /**
   * 在庫数を減少させる関数
   * @params kind: 変動の種類 これによって仕入れ値の扱い方など変わってくるため指定必須
   * @params description?: 説明
   *
   */
  @BackendService.WithTx
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public decreaseStock = async ({
    decreaseCount,
    source_kind,
    source_id,
    specificWholesalePrice,
    description,
    unit_price,
    specificProductInfo,
  }: {
    decreaseCount: number; //減らす量 これが正の値であることに注意
    source_kind: Product_Stock_History['source_kind'];
    source_id?: Product_Stock_History['source_id'];
    specificWholesalePrice?: Product_Wholesale_Price_History['unit_price']; //特定の仕入れ値を使いたい時
    description?: Product_Stock_History['description'];
    unit_price?: Product_Stock_History['unit_price'];
    specificProductInfo?: Product & {
      specialty: Specialty | null;
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    };
  }): Promise<{
    stockHistory: Product_Stock_History | null;
    ecStockHistory: Product_Ec_Stock_History | null;
    recordInfo: Awaited<
      ReturnType<
        typeof BackendCoreProductWholesalePriceService.prototype.getRecords
      >
    > | null;
  }> => {
    const db = this.db;
    const staff_account_id =
      this.resources.actionAccount?.id ??
      BackendService.coreConfig.systemAccountId;

    if (decreaseCount < 0)
      throw new BackendCoreError({
        internalMessage: '在庫変動数を0より大きい数で指定してください',
        externalMessage: '在庫変動数を0より大きい数で指定してください',
      });

    //在庫の情報を取得する
    let thisProductInfo =
      specificProductInfo ??
      (await db.product.findUnique({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
          deleted: false,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      }));

    if (!thisProductInfo)
      throw new BackendCoreError({
        internalMessage: '存在しない商品です',
        externalMessage: '存在しない商品です',
      });

    let thisHistoryInfo: Product_Stock_History | null = null;
    let ecStockHistory: Product_Ec_Stock_History | null = null;

    const productInfoString = `
商品名: ${this.getProductNameWithMeta(thisProductInfo)}
    `;

    //無限商品だったら在庫変動はしない
    if (!thisProductInfo.item.infinite_stock) {
      //在庫数を変動させる（トランザクションの中で）
      thisProductInfo = await db.product.update({
        where: {
          id: thisProductInfo.id,
        },
        data: {
          stock_number: {
            decrement: decreaseCount,
          },
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      });

      // //委託在庫で、在庫数が0になっていたら削除する トランザクションが終わったら実行する
      // if (thisProductInfo.consignment_client_id && thisProductInfo.stock_number <= 0) {

      // }

      //必要に応じてEC側の在庫数も変動させる
      //再計算して、ECから取り消さないといけないものがあったら取り消していく
      //EC販売の場合は無視する
      if (
        source_kind != ProductStockHistorySourceKind.ec_sell &&
        (await this.checkIfEcAvailable(thisProductInfo))
      ) {
        //増やせる最大量を取得
        const ecStockNumberMargin =
          this.checkEcStockNumberIsValid(thisProductInfo);

        //ECから取り消す量を算出
        const ecDecreaseCount = Math.abs(Math.min(ecStockNumberMargin, 0));

        if (ecDecreaseCount > 0) {
          //EC在庫変動を起こす
          const changeResult = await this.decreaseEcStock({
            decreaseCount: ecDecreaseCount,
            source_kind: ProductEcStockHistorySourceKind.recalculate,
            source_id: source_id,
            description: description + `\n ECの在庫を再調整しなおしました`,
            specificProductInfo: thisProductInfo,
          });
          console.log(changeResult);
          ecStockHistory = changeResult.ecStockHistory;
        }
      }
    }

    //在庫数が0より少なくなっていたらエラー
    if (thisProductInfo.stock_number < 0)
      throw new BackendCoreError({
        internalMessage: `商品ID: ${thisProductInfo.id}の在庫が0より少なくなってしまいます`,
        externalMessage: `商品の在庫数が足りません
${productInfoString}`,
      });

    thisHistoryInfo = await db.product_Stock_History.create({
      data: {
        product_id: thisProductInfo.id,
        staff_account_id,
        source_kind,
        source_id,
        item_count: -1 * decreaseCount,
        unit_price: unit_price ?? thisProductInfo.actual_sell_price ?? 0, //減少なのでここは販売価格を入れたりする
        result_stock_number: thisProductInfo.stock_number,
        description,
      },
    });

    const buyPrice =
      thisProductInfo.specific_buy_price ?? thisProductInfo.buy_price ?? 0;

    let recordInfo: Awaited<
      ReturnType<BackendCoreProductWholesalePriceService['getRecords']>
    > | null = null;

    const productCategoryHandle = thisProductInfo.item.category.handle;

    //在庫が0になるなら
    if (thisProductInfo.stock_number <= 0) {
      //もし特価在庫だったら論理削除する
      if (thisProductInfo.is_special_price_product) {
        await db.product.update({
          where: {
            id: thisProductInfo.id,
          },
          data: {
            deleted: true,
          },
        });
      }
    }

    //商品の種類によって処理を分ける
    switch (productCategoryHandle) {
      case ItemCategoryHandle.BUNDLE: {
        //無限のバンドル商品は存在しないためエラー
        if (thisProductInfo.item.infinite_stock) {
          throw new BackendCoreError({
            internalMessage: 'バンドル在庫を無限在庫として扱うことはできません',
            externalMessage: `バンドル在庫を無限在庫として扱うことはできません
${productInfoString}`,
          });
        }

        switch (source_kind) {
          //バンドル商品の販売だったら
          case ProductStockHistorySourceKind.transaction_sell: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売での在庫減少ではtransaction_idを指定する必要があります',
                externalMessage:
                  '販売での在庫減少ではtransaction_idを指定する必要があります',
              });

            //バンドルの定義を取得 同時にバンドルの全ての仕入れ値を取得
            const [bundleDef, allWholesalePriceRecords] = await Promise.all([
              db.bundle_Item_Product.findMany({
                where: {
                  item_id: thisProductInfo.item_id,
                },
              }),
              db.product_Wholesale_Price_History.findMany({
                where: {
                  resource_type: WholesalePriceHistoryResourceType.BUNDLE,
                  resource_id: thisProductInfo.id,
                },
                select: {
                  unit_price: true,
                  item_count: true,
                },
              }),
            ]);

            const generatedRecords: Array<WholesalePriceRecord> = [];

            //総仕入れ値
            let remainWholesalePrice = allWholesalePriceRecords.reduce(
              (curSum, e) => curSum + e.unit_price * e.item_count,
              0,
            );

            //在庫一個一個仕入れ値を取得する
            for (let i = 0; i < decreaseCount; i++) {
              let thisWholesalePrice = 0;
              const thisWholesaleChildRecords: Array<WholesalePriceRecord> = [];

              //この辺りはパフォーマンス改善のためになるべくPromise.allを使っていきたい

              //この商品の仕入れ値を計算する
              for (const childProduct of bundleDef) {
                const childProductService = new BackendCoreProductService(
                  childProduct.product_id,
                );
                this.give(childProductService);

                const recordInfo =
                  await childProductService.wholesalePrice.getRecords({
                    specificProductId: childProduct.product_id,
                    item_count: childProduct.item_count,
                    spend: true,
                    resource_type: WholesalePriceHistoryResourceType.BUNDLE,
                    resource_id: thisProductInfo.id,
                  });

                remainWholesalePrice -= recordInfo.totalWholesalePrice;

                thisWholesalePrice +=
                  recordInfo.totalWholesalePrice / childProduct.item_count;
                thisWholesaleChildRecords.push(...recordInfo.useRecords);
              }

              thisWholesalePrice = Math.round(thisWholesalePrice);

              //この仕入れレコードを作成する
              const thisRecord: WholesalePriceRecord = {
                product_id: thisProductInfo.id,
                item_count: 1,
                resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
                resource_id: source_id,
                unit_price: thisWholesalePrice,
                children: thisWholesaleChildRecords,
                is_exact: false, //親レコード自体は平均値で計算しているため
              };

              generatedRecords.push(thisRecord);
            }

            //一旦全てのPRODUCT仕入れ値レコードを削除する
            await db.product_Wholesale_Price_History.deleteMany({
              where: {
                product_id: thisProductInfo.id,
                resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              },
            });

            if (thisProductInfo.stock_number > 0) {
              const newBundleWholesalePrice = Math.round(
                remainWholesalePrice / thisProductInfo.stock_number,
              );

              //PRODUCT仕入れ値レコードを新しい平均仕入れ値で入れる
              await this.wholesalePrice.setRecords({
                records: [
                  {
                    unit_price: newBundleWholesalePrice,
                    item_count: thisProductInfo.stock_number,
                    product_id: thisProductInfo.id,
                  },
                ],
                resource_type: WholesalePriceHistoryResourceType.PRODUCT,
                resource_id: thisProductInfo.id,
              });
            }

            //作ったレコードを全て登録する

            await this.wholesalePrice.setRecords({
              records: generatedRecords,
              resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
              resource_id: source_id,
            });

            //合計仕入れ値を取得
            const totalWholesalePrice = generatedRecords.reduce(
              (curSum, e) => curSum + e.unit_price * e.item_count,
              0,
            );

            recordInfo = {
              originalRecords: [], //バンドルの販売ではoriginalRecordsは入らない
              remainRecords: [],
              nothingCount: 0,
              useRecords: generatedRecords,
              totalWholesalePrice,
            };

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数を取引レコードを作りつつ、減少させました`,
            );

            break;
          }

          //バンドルの解体
          case ProductStockHistorySourceKind.bundle_release: {
            //バンドルの定義を取得
            const [bundleDef, allWholesalePriceRecords] = await Promise.all([
              db.bundle_Item_Product.findMany({
                where: {
                  item_id: thisProductInfo.item_id,
                },
              }),
              db.product_Wholesale_Price_History.findMany({
                where: {
                  resource_type: WholesalePriceHistoryResourceType.BUNDLE,
                  resource_id: thisProductInfo.id,
                },
                select: {
                  unit_price: true,
                  item_count: true,
                },
              }),
            ]);

            let remainWholesalePrice = allWholesalePriceRecords.reduce(
              (curSum, e) => curSum + e.unit_price * e.item_count,
              0,
            );

            recordInfo = {
              originalRecords: [], //バンドルの販売ではoriginalRecordsは入らない
              remainRecords: [],
              nothingCount: 0,
              useRecords: [],
              totalWholesalePrice: 0,
            };

            //それぞれの商品の在庫を増加させていく
            for (const childProduct of bundleDef) {
              //定義上の個数 * 解体するバンドルの量 だけ仕入れ値を動かす形になる
              const totalCount = childProduct.item_count * decreaseCount;

              if (!totalCount) continue;

              const childProductService = new BackendCoreProductService(
                childProduct.product_id,
              );
              this.give(childProductService);

              const thisRecordInfo =
                await childProductService.wholesalePrice.getRecords({
                  reverse: true,
                  item_count: totalCount,
                  spend: true,
                  resource_type: WholesalePriceHistoryResourceType.BUNDLE,
                  resource_id: thisProductInfo.id,
                });

              remainWholesalePrice -= thisRecordInfo.totalWholesalePrice;

              //取得できたレコードを加算する
              recordInfo.nothingCount += thisRecordInfo.nothingCount;
              recordInfo.totalWholesalePrice +=
                thisRecordInfo.totalWholesalePrice;
              recordInfo.useRecords.push(...thisRecordInfo.useRecords);

              //ここで取得できたレコードを使って在庫数を増加させる
              const changeResult = await childProductService.increaseStock({
                source_kind: ProductStockHistorySourceKind.bundle_release,
                source_id: thisProductInfo.id,
                increaseCount: totalCount,
                wholesaleRecords: thisRecordInfo.useRecords,
                description: `バンドル在庫${thisProductInfo.id} の解体処理の中で、紐づいている在庫${childProduct.product_id}を${totalCount}増加させました`,
              });
            }

            //一旦全てのPRODUCT仕入れ値レコードを削除する
            await db.product_Wholesale_Price_History.deleteMany({
              where: {
                product_id: thisProductInfo.id,
                resource_type: WholesalePriceHistoryResourceType.PRODUCT,
              },
            });

            //PRODUCT仕入れ値レコードを新しい平均仕入れ値で入れる
            if (thisProductInfo.stock_number > 0) {
              const newBundleWholesalePrice = Math.round(
                remainWholesalePrice / thisProductInfo.stock_number,
              );
              await this.wholesalePrice.setRecords({
                records: [
                  {
                    unit_price: newBundleWholesalePrice,
                    item_count: thisProductInfo.stock_number,
                    product_id: thisProductInfo.id,
                  },
                ],
                resource_type: WholesalePriceHistoryResourceType.PRODUCT,
                resource_id: thisProductInfo.id,
              });
            }

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} のバンドルを解体させつつ、在庫を減少させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
            });
        }

        break;
      }

      //オリパだったら
      case ItemCategoryHandle.LUCKY_BAG:
      case ItemCategoryHandle.DECK:
      case ItemCategoryHandle.ORIGINAL_PACK: {
        //無限のオリパ商品は存在しないためエラー
        if (thisProductInfo.item.infinite_stock) {
          throw new BackendCoreError({
            internalMessage: 'オリパ在庫を無限在庫として扱うことはできません',
            externalMessage: `オリパ在庫を無限在庫として扱うことはできません
${productInfoString}`,
          });
        }

        switch (source_kind) {
          //オリパの販売だったら
          case ProductStockHistorySourceKind.loss:
          case ProductStockHistorySourceKind.ec_sell:
          case ProductStockHistorySourceKind.transaction_sell: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売での在庫減少・ロス登録ではsource_idを指定する必要があります',
                externalMessage:
                  '販売での在庫減少・ロス登録ではsource_idを指定する必要があります',
              });

            //仕入れ値レコードを取得
            recordInfo = await this.wholesalePrice.getRecords({
              item_count: decreaseCount,
              sparePrice: buyPrice,
              spend: true,
            });

            const resource_type = this.sourceKindResourceTypeDict[source_kind];

            //取引に結びつけるレコードを登録
            await this.wholesalePrice.setRecords({
              records: recordInfo!.useRecords,
              resource_type,
              resource_id: source_id,
            });

            // //オリパの総仕入れ値を取得
            // const allRecords =
            //   await db.product_Wholesale_Price_History.findMany({
            //     where: {
            //       resource_type:
            //         WholesalePriceHistoryResourceType.ORIGINAL_PACK,
            //       resource_id: thisProductInfo.item_id,
            //     },
            //   });

            // const sumWholesalePrice = allRecords.reduce(
            //   (curSum, e) => curSum + e.unit_price * e.item_count,
            //   0,
            // );
            // //初期在庫数を取得
            // const initStockNumber =
            //   thisProductInfo.item?.init_stock_number ?? 0;

            // const unitWholesalePrice = Math.round(
            //   sumWholesalePrice / initStockNumber,
            // );

            // const thisTotalWholesalePrice = unitWholesalePrice * decreaseCount;

            // const wholesalePriceRecords: Array<WholesalePriceRecord> = [
            //   {
            //     unit_price: unitWholesalePrice,
            //     item_count: decreaseCount,
            //     product_id: thisProductInfo.id,
            //     resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
            //     resource_id: source_id,
            //   },
            // ];

            // //作ったレコードを全て登録する
            // await this.wholesalePrice.setRecords({
            //   records: wholesalePriceRecords,
            //   resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
            //   resource_id: source_id,
            // });

            // recordInfo = {
            //   originalRecords: [], //オリパの販売ではoriginalRecordsは入らない
            //   remainRecords: [],
            //   nothingCount: 0,
            //   useRecords: wholesalePriceRecords,
            //   totalWholesalePrice: thisTotalWholesalePrice,
            // };

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数を取引レコードを作りつつ、減少させました`,
            );

            break;
          }

          //オリパの解体 定義が変わっているため、新しい合計仕入れ値と新しい初期在庫数で新しい仕入れ値レコードを作成する
          case ProductStockHistorySourceKind.original_pack_release: {
            const [originalPackRecords] = await Promise.all([
              this.db.product_Wholesale_Price_History.findMany({
                where: {
                  resource_type:
                    WholesalePriceHistoryResourceType.ORIGINAL_PACK,
                  resource_id: thisProductInfo.item_id,
                },
              }),
              this.db.product_Wholesale_Price_History.deleteMany({
                where: {
                  product_id: thisProductInfo.id,
                  resource_type: WholesalePriceHistoryResourceType.PRODUCT,
                },
              }),
            ]);

            //合計仕入れ値を取得
            const sumWholesalePrice = originalPackRecords.reduce(
              (curSum, e) => curSum + e.unit_price * e.item_count,
              0,
            );

            //初期在庫数を取得
            const initStockNumber =
              thisProductInfo.item?.init_stock_number ?? 0;

            if (initStockNumber > 0) {
              const unitWholesalePrice = Math.round(
                sumWholesalePrice / initStockNumber,
              );

              const thisRecords: Array<WholesalePriceRecord> = [
                {
                  unit_price: unitWholesalePrice,
                  item_count: thisProductInfo.stock_number,
                  product_id: thisProductInfo.id,
                },
              ];

              //新しい在庫数分、新しい平均仕入れ値でレコードを入れる
              await this.wholesalePrice.setRecords({
                records: thisRecords,
                resource_type: WholesalePriceHistoryResourceType.PRODUCT,
                resource_id: thisProductInfo.id,
              });
            }

            recordInfo = {
              originalRecords: [], //適当
              remainRecords: [],
              nothingCount: 0,
              useRecords: [],
              totalWholesalePrice: 0,
            };

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} のオリパを解体・ロスさせつつ、在庫を減少させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
            });
        }

        break;
      }

      //通常商品だったら
      default: {
        //無限在庫の場合、仕入れ値1円としてレコードを作成する
        if (thisProductInfo.item.infinite_stock) {
          recordInfo = {
            originalRecords: [
              {
                unit_price: 1,
                arrived_at: new Date(),
                item_count: decreaseCount,
                product_id: thisProductInfo.id,
                id: 0,
              },
            ],
            nothingCount: 0,
            useRecords: [
              {
                unit_price: 1,
                arrived_at: new Date(),
                item_count: decreaseCount,
                product_id: thisProductInfo.id,
              },
            ],
            remainRecords: [],
            totalWholesalePrice: 1 * decreaseCount,
          };

          console.log(`無限在庫 ${thisProductInfo.id} の在庫数を減らしました`);

          // break;
        }

        switch (source_kind) {
          case ProductStockHistorySourceKind.original_pack:
          case ProductStockHistorySourceKind.bundle:
          case ProductStockHistorySourceKind.loss:
          case ProductStockHistorySourceKind.store_shipment:
          case ProductStockHistorySourceKind.pack_opening:
          case ProductStockHistorySourceKind.appraisal_create: //鑑定の作成の時
          case ProductStockHistorySourceKind.location: //ロケーションの作成、追加
          case ProductStockHistorySourceKind.transaction_sell:
          case ProductStockHistorySourceKind.ec_sell: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '販売取引・オリパ作成・バンドル作成・パック開封・ロス・店舗間出荷・ロケーションの在庫減少ではリソースのIDを指定する必要があります',
                externalMessage:
                  '販売取引・オリパ作成・バンドル作成・パック開封・ロス・店舗間出荷・ロケーションの在庫減少ではリソースのIDを指定する必要があります',
              });

            //無限商品じゃなかったら仕入れ値レコード取得し、消費する
            if (!thisProductInfo.item.infinite_stock) {
              recordInfo = await this.wholesalePrice.getRecords({
                item_count: decreaseCount,
                sparePrice: buyPrice,
                specificPrice: specificWholesalePrice, //特定の仕入れ値を参照していた場合
                spend: true,
              });
              console.log(recordInfo);
            }

            const resource_type = this.sourceKindResourceTypeDict[source_kind];

            //取引に結びつけるレコードを登録
            await this.wholesalePrice.setRecords({
              records: recordInfo!.useRecords,
              resource_type,
              resource_id: source_id,
            });

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数を特定のリソースに紐づいている仕入れ値レコードを使って減少させました`,
            );

            break;
          }

          case ProductStockHistorySourceKind.transfer:
          case ProductStockHistorySourceKind.product: //在庫直接変動
          case ProductStockHistorySourceKind.box_opening: //ボックス解体
          case ProductStockHistorySourceKind.box_create: //ボックス在庫の補充
          case ProductStockHistorySourceKind.carton_opening: //カートン解体
          case ProductStockHistorySourceKind.carton_create: //カートン在庫の補充
          case ProductStockHistorySourceKind.consignment_return: //委託返却
          case ProductStockHistorySourceKind.transaction_buy_return: {
            //買取取引の返品（あまり想定しなくてよさそうだが）
            //普通に仕入れ値を正順で消費するだけでOK

            if (!thisProductInfo.item.infinite_stock) {
              recordInfo = await this.wholesalePrice.getRecords({
                item_count: decreaseCount,
                sparePrice: buyPrice,
                specificPrice: specificWholesalePrice, //特定の仕入れ値
                spend: true,
              });
            }

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数をボックス/カートン解体・手動変動・転送・返品処理で減少させました`,
            );

            break;
          }

          case ProductStockHistorySourceKind.stocking_rollback: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '入荷の取り消しにはリソースのIDを指定する必要があります',
                externalMessage:
                  '入荷の取り消しにはリソースのIDを指定する必要があります',
              });

            //仕入れの取り消し
            //仕入れに紐づいている仕入れ値レコードを取得し、それを消費する
            //その値の仕入れ値がなかったらエラー
            //[TODO] 平均値で管理している場合の想定が必要かも

            //この入荷に紐づいている、この在庫の仕入れ値レコードを全て取得する
            const records = await this.wholesalePrice.getRecords({
              item_count: decreaseCount,
              spend: true,
              resource_type: WholesalePriceHistoryResourceType.STOCKING,
              resource_id: source_id,
            });

            //nothingCountがあったらエラー
            if (records.nothingCount > 0)
              throw new BackendCoreError({
                internalMessage: '仕入れ値レコードが見つかりませんでした',
                externalMessage: '仕入れ値レコードが見つかりませんでした',
              });

            //それぞれのレコードを消費する
            for (const record of records.useRecords) {
              const changeRes = await this.wholesalePrice.getRecords({
                spend: true,
                item_count: record.item_count,
                specificPrice: record.unit_price,
              });

              //nothingCountがあったら仕入れ値が存在しなかったということだからエラー
              if (changeRes.nothingCount > 0)
                throw new BackendCoreError({
                  internalMessage: '仕入れ値レコードが見つかりませんでした',
                  externalMessage:
                    '入荷を取り消すための仕入れ値が見つかりませんでした',
                });
            }

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数を入荷の取り消し処理で減少させました`,
            );

            break;
          }

          //パック開封のロールバック
          case ProductStockHistorySourceKind.pack_opening_rollback:
          case ProductStockHistorySourceKind.pack_opening_unregister_rollback: {
            if (!source_id)
              throw new BackendCoreError({
                internalMessage:
                  '入荷の取り消しにはリソースのIDを指定する必要があります',
                externalMessage:
                  '入荷の取り消しにはリソースのIDを指定する必要があります',
              });

            //パック開封の取り消し

            //この入荷に紐づいている、この在庫の仕入れ値レコードを全て取得する
            const records = await this.wholesalePrice.getRecords({
              item_count: decreaseCount,
              spend: true,
              resource_type:
                source_kind ===
                ProductStockHistorySourceKind.pack_opening_rollback
                  ? WholesalePriceHistoryResourceType.PACK_OPENING
                  : WholesalePriceHistoryResourceType.PACK_OPENING_UNREGISTER,
              resource_id: source_id,
            });

            //nothingCountがあったらエラー
            if (records.nothingCount > 0)
              throw new BackendCoreError({
                internalMessage:
                  'パック開封の仕入れ値レコードが見つかりませんでした',
                externalMessage:
                  'パック開封の仕入れ値レコードが見つかりませんでした',
              });

            //それぞれのレコードを消費していく
            for (const record of records.useRecords) {
              const changeRes = await this.wholesalePrice.getRecords({
                spend: true,
                item_count: record.item_count,
                specificPrice: record.unit_price,
              });

              //nothingCountがあったら仕入れ値が存在しなかったということだからエラー
              if (changeRes.nothingCount > 0)
                throw new BackendCoreError({
                  internalMessage: '仕入れ値レコードが見つかりませんでした',
                  externalMessage:
                    'パック開封を取り消すための仕入れ値が見つかりませんでした',
                });
            }

            console.log(
              `${productCategoryHandle}在庫 ${thisProductInfo.id} の在庫数をパック開封の取り消し処理で減少させました`,
            );

            break;
          }

          default:
            throw new BackendCoreError({
              internalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
              externalMessage: `この商品タイプ${productCategoryHandle}は変動の種類${source_kind}で在庫を減少させるのに対応していません`,
            });
        }

        break;
      }
    }

    return {
      stockHistory: thisHistoryInfo,
      recordInfo,
      ecStockHistory,
    };
  };

  /**
   * EC在庫として有効になっているかどうかの判断
   */
  public checkEcEnabled = (productInfo: Product) => {
    //一つでも有効になってたらOK
    return (
      productInfo.mycalinks_ec_enabled ||
      productInfo.shopify_ec_enabled ||
      productInfo.ochanoko_ec_enabled
    );
  };

  /**
   * 最低在庫数などを加味してECの在庫数をどれだけ減少させればいいのか、もしくは余裕があるのかを吟味
   * @returns +だったらその分だけ余裕があり、-だったらその分だけ引かなければならない
   *
   * 20250618: EC在庫は常に出品できるだけするという方針になったため、基本的にこのメソッドの返り値のmarginの分だけEC在庫数も変えることになる
   */
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public checkEcStockNumberIsValid = (productInfo: {
    ec_stock_number: Product['ec_stock_number'];
    stock_number: Product['stock_number'];
    pos_reserved_stock_number: Product['pos_reserved_stock_number'];
  }): number => {
    //お店の全体設定
    if (!this.resources.store?.ec_setting)
      throw new BackendCoreError({
        internalMessage: 'EC設定がありません',
        externalMessage: 'EC設定がありません',
      });

    //ECの在庫数が0を下回っていたらエラー
    if (productInfo.ec_stock_number < 0)
      throw new BackendCoreError({
        errorCode: 'EC_ENOUGH_STOCK_NUMBER',
        internalMessage: 'EC在庫数が0を下回っています',
        externalMessage: 'EC在庫数が0を下回っています',
      });

    const storeReservedStockNumber =
      this.resources.store.ec_setting.reserved_stock_number ?? 0;

    const specificReservedStockNumber = productInfo.pos_reserved_stock_number;

    //この在庫に対する、最低限確保しないといけない数
    const actualReservedStockNumber =
      specificReservedStockNumber ?? storeReservedStockNumber;

    //現在のPOS全体在庫数
    const currentTotalStockNumber = productInfo.stock_number;

    //ECに出品できる最大数を取得
    const maximumEcStockNumber = Math.max(
      0,
      currentTotalStockNumber - actualReservedStockNumber,
    );

    //現在のEC在庫数
    const currentEcStockNumber = productInfo.ec_stock_number;

    //EC在庫数の余裕 これがマイナスだとそもそもイケナイ状況になっているということ
    const ecStockNumberMargin = maximumEcStockNumber - currentEcStockNumber;

    return ecStockNumberMargin;
  };

  /**
   * @deprecated 20250618: このメソッドは機能削減に際して一旦無効になった
   */
  @BackendService.WithResources(['store'])
  private checkIfEcAutoStockingIsEnabled = (productInfo: Product) => {
    if (productInfo.disable_ec_auto_stocking) return false;
    if (!this.resources.store!.ec_setting?.auto_stocking) return false;
    return true;
  };

  /**
   * EC在庫を出品（有効化）
   */
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public enableEc = async ({
    mycalinks_ec_enabled,
    shopify_ec_enabled,
    ochanoko_ec_enabled,
  }: {
    mycalinks_ec_enabled?: boolean; //falseを指定したら出品取り消し
    shopify_ec_enabled?: boolean;
    ochanoko_ec_enabled?: boolean;
  }) => {
    //全部undefinedだったら無視
    if (
      mycalinks_ec_enabled === undefined &&
      shopify_ec_enabled === undefined &&
      ochanoko_ec_enabled === undefined
    )
      return;

    //shopify_ec_enableやochanoko_ec_enableがtrueだったら、同時にmycalinks_ec_enabledもtrueにする
    if (shopify_ec_enabled || ochanoko_ec_enabled) {
      mycalinks_ec_enabled = true;
    }

    //商品情報を取得

    const productInfo = await this.db.product.findUnique({
      where: {
        id: this.ids.productId!,
        store_id: this.ids.storeId!,
        deleted: false,
      },
      include: {
        specialty: true,
        condition_option: true,
      },
    });

    if (!productInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    const updateField: Prisma.ProductUpdateInput = {
      mycalinks_ec_enabled,
      shopify_ec_enabled,
      ochanoko_ec_enabled,
    };

    //trueが含まれている場合、販売価格が0円だったらエラー
    if (mycalinks_ec_enabled || shopify_ec_enabled || ochanoko_ec_enabled) {
      if (productInfo.actual_ec_sell_price === 0) {
        throw new BackendCoreError({
          internalMessage: `
商品ID: ${productInfo.id} のEC販売価格が0円であるため、出品できません
          `,
          externalMessage: `
商品ID: ${productInfo.id} のEC販売価格が0円であるため、出品できません
EC販売価格を設定してください。
          `,
        });
      }

      //マッピング済みの状態かどうか
      if (!productInfo.condition_option?.handle)
        throw new BackendCoreError({
          internalMessage: `
商品ID: ${productInfo.id} の状態選択肢がマッピング済みではありません
          `,
          externalMessage: `
商品ID: ${productInfo.id} の状態選択肢がマッピング済みではありません
          `,
        });

      //マッピング済みの特殊状態かどうか（特殊状態が割り当てられている場合のみチェック）
      if (productInfo.specialty && !productInfo.specialty.handle)
        throw new BackendCoreError({
          internalMessage: `
商品ID: ${productInfo.id} の特殊状態がマッピング済みではありません
          `,
          externalMessage: `
商品ID: ${productInfo.id} の特殊状態がマッピング済みではありません
          `,
        });
    }

    //Mycalinksが指定されているかどうか
    if (mycalinks_ec_enabled !== undefined) {
      //外部サービスとの連携とかはないためこれで終了
    }

    //Shopifyが指定されているかどうか
    if (shopify_ec_enabled !== undefined) {
      //すでに同じ状態になっていたら無視
      if (productInfo.shopify_ec_enabled !== shopify_ec_enabled) {
        //有効にしようとしていたら idがちゃんと入っているのか確認
        if (shopify_ec_enabled) {
          if (
            !productInfo.shopify_product_id ||
            !productInfo.shopify_product_variant_id ||
            !productInfo.shopify_inventory_item_id
          ) {
            throw new BackendCoreError({
              internalMessage: `
商品ID: ${productInfo.id} のShopify連携情報が不足しています
          `,
            });
          }
        }
        //無効にしようとしていたら
        else {
          console.log('Shopify出品取り消しを望んでいます');
        }
      }
    }

    //Ochanokoが指定されているかどうか
    if (ochanoko_ec_enabled !== undefined) {
      //すでに同じ状態になっていたら無視
      if (productInfo.ochanoko_ec_enabled !== ochanoko_ec_enabled) {
        //有効にしようとしていたら
        //ochanoko_product_idがちゃんと入っているのか確認
        if (ochanoko_ec_enabled) {
          if (!productInfo.ochanoko_product_id) {
            throw new BackendCoreError({
              internalMessage: `
商品ID: ${productInfo.id} のOchanoko連携情報が不足しています
          `,
            });
          }
        }
        //無効にしようとしていたら
        else {
          console.log('Ochanoko出品取り消しを望んでいます');
        }
      }
    }

    //更新
    const updateRes = await this.db.product.update({
      where: {
        id: productInfo.id,
      },
      data: updateField,
      include: {
        specialty: true,
        item: {
          include: {
            category: true,
            genre: true,
          },
        },
      },
    });

    //有効にするやつが1つでもあったら在庫数を計算し直す
    if (mycalinks_ec_enabled || shopify_ec_enabled || ochanoko_ec_enabled) {
      await this.recalculateEcStockNumber({
        specificProductInfo: updateRes,
      });
    }

    return updateRes;
  };

  /**
   * 在庫を論理削除
   */
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public async delete({
    specificProductInfo,
  }: {
    specificProductInfo?: Product;
  }) {
    //商品情報を取得

    const productInfo = specificProductInfo ?? (await this.ifExists());

    //在庫数が0じゃなかったらエラー
    if (productInfo.stock_number > 0) {
      throw new BackendCoreError({
        internalMessage: '在庫数が0以上のため、削除できません',
        externalMessage: '在庫数が0以上のため、削除できません',
      });
    }

    //削除する
    const updateRes = await this.db.product.update({
      where: {
        id: productInfo.id,
      },
      data: {
        deleted: true,
      },
    });

    return updateRes;
  }

  /**
   * ECの在庫をできるだけ出品する
   */
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public publishEcStockToMaximum = async () => {
    const productInfo = await this.db.product.findUnique({
      where: {
        id: this.ids.productId!,
        store_id: this.ids.storeId!,
        deleted: false,
      },
      include: {
        specialty: true,
        item: {
          include: {
            category: true,
            genre: true,
          },
        },
      },
    });

    if (!productInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    const ecStockNumberMargin = this.checkEcStockNumberIsValid(productInfo);

    //出品できる余裕があったら出品する
    if (ecStockNumberMargin > 0) {
      await this.safeTransaction(async (tx) => {
        await this.increaseEcStock({
          increaseCount: ecStockNumberMargin,
          source_kind: ProductEcStockHistorySourceKind.publish,
          description: `EC在庫${productInfo.id} の数を最大数まで出品するために ${ecStockNumberMargin}個増やしました`,
          specificProductInfo: productInfo,
        });
      });
    }
  };

  /**
   * ECの在庫数を適正な値に変える
   *
   * 20250618: マージンがあった場合、その分自動出品する形に変更
   */
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public recalculateEcStockNumber = async ({
    specificProductInfo,
  }: {
    specificProductInfo?: Product & {
      specialty: Specialty | null;
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    };
  }) => {
    const productInfo =
      specificProductInfo ??
      (await this.db.product.findUnique({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
          deleted: false,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      }));

    if (!productInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    const ecStockNumberMargin = this.checkEcStockNumberIsValid(productInfo);
    let thisHistoryInfo: Product_Ec_Stock_History | null = null;

    if (ecStockNumberMargin < 0) {
      await this.safeTransaction(async (tx) => {
        const changeResult = await this.decreaseEcStock({
          decreaseCount: Math.abs(ecStockNumberMargin),
          source_kind: ProductEcStockHistorySourceKind.recalculate,
          description: `EC在庫${
            productInfo.id
          } の数を適正な値に変えるために${Math.abs(
            ecStockNumberMargin,
          )}個減らしました`,
          specificProductInfo: productInfo,
        });

        thisHistoryInfo = changeResult.ecStockHistory;

        console.log(changeResult);
      });
    } else if (ecStockNumberMargin > 0) {
      await this.safeTransaction(async (tx) => {
        const changeResult = await this.increaseEcStock({
          increaseCount: ecStockNumberMargin,
          source_kind: ProductEcStockHistorySourceKind.publish,
          description: `EC在庫${productInfo.id} の数を適正な値に変えるために${ecStockNumberMargin}個増やしました`,
          specificProductInfo: productInfo,
        });

        thisHistoryInfo = changeResult.ecStockHistory;

        console.log(changeResult);
      });
    }

    return {
      ecStockHistory: thisHistoryInfo,
    };
  };

  /**
   * ECでそもそも利用可能か判断
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public async checkIfEcAvailable(
    productInfo: Product & {
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    },
  ) {
    if (!this.resources.store?.ec_setting) return false;
    if (!productInfo.item.genre?.ec_enabled) return false;
    if (!productInfo.item.category.ec_enabled) return false;

    return true;
  }

  /**
   * ECの在庫数を手動で変動させるやつ 仕入れ値とかは気にしなくて良い
   * - 自動出品 POS変動から呼ばれる
   * - 出品 直接呼ばれる
   * - EC返品 直接呼ばれる
   */
  @BackendService.WithTx
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public increaseEcStock = async ({
    increaseCount,
    unit_price,
    source_kind,
    source_id,
    description,
    ecStop,
    specificProductInfo,
  }: {
    increaseCount: number; //増やすEC在庫の数
    source_kind: Product_Ec_Stock_History['source_kind'];
    source_id?: Product_Ec_Stock_History['source_id'];
    unit_price?: Product_Ec_Stock_History['unit_price'];
    description?: Product_Ec_Stock_History['description'];
    ecStop?: boolean; //EC出品取り消しをしたい時（欠品など）
    specificProductInfo?: Product & {
      specialty: Specialty | null;
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    };
  }) => {
    const staff_account_id =
      this.resources?.actionAccount?.id ??
      BackendService.coreConfig.systemAccountId;

    if (increaseCount <= 0)
      throw new BackendCoreError({
        internalMessage: '在庫変動数を0より大きい数で指定してください',
        externalMessage: '在庫変動数を0より大きい数で指定してください',
      });

    let thisProductInfo =
      specificProductInfo ??
      (await this.db.product.findUnique({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
          deleted: false,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      }));

    //返品とかではなくて、ECで無効になっている在庫だったらエラー

    if (!thisProductInfo)
      throw new BackendCoreError({
        internalMessage: '商品が存在しません',
        externalMessage: '商品が存在しません',
      });

    if (!(await this.checkIfEcAvailable(thisProductInfo)))
      throw new BackendCoreError({
        internalMessage: 'この在庫はECで利用可能になっていません',
        externalMessage: 'この在庫はECで利用可能になっていません',
      });

    // 自動出品という概念は無くなったためこれは考慮しなくてOK
    // //自動出品を選択しているのに自動出品設定がオフになっていたらエラー
    // if (
    //   source_kind == ProductEcStockHistorySourceKind.auto_stocking &&
    //   !this.checkIfEcAutoStockingIsEnabled(thisProductInfo)
    // )
    //   throw new BackendCoreError({
    //     internalMessage:
    //       '自動出品を選択しているのに自動出品設定がオフになっています',
    //   });

    const updateField: Prisma.ProductUpdateInput = {};

    //ecStopが指定されていたら出品取り消し
    if (
      source_kind == ProductEcStockHistorySourceKind.mycalinks_ec_sell_return &&
      ecStop
    )
      updateField.mycalinks_ec_enabled = false;

    thisProductInfo = await this.db.product.update({
      where: {
        id: thisProductInfo.id,
      },
      data: {
        ...updateField,
        ec_stock_number: {
          increment: increaseCount,
        },
      },
      include: {
        specialty: true,
        item: {
          include: {
            category: true,
            genre: true,
          },
        },
      },
    });

    //EC在庫数の余裕を確認
    const ecStockNumberMargin = this.checkEcStockNumberIsValid(thisProductInfo);

    //返品ではなくて、マージンがなかったらエラー
    if (
      source_kind != ProductEcStockHistorySourceKind.mycalinks_ec_sell_return &&
      ecStockNumberMargin < 0
    )
      throw new BackendCoreError({
        internalMessage: `EC在庫${thisProductInfo.id}の在庫数はこの数まで増やせません`,
      });

    //同時にoutboxを作る（これを読み取ることで他の外部ECは在庫数を変動させる）

    const needOutbox =
      thisProductInfo.ochanoko_ec_enabled || thisProductInfo.shopify_ec_enabled;

    const [thisHistoryInfo] = await Promise.all([
      this.db.product_Ec_Stock_History.create({
        data: {
          product_id: thisProductInfo.id,
          source_kind,
          source_id,
          item_count: increaseCount,
          unit_price: unit_price ?? 0,
          description,
          staff_account_id,
          result_ec_stock_number: thisProductInfo.ec_stock_number,
        },
      }),
      needOutbox &&
        this.db.outbox_Ec_Product_Stock_History.create({
          data: {
            product_id: thisProductInfo.id,
            store_id: this.ids.storeId!,
            item_count: increaseCount,
            result_stock_number: thisProductInfo.ec_stock_number,
            ochanoko_product_id: thisProductInfo.ochanoko_ec_enabled
              ? thisProductInfo.ochanoko_product_id
              : null,
            shopify_product_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_product_id
              : null,
            shopify_product_variant_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_product_variant_id
              : null,
            shopify_inventory_item_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_inventory_item_id
              : null,
            source_kind,
            source_id,
            description,
          },
        }),
    ]);

    //POSの変動も起こすパターン

    let stockHistory: Product_Stock_History | null = null;
    let recordInfo: Awaited<
      ReturnType<
        typeof BackendCoreProductWholesalePriceService.prototype.getRecords
      >
    > | null = null;

    switch (source_kind) {
      case ProductEcStockHistorySourceKind.mycalinks_ec_sell_return: {
        if (!source_id)
          throw new BackendCoreError({
            internalMessage: `EC在庫返品でEC注文IDが指定されていません`,
          });

        //返品だった場合、POSの在庫数も増やす
        const changeResult = await this.increaseStock({
          increaseCount,
          source_kind: ProductStockHistorySourceKind.ec_sell_return,
          source_id: source_id,
          description: description,
          specificProductInfo: thisProductInfo,
        });
        console.log(changeResult);
        stockHistory = changeResult.stockHistory;
        recordInfo = changeResult.recordInfo ?? null;
        break;
      }
    }

    return {
      ecStockHistory: thisHistoryInfo,
      stockHistory,
      recordInfo,
    };
  };

  /**
   * ECの在庫減少関数
   * - EC販売
   * - 再計算による調整
   */
  @BackendService.WithTx
  @BackendService.WithIds(['productId', 'storeId'])
  @BackendService.WithResources(['store'])
  public decreaseEcStock = async ({
    decreaseCount,
    unit_price,
    source_kind,
    source_id,
    description,
    specificProductInfo,
  }: {
    decreaseCount: number;
    unit_price?: Product_Ec_Stock_History['unit_price'];
    source_kind: Product_Ec_Stock_History['source_kind'];
    source_id?: Product_Ec_Stock_History['source_id'];
    description?: Product_Ec_Stock_History['description'];
    specificProductInfo?: Product & {
      specialty: Specialty | null;
      item: Item & {
        category: Item_Category;
        genre: Item_Genre | null;
      };
    };
  }) => {
    const staff_account_id =
      this.resources?.actionAccount?.id ??
      BackendService.coreConfig.systemAccountId;

    if (decreaseCount < 0)
      throw new BackendCoreError({
        internalMessage: '在庫変動数を0より大きい数で指定してください',
        externalMessage: '在庫変動数を0より大きい数で指定してください',
      });

    let thisProductInfo =
      specificProductInfo ??
      (await this.db.product.findUnique({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
          deleted: false,
          mycalinks_ec_enabled: true,
        },
        include: {
          specialty: true,
          item: {
            include: {
              category: true,
              genre: true,
            },
          },
        },
      }));

    if (!thisProductInfo)
      throw new BackendCoreError({
        internalMessage: '存在しない商品です',
        externalMessage: '存在しない商品です',
      });

    if (!(await this.checkIfEcAvailable(thisProductInfo)))
      throw new BackendCoreError({
        internalMessage: 'この在庫はECで利用可能になっていません',
        externalMessage: 'この在庫はECで利用可能になっていません',
      });

    const productInfoString = `
      商品名: ${this.getProductNameWithMeta(thisProductInfo)}
          `;

    //変動を起こす
    thisProductInfo = await this.db.product.update({
      where: {
        id: thisProductInfo.id,
      },
      data: {
        ec_stock_number: { decrement: decreaseCount },
      },
      include: {
        specialty: true,
        item: {
          include: {
            category: true,
            genre: true,
          },
        },
      },
    });

    //在庫数が0より少なくなっていたらエラー
    if (thisProductInfo.ec_stock_number < 0)
      throw new BackendCoreError({
        internalMessage: `商品ID: ${thisProductInfo.id}の在庫が0より少なくなってしまいます`,
        externalMessage: `商品の在庫数が足りません
    ${productInfoString}`,
      });

    //EC在庫数の余裕を確認
    const ecStockNumberMargin = this.checkEcStockNumberIsValid(thisProductInfo);

    //マージンがなかったらエラー
    if (ecStockNumberMargin < 0)
      throw new BackendCoreError({
        internalMessage: `EC在庫${thisProductInfo.id}の在庫数はこの数まで増やせません`,
      });

    //historyを作る 外部ec連携がある場合はoutboxも作る
    const needOutbox =
      thisProductInfo.ochanoko_ec_enabled || thisProductInfo.shopify_ec_enabled;

    const [thisHistoryInfo] = await Promise.all([
      this.db.product_Ec_Stock_History.create({
        data: {
          product_id: thisProductInfo.id,
          source_kind,
          source_id,
          item_count: -1 * decreaseCount,
          unit_price: unit_price ?? thisProductInfo.actual_ec_sell_price ?? 0,
          description,
          staff_account_id,
          result_ec_stock_number: thisProductInfo.ec_stock_number,
        },
      }),
      needOutbox &&
        this.db.outbox_Ec_Product_Stock_History.create({
          data: {
            product_id: thisProductInfo.id,
            ochanoko_product_id: thisProductInfo.ochanoko_ec_enabled
              ? thisProductInfo.ochanoko_product_id
              : null,
            shopify_product_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_product_id
              : null,
            shopify_product_variant_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_product_variant_id
              : null,
            shopify_inventory_item_id: thisProductInfo.shopify_ec_enabled
              ? thisProductInfo.shopify_inventory_item_id
              : null,
            store_id: this.ids.storeId!,
            item_count: -1 * decreaseCount,
            result_stock_number: thisProductInfo.ec_stock_number,
            source_kind,
            source_id,
            description,
          },
        }),
    ]);

    //POSの変動も起こすパターン recalculateはPOS起因の処理であるため、POSの変動は起こさない
    let stockHistory: Product_Stock_History | null = null;
    let recordInfo: Awaited<
      ReturnType<
        typeof BackendCoreProductWholesalePriceService.prototype.getRecords
      >
    > | null = null;

    switch (source_kind) {
      case ProductEcStockHistorySourceKind.shopify_ec_sell:
      case ProductEcStockHistorySourceKind.ochanoko_ec_sell:
      case ProductEcStockHistorySourceKind.mycalinks_ec_sell: {
        if (!source_id)
          throw new BackendCoreError({
            internalMessage: `EC在庫変動でEC注文IDが指定されていません`,
          });

        const changeResult = await this.decreaseStock({
          decreaseCount,
          source_kind: ProductStockHistorySourceKind.ec_sell,
          source_id: source_id,
          description: description,
          unit_price: thisHistoryInfo.unit_price,
          specificProductInfo: thisProductInfo,
        });

        stockHistory = changeResult.stockHistory;
        recordInfo = changeResult.recordInfo;
        break;
      }
    }

    return {
      ecStockHistory: thisHistoryInfo,
      stockHistory,
      recordInfo,
    };
  };

  /**
   * 特定の状態の特定の在庫を1つ作成
   * 今のところ通常商品のみ
   */
  @BackendService.WithIds(['storeId', 'itemId'])
  @BackendService.WithResources(['store'])
  @BackendService.WithTx
  public async create({
    conditionOptionId,
    specificItemInfo,
    additionalField = {},
  }: {
    conditionOptionId: Item_Category_Condition_Option['id'];
    specificItemInfo?: Item & {
      category: Item_Category & {
        condition_options: Array<Item_Category_Condition_Option>;
      };
    };
    additionalField?: Partial<Product>;
  }) {
    //逆にproductIdが指定されていたらダメに
    if (this.ids.productId)
      throw new BackendCoreError({
        internalMessage:
          '商品IDが指定されているので、商品を作成することはできません',
        externalMessage:
          '商品IDが指定されているので、商品を作成することはできません',
      });

    const thisItemInfo =
      specificItemInfo ??
      (await this.db.item.findUnique({
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
        internalMessage: '指定されたアイテムが存在しません',
      });

    const thisCategoryInfo = thisItemInfo.category;
    const thisConditionOptionInfo = thisCategoryInfo.condition_options.find(
      (e) => e.id === conditionOptionId,
    );

    let specialtyInfo: Specialty | null = null;

    //スペシャルティが選択されていたら情報を取得する
    if (additionalField.specialty_id) {
      specialtyInfo = await this.db.specialty.findUnique({
        where: {
          store_id: this.ids.storeId!,
          id: additionalField.specialty_id,
        },
      });

      if (!specialtyInfo)
        throw new BackendCoreError({
          internalMessage: '指定されたスペシャルティが存在しません',
          externalMessage: '指定されたスペシャルティが存在しません',
        });

      //タブレットへはデフォルトで非表示にする
      // additionalField.tablet_allowed = false;

      //特殊状態は自動価格計算を無効にする
      additionalField.allow_sell_price_auto_adjustment = false;
      additionalField.allow_buy_price_auto_adjustment = false;
    }

    //コンディション選択肢がカテゴリの中に存在しているかを確認する
    if (!thisConditionOptionInfo)
      throw new BackendCoreError({
        internalMessage: '指定されたコンディション選択肢が存在しません',
      });

    //自動出品（Mycalinksだけ対象）
    let mycalinks_ec_enabled: Product['mycalinks_ec_enabled'] | undefined =
      undefined;

    if (
      this.resources.store?.ec_setting &&
      this.resources.store?.ec_setting.auto_listing
    ) {
      mycalinks_ec_enabled = true; //enableEcの方を使うかも
    }

    //鑑定在庫として出される時や、委託商品として出される時は自動価格調整をオフにする
    if (
      specialtyInfo?.kind == SpecialtyKind.APPRAISAL ||
      additionalField.consignment_client_id
    ) {
      additionalField.allow_buy_price_auto_adjustment = false;
      additionalField.allow_sell_price_auto_adjustment = false;
    }

    const createResult = await this.db.product.create({
      data: {
        display_name: thisItemInfo.display_name || '',
        is_buy_only: thisItemInfo.is_buy_only,
        image_url: thisItemInfo.image_url, //ここら辺のデータは継承する
        readonly_product_code: thisItemInfo.readonly_product_code,
        condition_option_id: conditionOptionId,
        mycalinks_ec_enabled,
        is_active: thisItemInfo.infinite_stock ? true : undefined,
        stock_number: thisItemInfo.infinite_stock ? 1 : undefined,
        ...additionalField,
        store_id: thisItemInfo.store_id,
        item_id: thisItemInfo.id,
      },
    });

    this.setIds({ productId: createResult.id });

    return createResult;
  }

  /**
   * 在庫情報を更新
   */
  @BackendService.WithResources(['store'])
  @BackendService.WithIds(['productId', 'storeId'])
  public async update({ data }: { data: ProductService.UpdateData }) {
    //変更前情報が必要
    if (!this.targetObject) {
      await this.ifExists();
    }

    //変更前情報を取得
    const prevData = this.targetObject!;

    const updateResult = await this.safeTransaction(async (tx) => {
      const {
        mycalinks_ec_enabled,
        shopify_ec_enabled,
        ochanoko_ec_enabled,
        recalculateEcStockNumber,
        ecPublishStockNumber,
        ecPublishToMaximum,
        ...updateField
      } = data;

      const updateRes = await tx.product.update({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
        },
        data: {
          ...updateField,
          ...(data.specific_sell_price != undefined &&
          prevData.specific_sell_price != data.specific_sell_price
            ? {
                sell_price_updated_at: new Date(),
              }
            : null),
          ...(data.specific_buy_price != undefined &&
          prevData.specific_buy_price != data.specific_buy_price
            ? {
                buy_price_updated_at: new Date(),
              }
            : null),
        },
        include: {
          specialty: true,
          item: {
            include: {
              genre: true,
              category: true,
            },
          },
        },
      });

      //EC有効化のくだり
      await this.enableEc({
        mycalinks_ec_enabled,
        shopify_ec_enabled,
        ochanoko_ec_enabled,
      });

      //ECの在庫数
      if (ecPublishStockNumber) {
        const changeRes = await this.increaseEcStock({
          increaseCount: ecPublishStockNumber,
          source_kind: ProductEcStockHistorySourceKind.publish,
          description: `EC在庫${this.ids.productId} の数を${ecPublishStockNumber}個増やしました`,
          specificProductInfo: updateRes,
        });
        console.log('changeRes', changeRes);
      }
      //最大出品
      else if (ecPublishToMaximum) {
        await this.publishEcStockToMaximum();
      }

      //pos用におさえたい在庫数を調整した場合、ecの在庫数を調整
      //もしくは再計算が指定されていた時
      if (
        (data.pos_reserved_stock_number !== undefined &&
          prevData.pos_reserved_stock_number !==
            updateRes.pos_reserved_stock_number) ||
        recalculateEcStockNumber
      ) {
        await this.recalculateEcStockNumber({
          specificProductInfo: updateRes,
        });
      }

      //独自価格を変更されていた時は、価格算出プロシージャを実行する
      //念の為buy_priceの方も
      if (
        (data.specific_sell_price != undefined &&
          prevData.specific_sell_price != data.specific_sell_price) ||
        (data.specific_buy_price != undefined &&
          prevData.specific_buy_price != data.specific_buy_price)
      ) {
        await this.db.$queryRaw`
        CALL AdjustedPriceInsertIntoProduct(${prevData.item_id}, 1)
        `;
      }

      return updateRes;
    });

    return {
      updateResult,
    };
  }

  /**
   * メタ情報まで取得したい時のフィールドのやつ
   */
  public static withMetaField = {
    display_name: true,
    management_number: true,
    specialty: {
      select: {
        display_name: true,
      },
    },
    item: {
      select: {
        rarity: true,
        expansion: true,
        cardnumber: true,
      },
    },
  } as const; //Prismaの型使うと複雑になりすぎるため定数として処理

  //EC向け
  public getEcProductName = (
    product: ProductService.WithMeta & {
      condition_option: {
        handle: Item_Category_Condition_Option['handle'];
      } | null;
    },
  ) => {
    const withMeta = this.getProductNameWithMeta(product);

    //状態を加える
    return `${withMeta} ${
      ecConstants.ecConditionOptionHandleDict[product.condition_option!.handle!]
    }`;
  };

  //メタ情報を含んだproductNameを取得
  public getProductNameWithMeta = (
    product: ProductService.WithMeta,
    // store?: Store,
  ) => {
    if (!product.item) return product.display_name;

    //設定を取得する
    // const storeInfo = this.resources.store!;

    //順番を見ていく
    // const orderRule = storeInfo.product_name_meta_order.split(',') as Array<
    //   keyof typeof product.item
    // >;
    const orderRule = ['expansion', 'cardnumber', 'rarity'] as const;

    //その順番通りに拾っていく
    let generated = this.getNameWithMeta({
      originalName: product.display_name,
      metas: orderRule.map((rule) => product.item![rule]),
    });

    if (product.specialty?.display_name) {
      generated = `《${product.specialty.display_name}》${generated}`;
    }

    if (
      product.management_number !== null &&
      product.management_number !== undefined
    ) {
      if (product.management_number === '') {
        generated = `${generated}(管理番号：未入力) `;
      } else {
        generated = `${generated}(${product.management_number}) `;
      }
    }

    //委託者名
    if (
      product.consignment_client?.display_name &&
      product.consignment_client.display_name_on_receipt
    ) {
      generated = `（${product.consignment_client.display_name}）${generated}`;
    }

    return generated;
  };

  private getNameWithMeta = ({
    originalName,
    metas,
  }: {
    originalName: string; //元々の名前
    metas: Array<string | null | undefined>; //メタたち
  }) => {
    metas = metas.filter(Boolean); //無効なメタは排除
    originalName = String(originalName || '');

    const metaInfo =
      !metas.every((e) => originalName.includes(e as string)) && metas.length
        ? `（${metas.join(' ')}）`
        : '';

    return originalName + metaInfo;
  };

  /**
   * 店舗間在庫移動用に、マッピング先のProductを取得 or 作成してそのproduct_idを返す
   */
  @BackendService.WithIds(['productId', 'storeId'])
  public async getMappingProduct({
    toStoreId,
    mappingDef,
  }: {
    toStoreId: Store['id'];
    mappingDef: MappingDef;
  }) {
    const toStoreResourceClass = new BackendService();

    //まずこの在庫の情報を取得する
    const [thisProductInfo, toStoreInfo] = await Promise.all([
      this.db.product.findUniqueExists({
        where: {
          id: this.ids.productId!,
          store_id: this.ids.storeId!,
        },
        include: {
          item: {
            include: {
              genre: true,
              category: true,
            },
          },
          condition_option: true,
          specialty: true,
        },
      }),
      this.db.store.findUnique({
        where: {
          id: toStoreId,
        },
        include: {
          ec_setting: true,
          accounts: true,
        },
      }),
    ]);

    if (!thisProductInfo) {
      throw new BackendCoreError({
        internalMessage: 'この商品は存在しません',
        externalMessage: 'この商品は存在しません',
      });
    }

    if (!toStoreInfo) {
      throw new BackendCoreError({
        internalMessage: 'マッピング先の店舗が存在しません',
        externalMessage: 'マッピング先の店舗が存在しません',
      });
    }

    //ここら辺の処理は共通化するかも
    toStoreResourceClass.generateService({
      ids: {
        storeId: toStoreId,
      },
      resources: {
        store: toStoreInfo,
      },
    });

    //マッピング先の状態などを取得していく
    let targetCategoryWhereInput: Prisma.Item_CategoryWhereInput;

    if (thisProductInfo.item.category.handle) {
      targetCategoryWhereInput = {
        store_id: toStoreId,
        handle: thisProductInfo.item.category.handle,
      };
    } else {
      const targetId = mappingDef.category.find(
        (e) => e.from_category_id === thisProductInfo.item.category.id,
      )?.to_category_id;
      if (!targetId) {
        throw new BackendCoreError({
          internalMessage: `categoryId: ${thisProductInfo.item.category.id} (${thisProductInfo.item.category.display_name}) のマッピングが登録されていません`,
          externalMessage: `categoryId: ${thisProductInfo.item.category.id} (${thisProductInfo.item.category.display_name}) のマッピングが登録されていません`,
        });
      }
      targetCategoryWhereInput = {
        id: targetId,
        store_id: toStoreId,
      };
    }

    let targetGenreWhereInput: Prisma.Item_GenreWhereUniqueInput;

    if (thisProductInfo.item.genre!.handle) {
      targetGenreWhereInput = {
        store_id_handle: {
          store_id: toStoreId,
          handle: thisProductInfo.item.genre!.handle,
        },
      };
    } else {
      const targetId = mappingDef.genre.find(
        (e) => e.from_genre_id === thisProductInfo.item.genre!.id,
      )?.to_genre_id;
      if (!targetId) {
        throw new BackendCoreError({
          internalMessage: `genreId: ${thisProductInfo.item.genre!.id} (${
            thisProductInfo.item.genre!.display_name
          }) のマッピングが登録されていません`,
          externalMessage: `genreId: ${thisProductInfo.item.genre!.id} (${
            thisProductInfo.item.genre!.display_name
          }) のマッピングが登録されていません`,
        });
      }
      targetGenreWhereInput = {
        id: targetId,
        store_id: toStoreId,
      };
    }

    let targetSpecialtyWhereInput:
      | Prisma.SpecialtyWhereUniqueInput
      | undefined = undefined;

    //特殊状態が紐づいてなかったら飛ばす
    if (!thisProductInfo.specialty) {
    } else {
      const targetId = mappingDef.specialty.find(
        (e) => e.from_specialty_id === thisProductInfo.specialty!.id,
      )?.to_specialty_id;
      if (!targetId) {
        throw new BackendCoreError({
          internalMessage: `specialtyId: ${thisProductInfo.specialty!.id} (${
            thisProductInfo.specialty!.display_name
          }) のマッピングが登録されていません`,
          externalMessage: `specialtyId: ${thisProductInfo.specialty!.id} (${
            thisProductInfo.specialty!.display_name
          }) のマッピングが登録されていません`,
        });
      }

      targetSpecialtyWhereInput = {
        id: targetId,
        store_id: toStoreId,
      };
    }

    //状態
    let targetConditionOptionWhereInput: Prisma.Item_Category_Condition_OptionWhereInput;

    //カテゴリのマッピングはもうすでにやっているため、カテゴリの方までは考慮しなくても大丈夫
    if (thisProductInfo.item.category.handle !== ItemCategoryHandle.CARD) {
      if (!thisProductInfo.condition_option?.handle)
        throw new BackendCoreError({
          internalMessage: `無効な状態選択肢`,
          externalMessage: `無効な状態選択肢`,
        });
      targetConditionOptionWhereInput = {
        handle: thisProductInfo.condition_option!.handle,
        item_category: targetCategoryWhereInput,
      };
    } else {
      //マッピング
      const targetId = mappingDef.condition_option.find(
        (e) => e.from_option_id === thisProductInfo.condition_option!.id,
      )?.to_option_id;
      if (!targetId) {
        throw new BackendCoreError({
          internalMessage: `conditionOptionId: ${
            thisProductInfo.condition_option!.id
          } (${
            thisProductInfo.condition_option!.display_name
          }) のマッピングが登録されていません`,
          externalMessage: `conditionOptionId: ${
            thisProductInfo.condition_option!.id
          } (${
            thisProductInfo.condition_option!.display_name
          }) のマッピングが登録されていません`,
        });
      }

      targetConditionOptionWhereInput = {
        id: targetId,
        item_category: targetCategoryWhereInput,
      };
    }

    //委託者のマッピング
    let targetConsignmentClientWhereInput:
      | Prisma.Consignment_ClientWhereUniqueInput
      | undefined = undefined;
    if (thisProductInfo.consignment_client_id) {
      const targetId = mappingDef.consignment_client.find(
        (e) => e.from_client_id === thisProductInfo.consignment_client_id,
      )?.to_client_id;
      if (!targetId) {
        throw new BackendCoreError({
          internalMessage: `consignmentClientId: ${thisProductInfo.consignment_client_id} のマッピングが登録されていません`,
          externalMessage: `consignmentClientId: ${thisProductInfo.consignment_client_id}  のマッピングが登録されていません`,
        });
      }
      targetConsignmentClientWhereInput = {
        id: targetId,
        store_id: toStoreId,
      };
    }

    //商品マスタ
    let targetItemWhereInput: Prisma.ItemWhereUniqueInput;

    if (thisProductInfo.item.myca_item_id) {
      //Myca連携済みのやつだったらmycaItemIdをキーに探す
      targetItemWhereInput = {
        store_id_myca_item_id: {
          store_id: toStoreId,
          myca_item_id: thisProductInfo.item.myca_item_id,
        },
      };
    } else {
      //それ以外は独自商品マスタであるため、すでにマッピングが定義されているか探す
      targetItemWhereInput = {
        id:
          mappingDef.item.find(
            (e) => e.from_item_id === thisProductInfo.item.id,
          )?.to_item_id ?? 0,
      };
    }

    //とりあえず一通り取得してみる
    let [
      targetCategory,
      targetGenre,
      targetSpecialty,
      targetConditionOption,
      targetConsignmentClient,
      targetItem,
    ] = await Promise.all([
      this.db.item_Category.findFirst({
        where: targetCategoryWhereInput,
      }),
      this.db.item_Genre.findUnique({
        where: targetGenreWhereInput,
      }),
      targetSpecialtyWhereInput
        ? this.db.specialty.findUnique({
            where: targetSpecialtyWhereInput,
          })
        : null,
      this.db.item_Category_Condition_Option.findFirst({
        where: targetConditionOptionWhereInput,
      }),
      targetConsignmentClientWhereInput
        ? this.db.consignment_Client.findUnique({
            where: targetConsignmentClientWhereInput,
          })
        : null,
      this.db.item.findUniqueExists({
        where: targetItemWhereInput,
      }),
    ]);

    //カテゴリーと状態がなかったらおかしいためエラー
    if (!targetCategory || !targetConditionOption) {
      throw new BackendCoreError({
        internalMessage: `マッピング先のカテゴリや状態が見つかりませんでした`,
        externalMessage: `マッピング先のカテゴリや状態が見つかりませんでした`,
      });
    }

    //特殊状態の場合も
    if (thisProductInfo.specialty_id && !targetSpecialty) {
      throw new BackendCoreError({
        internalMessage: `マッピング先の特殊状態が見つかりませんでした`,
        externalMessage: `マッピング先の特殊状態が見つかりませんでした`,
      });
    }

    //委託者の場合も
    if (thisProductInfo.consignment_client_id && !targetConsignmentClient) {
      throw new BackendCoreError({
        internalMessage: `マッピング先の委託者が見つかりませんでした`,
        externalMessage: `マッピング先の委託者が見つかりませんでした`,
      });
    }

    //ジャンルの場合、なかったら向こう側に作れないか打診
    if (!targetGenre) {
      if (thisProductInfo.item.genre?.handle) {
        const toStoreDepartmentService = new BackendCoreDepartmentService(
          toStoreId,
        );
        toStoreResourceClass.give(toStoreDepartmentService);
        const createRes = await toStoreDepartmentService.createFixedItemGenre(
          thisProductInfo.item.genre.handle,
        );
        targetGenre = createRes;
      } else {
        throw new BackendCoreError({
          internalMessage: `マッピング先のジャンルが見つかりませんでした`,
          externalMessage: `マッピング先のジャンルが見つかりませんでした`,
        });
      }
    }

    //商品マスタの場合も、なかったら向こう側に作る
    if (!targetItem) {
      const itemService = new BackendCoreItemService();
      toStoreResourceClass.give(itemService);

      let createDataQuery: ItemCreateData | null = null;

      if (thisProductInfo.item.myca_item_id) {
        const query = await itemService.createQueryFromMycaApp({
          props: {
            id: thisProductInfo.item.myca_item_id,
          },
        });
        const itemQueries = query.itemQueries;

        if (itemQueries.length != 1)
          throw new BackendCoreError({
            internalMessage: `指定されたMycaアプリのIDの情報を取得することができませんでした`,
            externalMessage: `指定されたMycaアプリのIDの情報を取得することができませんでした`,
          });

        createDataQuery = itemQueries[0];
      } else {
        //独自商品マスタだったら、向こう側に同じようなものを作る
        const item = thisProductInfo.item;
        createDataQuery = {
          genre: {
            connect: {
              id: targetGenre.id,
            },
          },
          category: {
            connect: {
              id: targetCategory.id,
            },
          },
          image_url: item.image_url,
          display_name: `${item.display_name}（在庫移動）`,
          display_name_ruby: item.display_name_ruby,
          sell_price: item.sell_price,
          buy_price: item.buy_price,
          is_buy_only: item.is_buy_only,
          order_number: item.order_number,
          readonly_product_code: item.readonly_product_code,
          description: item.description,
          rarity: item.rarity,
          pack_name: item.pack_name,
          expansion: item.expansion,
          keyword: item.keyword,
          cardnumber: item.cardnumber,
          cardseries: item.cardseries,
          card_type: item.card_type,
          option1: item.option1,
          option2: item.option2,
          option3: item.option3,
          option4: item.option4,
          option5: item.option5,
          option6: item.option6,
          displaytype1: item.displaytype1,
          displaytype2: item.displaytype2,
          release_date: item.release_date,
          release_at: item.release_at,
          box_pack_count: item.box_pack_count,
          weight: item.weight,
          allow_auto_print_label: item.allow_auto_print_label,
          allow_round: item.allow_round,
          infinite_stock: item.infinite_stock,
          tablet_allowed: item.tablet_allowed,
        };
      }

      //作る
      const txRes = await toStoreResourceClass.transaction(async (tx) => {
        const insertRes = await itemService.create({
          data: createDataQuery,
        });

        //独自商品マスタだったら、マッピングを作成する
        if (!insertRes.myca_item_id) {
          await tx.item_Mapping.create({
            data: {
              from_store_id: this.ids.storeId!,
              to_store_id: toStoreId,
              from_item_id: thisProductInfo.item.id,
              to_item_id: insertRes.id,
            },
          });
          console.log(
            `店舗間在庫移動のために新しく商品マスタが作成され、マッピングを形成しました`,
            insertRes,
          );
        }

        return insertRes;
      });

      targetItem = txRes;
    }

    //いよいよ在庫を探していく
    //この特殊状態のこの状態の在庫があったらそれを使うが、
    //管理番号が指定されていたり、まだ作成されていない特殊状態付きの在庫だった場合はこの場で作成する

    let targetProductInfo: Product | null =
      await this.db.product.findFirstExists({
        where: {
          item_id: targetItem.id,
          condition_option_id: targetConditionOption.id,
          specialty_id: targetSpecialty?.id ?? null,
          consignment_client_id: targetConsignmentClient?.id ?? null,
          management_number: null, //管理番号がついてないやつに限る
        },
      });

    //あったらそれをそのまま使うが、なかったら作る
    if (!targetProductInfo || thisProductInfo.management_number) {
      const productService = new BackendCoreProductService();
      toStoreResourceClass.give(productService);
      productService.setIds({
        itemId: targetItem.id,
      });

      await toStoreResourceClass.transaction(async (tx) => {
        targetProductInfo = await productService.create({
          conditionOptionId: targetConditionOption.id,
          additionalField: {
            management_number: thisProductInfo.management_number ?? null,
            specialty_id: targetSpecialty?.id ?? null,
            consignment_client_id: targetConsignmentClient?.id ?? null,
            specific_sell_price: thisProductInfo.specific_sell_price ?? null,
            specific_buy_price: thisProductInfo.specific_buy_price ?? null,
          },
        });
        console.log(
          '店舗間在庫移動のために新しく在庫が作成されました',
          targetProductInfo,
        );
      });
    }

    return targetProductInfo;
  }
}

export namespace ProductService {
  /**
   * 在庫情報の更新　仕入れなどはまた別
   */
  export type UpdateData = {
    display_name?: Product['display_name'];
    image_url?: Product['image_url'];
    description?: Product['description'];
    tablet_allowed?: Product['tablet_allowed'];
    specific_sell_price?: Product['specific_sell_price'];
    specific_buy_price?: Product['specific_buy_price'];
    allowed_point?: Product['allowed_point'];
    readonly_product_code?: Product['readonly_product_code'];
    disable_ec_auto_stocking?: Product['disable_ec_auto_stocking'];
    pos_reserved_stock_number?: Product['pos_reserved_stock_number'];
    specific_ec_sell_price?: Product['specific_ec_sell_price'];
    ochanoko_product_id?: Product['ochanoko_product_id'];

    mycalinks_ec_enabled?: Product['mycalinks_ec_enabled'];
    shopify_ec_enabled?: Product['shopify_ec_enabled'];
    ochanoko_ec_enabled?: Product['ochanoko_ec_enabled'];

    shopify_product_id?: Product['shopify_product_id'];
    shopify_product_variant_id?: Product['shopify_product_variant_id'];
    shopify_inventory_item_id?: Product['shopify_inventory_item_id'];

    allow_buy_price_auto_adjustment?: Product['allow_buy_price_auto_adjustment'];
    allow_sell_price_auto_adjustment?: Product['allow_sell_price_auto_adjustment'];

    // ec_stock_number?: Product['ec_stock_number'];
    //以下は一旦使わないことになった
    ecPublishStockNumber?: number; //ECに出品する数
    ecPublishToMaximum?: boolean; //ECに最大限出品するかどうか
    recalculateEcStockNumber?: boolean; //EC在庫数を再計算するかどうか
  };

  export type WithMeta = {
    display_name: Product['display_name'];
    consignment_client?: {
      display_name: Consignment_Client['display_name'];
      display_name_on_receipt: Consignment_Client['display_name_on_receipt'];
    };
    item: {
      rarity: Item['rarity'];
      expansion: Item['expansion'];
      cardnumber: Item['cardnumber'];
    };
    specialty: {
      display_name: Specialty['display_name'];
    } | null;
    management_number: Product['management_number'];
  };
}
