import { apiRole, BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma, Product, TaskSourceKind } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { customDayjs, ProductCsvUploadOptions } from 'common';
import { ItemTask, TaskManager } from 'backend-core';
import { productCsvUploadDef } from '@/app/api/store/[store_id]/product/api';
import { LabelPrinterOptions } from '@/contexts/LabelPrinterContext';
import { posCommonConstants } from 'common';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//在庫一覧のCSVをダウンロードする
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const { specificDate, item_genre_id, item_category_id } = API.query; //特定の日付を指定する時
    const isToday =
      !specificDate || customDayjs(specificDate).isSame(new Date(), 'day');

    //whereクエリを組み立てる必要があるか検討
    let whereQueryString: Prisma.Sql = Prisma.sql``;

    if (item_category_id) {
      if (!isToday) {
        // specificDateが指定された場合はFact_Daily_Productのcategory_idを使用
        whereQueryString = Prisma.sql`
        ${whereQueryString}
         AND Fact_Daily_Product.category_id IN (${Prisma.join(
           item_category_id.split(',').map((e: string) => Number(e)),
         )})
        `;
      } else {
        // 通常の場合はItemのcategory_idを使用
        whereQueryString = Prisma.sql`
        ${whereQueryString}
         AND Item.category_id IN (${Prisma.join(
           item_category_id.split(',').map((e: string) => Number(e)),
         )})
        `;
      }
    }

    if (item_genre_id) {
      if (!isToday) {
        // specificDateが指定された場合はFact_Daily_Productのgenre_idを使用
        whereQueryString = Prisma.sql`
        ${whereQueryString}
         AND Fact_Daily_Product.genre_id IN (${Prisma.join(
           item_genre_id.split(',').map((e: string) => Number(e)),
         )})
        `;
      } else {
        // 通常の場合はItemのgenre_idを使用
        whereQueryString = Prisma.sql`
        ${whereQueryString}
         AND Item.genre_id IN (${Prisma.join(
           item_genre_id.split(',').map((e: string) => Number(e)),
         )})
        `;
      }
    }

    const domain = 'product';

    const csvService = new BackendApiCsvService(API, domain);
    const fileService = new BackendApiFileService(API);

    //日付を指定されているか否かで大きく変わってくる
    //指定されていない場合、現在の情報であるためProductテーブルからとってくる
    //されている場合、過去の情報を参照するためFact_Daily_Productテーブルからとってくる

    //ストリーミング書き出しを実施
    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: domain,
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;
        const chunkSize = 1000;
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          let allProducts: Array<typeof csvService.core.dataRecord> = [];

          if (!isToday) {
            allProducts = await API.db.$queryRaw<
              Array<typeof csvService.core.dataRecord>
            >`
            SELECT
              Product.id,
              ${
                posCommonConstants.productCodePrefix
              } + Product.id AS 'product_code',
              Product.item_id,
              Fact_Daily_Product.myca_item_id,
              Product.display_name,
              condition_option_display_name,
              Fact_Daily_Product.average_wholesale_price,
              Fact_Daily_Product.minimum_wholesale_price,
              Fact_Daily_Product.maximum_wholesale_price,
              Product.readonly_product_code,
              genre_display_name,
              category_display_name,
              specialty_display_name,
              Product.management_number,
              Product.tablet_allowed,
              Product.mycalinks_ec_enabled,
              Product.ochanoko_product_id,
              Product.shopify_product_id,
              Product.shopify_product_variant_id,
              Product.shopify_inventory_item_id,
              Fact_Daily_Product.actual_sell_price AS 'sell_price',
              Fact_Daily_Product.actual_buy_price AS 'buy_price',
              Fact_Daily_Product.stock_number AS 'stock_number',
              Item.rarity AS 'rarity',
              Item.pack_name AS 'pack_name'
            FROM
              Product
            INNER JOIN
              Item
            ON Product.item_id = Item.id
            INNER JOIN
              Fact_Daily_Product
            ON Fact_Daily_Product.product_id = Product.id

            WHERE Product.store_id = ${parseInt(store_id)}
            AND target_day = DATE(${specificDate})
            AND Item.infinite_stock = 0
            ${whereQueryString}

            ORDER BY Product.id ASC

            LIMIT ${chunkSize} OFFSET ${skip}
            `;
          } else {
            allProducts = await API.db.$queryRaw<
              Array<typeof csvService.core.dataRecord>
            >`
            SELECT
              Product.id,
              ${
                posCommonConstants.productCodePrefix
              } + Product.id AS 'product_code',
              Product.item_id,
              Item.myca_item_id,
              Product.display_name,
              Item_Category_Condition_Option.display_name AS 'condition_option_display_name',
              Product.average_wholesale_price,
              Product.minimum_wholesale_price,
              Product.maximum_wholesale_price,
              Product.readonly_product_code,
              Item_Genre.display_name AS 'genre_display_name',
              Item_Category.display_name AS 'category_display_name',
              Specialty.display_name AS 'specialty_display_name',
              Product.management_number,
              Product.tablet_allowed,
              Product.mycalinks_ec_enabled,
              Product.ochanoko_product_id,
              Product.shopify_product_id,
              Product.shopify_product_variant_id,
              Product.shopify_inventory_item_id,
              Product.sell_price AS 'sell_price',
              Product.buy_price AS 'buy_price',
              Product.specific_sell_price AS 'specific_sell_price',
              Product.specific_buy_price AS 'specific_buy_price',
              Product.stock_number AS 'stock_number',
              Item.rarity AS 'rarity',
              Item.pack_name AS 'pack_name'
            FROM
              Product
            LEFT JOIN
              Item_Category_Condition_Option
            ON Item_Category_Condition_Option.id = Product.condition_option_id

            LEFT JOIN
              Item
            ON Product.item_id = Item.id

            LEFT JOIN
              Item_Genre
            ON Item.genre_id = Item_Genre.id

            LEFT JOIN
              Item_Category
            ON Item.category_id = Item_Category.id

            LEFT JOIN
              Specialty
            ON Product.specialty_id = Specialty.id

            WHERE Product.store_id = ${parseInt(store_id)}
            AND Product.deleted = 0
            AND Item.status != 'DELETED'
            AND Product.is_active = 1
            AND Item.infinite_stock = 0
            ${whereQueryString}

            ORDER BY Product.id ASC

            LIMIT ${chunkSize} OFFSET ${skip}
            `;
          }

          skip += chunkSize;
          if (allProducts.length < chunkSize) {
            hasMore = false;
          }

          const targetData = allProducts.filter((e) => e.stock_number > 0);

          if (targetData.length) {
            await csvService.core.maker(
              targetData, //[TODO] 見直し
              true,
            );
          }
          console.log(`${targetData.length}件の新規データを書き出しました`);
        }
      },
    });

    return API.status(200).response({ data: { fileUrl: uploadRes } });
  },
);

//商品マスタ関連のCSVの処理
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const fileService = new BackendApiFileService(API);
    const fileData = fileService.getFileData('file');

    if (!fileData || fileData.extension != '.csv')
      return API.status(400).response({
        msgContent: ResponseMsgKind.notEnoughData,
      });

    const { store_id } = API.params;
    const options = API.body.json?.options as ProductCsvUploadOptions;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //先にMycaのItem情報を取得しておく

    //それぞれのテンプレートについて定義していく

    //CSVファイルを確認
    const csvService = new BackendApiCsvService(API, 'product');
    const { data } = csvService.parser('file');

    //商品マスタのCSV処理は以下の通り

    //新規作成（コード系が指定されていなかった場合）
    //情報更新（コード系が指定されていた場合）

    const updateProductTasks: Array<ItemTask.UpdateProductData> = [];
    const stockingTasks: Array<ItemTask.Stocking> = [];

    //先にitem情報を取得しておく
    const includeStocking =
      data.find((e) => e.stocking_item_count) && options?.stocking;

    const includeLabelPrint = options?.printLabel;

    const ids = new Set(
      data
        .map((e) => Number(e.id))
        .concat(
          data.map(
            (e) =>
              Number(e.product_code) - posCommonConstants.productCodePrefix,
          ),
        )
        .filter(Boolean),
    );

    //在庫側のキーはid, product_code
    const queryFromProductKey: Prisma.ProductWhereInput = {
      id: {
        in: Array.from(ids),
      },
    };

    //商品マスタ側のキーはitem_id, myca_item_idとcondition_option_display_nameの組み合わせ
    const allConditionOptionDisplayNames = data.map(
      (e) => e.condition_option_display_name,
    );
    const queryFromItemKey: Prisma.ProductWhereInput = {
      OR: [
        {
          item_id: {
            in: data.map((e) => Number(e.item_id)),
          },
          condition_option: {
            display_name: {
              in: allConditionOptionDisplayNames,
            },
          },
        },
      ],
    };

    const includeMycaItemId = data.find((e) => e.myca_item_id);
    if (includeMycaItemId) {
      queryFromItemKey.OR!.push({
        item: {
          myca_item_id: {
            in: data.map((e) => Number(e.myca_item_id)),
          },
        },
        condition_option: {
          display_name: {
            in: allConditionOptionDisplayNames,
          },
        },
      });
    }

    //とりあえず候補を全て取得
    const [allProducts, allSpecialties] = await Promise.all([
      API.db.product.findMany({
        where: {
          store_id: Number(store_id),
          deleted: false,
          OR: [queryFromProductKey, queryFromItemKey],
        },
        select: {
          id: true,
          item_id: true,
          item: {
            select: {
              myca_item_id: true,
            },
          },
          condition_option: {
            select: {
              display_name: true,
            },
          },
          condition_option_id: true,
          specialty_id: true,
          stock_number: true,
        },
      }),
      API.db.specialty.findMany({
        where: {
          store_id: Number(store_id),
        },
      }),
    ]);

    //仕入れがある場合、仕入れ先情報も取得しておく そこまで数は多くないため、全件取得
    const suppliers = includeStocking
      ? await API.db.supplier.findMany({
          where: {
            store_id: Number(store_id),
            deleted: false,
          },
        })
      : [];

    //ラベル印刷するリスト
    const productsToPrint: Array<
      NonNullable<
        productCsvUploadDef['response']['200']['productsToPrint']
      >[number]
    > = [];

    const { errorInfo } = await csvService.processRow({
      ignoreError: true,
      callback: async (row) => {
        //キーがあるか確認

        const thisProductCandidates = allProducts.filter((p) => {
          //idがある場合、idで特定
          if (row.id) {
            return p.id == Number(row.id);
          }

          //product_codeがある場合、product_codeで特定
          if (row.product_code) {
            return (
              Number(posCommonConstants.productCodePrefix) + p.id ==
              Number(row.product_code)
            );
          }

          //item_idがある場合、item_idとcondition_option_display_nameとspecialty_display_nameで特定
          if (row.item_id && row.condition_option_display_name) {
            return (
              p.item_id == Number(row.item_id) &&
              p.condition_option?.display_name ==
                row.condition_option_display_name
            );
          }

          //myca_item_idがある場合、myca_item_idとcondition_option_display_nameとspecialty_display_nameで特定
          if (row.myca_item_id && row.condition_option_display_name) {
            return (
              p.item?.myca_item_id == Number(row.myca_item_id) &&
              p.condition_option?.display_name ==
                row.condition_option_display_name
            );
          }

          return false;
        });

        //候補が複数ある場合、特殊状態とかを照らし合わせる
        let thisProductInfo: (typeof allProducts)[number] | null = null;

        if (thisProductCandidates.length > 1) {
          //複数候補があったらproductをidやcodeなどで指定されていないということになるため、特殊状態でないものを規定とする
          thisProductInfo =
            thisProductCandidates.find((e) => e.specialty_id == null) ?? null;
        } else {
          thisProductInfo = thisProductCandidates[0] ?? null;
        }

        //一つも候補がなかったら指定が悪いためエラー
        if (!thisProductInfo) {
          throw new ApiError({
            status: 404,
            messageText: '在庫が見つかりません',
          });
        }

        let thisProductId: Product['id'] = thisProductInfo.id;

        if (row.specialty_display_name) {
          const thisSpecialty = allSpecialties.find(
            (e) => e.display_name == row.specialty_display_name,
          );

          if (!thisSpecialty) {
            throw new ApiError({
              status: 404,
              messageText: `
指定された特殊状態が見つかりません: ${row.specialty_display_name}                
`,
            });
          }

          //この特殊状態のやつを探る
          const thisCandidate = thisProductCandidates.find((e) => {
            return e.specialty_id == thisSpecialty.id;
          });

          //あったらそれをproductInfoにする
          if (thisCandidate) {
            thisProductInfo = thisCandidate;
            thisProductId = thisCandidate.id;
          }
          //なかったらこの場で作る
          else {
            const itemId = thisProductInfo.item_id;
            const conditionOptionId = thisProductInfo.condition_option_id;

            const productService = new BackendApiProductService(API);
            API.give(productService);
            productService.setIds({
              itemId,
            });

            //ここで特殊状態付きの在庫を作成する
            await API.transaction(async (tx) => {
              const createRes = await productService.core.create({
                conditionOptionId: conditionOptionId!,
                additionalField: {
                  specialty_id: thisSpecialty.id,
                },
              });

              thisProductId = createRes.id;
            });
          }
        }

        const updateData: ItemTask.UpdateProductData = {
          id: thisProductId,
        };

        Object.entries(row).forEach(([key, value]) => {
          const column = key as keyof typeof row;

          switch (column) {
            case 'display_name':
              if (options?.changeDisplayName && value)
                updateData.display_name = value as string;
              break;
            case 'specific_sell_price':
              if (options?.changeSpecificSellPrice) {
                if (value == '') {
                  updateData.specific_sell_price = null;
                } else if (!isNaN(Number(value))) {
                  updateData.specific_sell_price = Number(value);
                }
              }
              break;
            case 'specific_buy_price':
              if (options?.changeSpecificBuyPrice) {
                if (value == '') {
                  updateData.specific_buy_price = null;
                } else if (!isNaN(Number(value))) {
                  updateData.specific_buy_price = Number(value);
                }
              }
              break;
            case 'readonly_product_code':
              if (options?.changeReadOnlyProductCode && value)
                updateData.readonly_product_code = value as string;
              break;
            case 'tablet_allowed':
              if (options?.changeTabletAllowed && value)
                updateData.tablet_allowed = Boolean(Number(value));
              break;
            case 'mycalinks_ec_enabled':
              if (options?.mycalinksEcEnabled && value)
                updateData.mycalinks_ec_enabled = Boolean(Number(value));
              break;
            case 'ochanoko_product_id':
              if (options?.ochanokoProductId) {
                updateData.ochanoko_product_id = value ? Number(value) : null;
                updateData.ochanoko_ec_enabled = true;
              }
              break;

            //shopify_product_idとかが指定されていたら、3つとも全部指定されているか確認しつつ、enabledもtrueにする

            case 'shopify_product_id':
            case 'shopify_product_variant_id':
            case 'shopify_inventory_item_id':
              if (options?.shopifyProduct) {
                if (
                  !row.shopify_product_id ||
                  !row.shopify_product_variant_id ||
                  !row.shopify_inventory_item_id
                ) {
                  throw new ApiError({
                    status: 400,
                    messageText:
                      'Shopifyの商品ID、バリエーションID、在庫アイテムIDが入っていません',
                  });
                }
                updateData[column] = String(value);
                updateData.shopify_ec_enabled = true;
              }

              break;
          }
        });

        if (updateData.mycalinks_ec_enabled) {
          console.log('updateData', updateData);
        }

        //更新する情報がある場合、タスクとして追加
        if (Object.keys(updateData).length > 1) {
          updateProductTasks.push(updateData);
        }

        //次に、仕入れの必要があるか見ていく
        if (includeStocking && row.stocking_item_count) {
          //仕入れ先や仕入れ価格が入ってなかったらエラー
          if (!row.supplier_display_name || !row.stocking_wholesale_price) {
            throw new ApiError({
              status: 400,
              messageText: '仕入れ先や仕入れ価格が入っていません',
            });
          }

          //仕入れ先を取得
          const thisSupplier = suppliers.find(
            (e) => e.display_name == row.supplier_display_name,
          );
          if (!thisSupplier) {
            throw new ApiError({
              status: 404,
              messageText: '仕入れ先が見つかりません',
            });
          }

          //仕入れ用のタスクを作る
          const stockingTask: ItemTask.Stocking = {
            id: thisProductId,
            supplier_id: thisSupplier.id,
            stocking_wholesale_price: Number(row.stocking_wholesale_price),
            stocking_item_count: Number(row.stocking_item_count),
            staff_account_id,
          };

          //仕入れ用のタスクを追加
          stockingTasks.push(stockingTask);
        }

        //ラベル印刷する必要があるか見ていく
        if (includeLabelPrint) {
          productsToPrint.push({
            id: thisProductId,
            stock_number: thisProductInfo?.stock_number ?? 0,
            specificPrintCount: row.label_print_count ?? null,
            productPrintOption: (row.label_product_option == '価格あり'
              ? 'withPrice'
              : row.label_product_option == '価格なし'
              ? 'noPrice'
              : 'auto') as LabelPrinterOptions['product']['price'],
            cuttingOption:
              row.label_cutting_option == 'カット'
                ? 'do'
                : ('not' as LabelPrinterOptions['cut']),
          });
        }
      },
    });

    //それぞれのタスクをプッシュしていく

    if (updateProductTasks.length && stockingTasks.length)
      throw new ApiError({
        status: 400,
        messageText: '仕入れと情報変更は同時にできません',
      });

    if (updateProductTasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'product',
        kind: 'updateProduct',
      });

      await taskManager.publish({
        body: updateProductTasks,
        service: API,
        source: TaskSourceKind.CSV,
        metadata: [
          {
            kind: 'productCsvOption',
            ...options,
          },
          {
            kind: 'csvFileName',
            fileName: fileData.rawName,
          },
        ],
        processDescription: 'CSVから在庫を更新します',
      });
    }

    //エラーになったものがあった場合、それのファイルを作成してダウンロードさせる
    let errorFileUrl: string | null = null;
    if (errorInfo.rows.length > 0) {
      const fileService = new BackendApiFileService(API);
      const uploadRes = await fileService.uploadCsvToS3({
        fileName: `${fileData.rawName}_エラー`,
        dirKind: 'product',
        writer: async (passThrough) => {
          csvService.core.passThrough = passThrough;
          await csvService.core.maker(errorInfo.rows, true);
        },
      });
      errorFileUrl = uploadRes;
    }

    if (stockingTasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'product',
        kind: 'productStocking',
      });

      await taskManager.publish({
        body: stockingTasks,
        service: API,
        source: TaskSourceKind.CSV,
        metadata: [
          {
            kind: 'productCsvOption',
            ...options,
          },
          {
            kind: 'csvFileName',
            fileName: fileData.rawName,
          },
        ],
        processDescription: 'CSVから仕入れをします',
      });
    }

    return API.status(200).response({
      data: {
        ok: 'CSVの処理のリクエストが完了しました',
        productsToPrint,
        errorInfo: {
          successCount: errorInfo.successCount,
          errorCount: errorInfo.errorCount,
          fileUrl: errorFileUrl,
        },
      },
    });
  },
);
