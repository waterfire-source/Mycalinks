import { apiRole, BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Item, ItemStatus, TaskSourceKind } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

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
    const options = API.body.json?.options as ItemCsvUploadOptions;

    //先にMycaのItem情報を取得しておく

    //それぞれのテンプレートについて定義していく

    //CSVファイルを確認
    const csvService = new BackendApiCsvService(API, 'item');
    const { data } = csvService.parser('file');

    //商品マスタのCSV処理は以下の通り

    //新規作成（コード系が指定されていなかった場合）
    //情報更新（コード系が指定されていた場合）

    const createItemTasks: Array<ItemTask.CreateItemData> = [];
    const updateItemTasks: Array<ItemTask.UpdateItemData> = [];

    //先にitem情報を取得しておく
    const includeCreate = data.find((e) => !e.id);
    const includeUpdate = data.find((e) => e.id || e.myca_item_id);

    let allItems: Array<{
      id: Item['id'];
      myca_item_id: Item['myca_item_id'];
    }> = [];

    if (includeUpdate) {
      allItems = await API.db.item.findMany({
        where: {
          store_id: Number(store_id),
          status: {
            not: ItemStatus.DELETED,
          },
          OR: [
            {
              id: {
                in: data.map((e) => Number(e.id)),
              },
            },
            {
              myca_item_id: {
                in: data.map((e) => Number(e.myca_item_id)),
              },
            },
          ],
        },
        select: {
          id: true,
          myca_item_id: true,
        },
      });
    }

    //新規登録のMycaアイテムは事前に取得しておく
    const itemModel = new BackendApiItemService(API);

    let allMycaItemQuery: Array<ItemTask.CreateItemData> = [];
    const allMycaItemIds = data
      .filter(
        (e) =>
          e.myca_item_id &&
          !allItems.find((e2) => e2.myca_item_id == e.myca_item_id),
      )
      .map((e) => e.myca_item_id);

    if (allMycaItemIds.length > 0) {
      const allMycaItem = await itemModel.core.createQueryFromMycaApp({
        props: {
          id: allMycaItemIds,
        },
      });
      allMycaItemQuery = allMycaItem.itemQueries;
    }

    const departmentService = new BackendApiDepartmentService(API);
    if (includeCreate) {
      await departmentService.core.getAllItemGenres();
      await departmentService.core.getAllItemCategories();
    }

    //先にカテゴリ情報を取得しておく

    const columnsToData = (
      data: Partial<
        CommonProperties<ItemTask.CreateItemData, ItemTask.UpdateItemData>
      >,
      row: typeof csvService.core.dataRecord,
    ) => {
      //更新モードとして処理
      Object.entries(row).forEach(([key, value]) => {
        const column = key as keyof typeof row;

        switch (column) {
          //この辺の処理をBackendAPIのセットアップみたいなやつ使いたい
          case 'display_name':
            if (options?.changeDisplayName && value)
              data.display_name = value as string;
            break;
          case 'display_name_ruby':
            if (options?.changeDisplayNameRuby && value)
              data.display_name_ruby = value as string;
            break;
          case 'expansion':
            if (options?.changeExpansion && value)
              data.expansion = value as string;
            break;
          case 'cardnumber':
            if (options?.changeCardNumber && value)
              data.cardnumber = value as string;
            break;
          case 'rarity':
            if (options?.changeRarity && value) data.rarity = value as string;
            break;
          case 'pack_name':
            if (options?.changePackName && value)
              data.pack_name = value as string;
            break;
          case 'keyword':
            if (options?.changeKeyword && value) data.keyword = value as string;
            break;
          case 'readonly_product_code':
            if (options?.changeReadOnlyProductCode && value)
              data.readonly_product_code = value as string;
            break;
          case 'order_number':
            if (
              options?.changeOrderNumber &&
              value != '' &&
              !isNaN(Number(value))
            )
              data.order_number = Number(value as string);
            break;
          case 'sell_price':
            if (
              options?.changeSellPrice &&
              value != '' &&
              !isNaN(Number(value))
            )
              data.sell_price = Number(value as string);
            break;
          case 'buy_price':
            if (options?.changeBuyPrice && value != '' && !isNaN(Number(value)))
              data.buy_price = Number(value as string);
            break;
          case 'is_buy_only':
            if (options?.changeIsBuyOnly)
              data.is_buy_only = Boolean(Number(value));
            break;
          case 'tablet_allowed':
            if (options?.changeTabletAllowed)
              data.tablet_allowed = Boolean(Number(value));
            break;
          case 'infinite_stock':
            if (options?.changeInfiniteStock)
              data.infinite_stock = Boolean(Number(value));
            break;
          case 'disallow_round':
            if (options?.changeDisallowRound) data.allow_round = !value;
            break;
        }
      });
    };

    const { errorInfo } = await csvService.processRow({
      ignoreError: true,
      callback: async (row) => {
        //キーがあるか確認

        //myca_item_idがある場合、新規か更新か判断
        const thisItem = allItems.find(
          (e) =>
            e.id == Number(row.id) ||
            e.myca_item_id == Number(row.myca_item_id),
        );

        //myca_item_idが指定されていたりthisItem.myca_item_idがあった場合は無限商品にできないようにする
        if (row.myca_item_id || thisItem?.myca_item_id) {
          row.infinite_stock = 0; //強制的に無限商品にする
        }

        //持ってたら、そのアイテムを取得
        if (thisItem) {
          const updateData: ItemTask.UpdateItemData = {
            id: thisItem.id,
          };

          columnsToData(updateData, row);

          Object.entries(row).forEach(([key, value]) => {
            const column = key as keyof typeof row;

            switch (column) {
              case 'hidden':
                if (options?.changeHidden)
                  updateData.status = value ? ItemStatus.HIDDEN : undefined;
                break;
            }
          });

          //完成したデータをタスクとしてプッシュする
          if (Object.keys(updateData).length > 1) {
            updateItemTasks.push(updateData);
          }
        } else {
          //新規作成モード

          let createData: ItemTask.CreateItemData;

          //MycaIdがある場合、MycaのItem情報を取得
          if (row.myca_item_id) {
            const query = allMycaItemQuery.find(
              (e) =>
                e.myca_item?.connectOrCreate.where.myca_item_id ==
                row.myca_item_id,
            );

            if (!query)
              throw new ApiError({
                status: 404,
                messageText: 'Mycaアイテムが見つかりません',
              });

            createData = {
              ...query,
            };
          } else {
            //カテゴリを取得
            const category = departmentService.core.allItemCategories?.find(
              (e) => e.display_name == row.category_display_name,
            );

            //ジャンルを取得
            const genre = departmentService.core.allItemGenres?.find(
              (e) => e.display_name == row.genre_display_name,
            );

            if (!category)
              throw new ApiError({
                status: 404,
                messageText: '新規登録ではカテゴリの指定が必要です',
              });

            if (!genre)
              throw new ApiError({
                status: 404,
                messageText: '新規登録ではジャンルの指定が必要です',
              });

            if (!row.display_name)
              throw new ApiError({
                status: 400,
                messageText: '新規登録では商品名の指定が必要です',
              });

            createData = {
              category: {
                connect: {
                  id: category.id,
                },
              },
              genre: {
                connect: {
                  id: genre.id,
                },
              },
              display_name: row.display_name,
            };
          }

          columnsToData(createData, row);

          createItemTasks.push(createData);
        }
      },
    });

    if (updateItemTasks.length && createItemTasks.length)
      throw new ApiError({
        status: 400,
        messageText: 'アイテムの作成と更新は同時にできません',
      });

    //エラーになったものがあった場合、それのファイルを作成してダウンロードさせる
    let errorFileUrl: string | null = null;
    if (errorInfo.rows.length > 0) {
      const fileService = new BackendApiFileService(API);
      const uploadRes = await fileService.uploadCsvToS3({
        fileName: `${fileData.rawName}_エラー`,
        dirKind: 'item',
        writer: async (passThrough) => {
          csvService.core.passThrough = passThrough;
          await csvService.core.maker(errorInfo.rows, true);
        },
      });
      errorFileUrl = uploadRes;
    }

    //それぞれのタスクをプッシュしていく
    if (createItemTasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'item',
        kind: 'createItem',
      });

      await taskManager.publish({
        body: createItemTasks,
        service: API,
        source: TaskSourceKind.CSV,
        metadata: [
          {
            kind: 'itemCsvOption',
            ...options,
          },
          {
            kind: 'csvFileName',
            fileName: fileData.rawName,
          },
        ],
        processDescription: 'CSVからアイテムを作成します',
      });
    }

    if (updateItemTasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'item',
        kind: 'updateItem',
      });

      await taskManager.publish({
        body: updateItemTasks,
        service: API,
        source: TaskSourceKind.CSV,
        metadata: [
          {
            kind: 'itemCsvOption',
            ...options,
          },
          {
            kind: 'csvFileName',
            fileName: fileData.rawName,
          },
        ],
        processDescription: 'CSVからアイテムを更新します',
      });
    }

    return API.status(200).response({
      data: {
        ok: 'CSVの処理のリクエストが完了しました',
        errorInfo: {
          successCount: errorInfo.successCount,
          errorCount: errorInfo.errorCount,
          fileUrl: errorFileUrl,
        },
      },
    });

    //   await csvUtil.processRow(data, async (row) => {
    //     //必要データがあるか確認

    //     //MycaIdがなかったらジャンル名とカテゴリ名が指定されていないといけない
    //     let genre_id: Item_Genre['id'] | undefined = undefined;
    //     let category_id: Item_Category['id'] | undefined = undefined;

    //     if (row.genre_display_name) {
    //       const thisGenreInfo = allGenres.find(
    //         (e) => e.display_name == row.genre_display_name,
    //       );
    //       if (!thisGenreInfo)
    //         throw new ApiError({
    //           status: 404,
    //           messageText: 'ジャンルが見つかりません',
    //         });

    //       genre_id = thisGenreInfo.id;
    //     }

    //     if (row.category_display_name) {
    //       const thisCategoryInfo = allCategories.find(
    //         (e) => e.display_name == row.category_display_name,
    //       );
    //       if (!thisCategoryInfo)
    //         throw new ApiError({
    //           status: 404,
    //           messageText: 'カテゴリが見つかりません',
    //         });

    //       category_id = thisCategoryInfo.id;
    //     }

    //     if (!row.myca_item_id && (!genre_id || !category_id))
    //       throw new ApiError({
    //         status: 400,
    //         messageText:
    //           'MycaIdがない場合はジャンルとカテゴリを指定する必要があります',
    //       });

    //     //Itemを挿入していく
    //     const itemOnMyca: ItemTask.CreateItemData | undefined =
    //       mycaItemQueries.find(
    //         (e) => e.myca_item_id == parseInt(row.myca_item_id || ''),
    //       );

    //     if (row.myca_item_id && !itemOnMyca) {
    //       console.log('なかったので飛ばします');
    //       return;
    //     }

    //     if (!itemOnMyca?.category && !category_id)
    //       throw new ApiError({
    //         status: 500,
    //         messageText: '商品マスタ作成時には商品種別の指定が必要です',
    //       });

    //     taskQuery.push({
    //       ...itemOnMyca!,
    //       ...(category_id
    //         ? {
    //             category: {
    //               connect: {
    //                 id: category_id,
    //               },
    //             },
    //           }
    //         : null),
    //       ...(genre_id
    //         ? {
    //             genre: {
    //               connect: {
    //                 id: genre_id,
    //               },
    //             },
    //           }
    //         : null),
    //       store: {
    //         connect: {
    //           id: parseInt(store_id),
    //         },
    //       },
    //       ...(row.display_name ? { display_name: row.display_name } : null),
    //       ...(row.rarity ? { rarity: row.rarity } : null),
    //       ...(row.pack_name ? { pack_name: row.pack_name } : null),
    //       ...(row.expansion ? { expansion: row.expansion } : null),
    //       ...(row.image_url ? { image_url: row.image_url } : null),
    //       display_name_ruby: row.display_name_ruby,
    //       sell_price: Number(row.sell_price),
    //       buy_price: Number(row.buy_price),
    //       is_buy_only: row.is_buy_only,
    //       order_number: parseInt(row.order_number || '0'),
    //       readonly_product_code: row.readonly_product_code,
    //       description: row.description,
    //     });
    //   });

    //   const taskManager = new TaskManager({
    //     targetWorker: 'item',
    //     kind: 'createItem',
    //   });

    //   await taskManager.publish(
    //     taskQuery,
    //     API,
    //     `CSVからアイテムを作成します`,
    //   );

    //   return API.status(201).response({
    //     msgContent: ResponseMsgKind.created,
    //   });
    // }
    //   //商品の価格変更テンプレートだったら
    //   case 'itemPriceTemplate': {
    //     let validData: Array<{
    //       id: string | null;
    //       myca_item_id: string | null;
    //       sell_price: string | null;
    //       buy_price: string | null;
    //     }> = data.filter(
    //       (e) =>
    //         (!isNaN(Number(e.id)) || !isNaN(Number(e.myca_item_id))) &&
    //         (!isNaN(Number(e.sell_price)) || !isNaN(Number(e.buy_price))),
    //     );

    //     //指定されているすべての商品マスタの情報を取得しておく
    //     const allIds = validData
    //       .map((e) => parseInt(e.id || '0'))
    //       .filter((e) => e);
    //     const allMycaIds = validData
    //       .map((e) => parseInt(e.myca_item_id || '0'))
    //       .filter((e) => e);

    //     const allItemData = await API.db.item.findMany({
    //       where: {
    //         OR: [
    //           {
    //             id: {
    //               in: allIds,
    //             },
    //           },
    //           {
    //             myca_item_id: {
    //               in: allMycaIds,
    //             },
    //           },
    //         ],
    //       },
    //       select: {
    //         myca_item_id: true,
    //         id: true,
    //         buy_price: true,
    //         sell_price: true,
    //       },
    //     });

    //     let itemsToPrint: Array<Item['id']> = []; //買取価格だけが変わった商品
    //     //ここから、変動するデータだけを取得していく

    //     const mode = parameters['変動させる価格の種類'];

    //     if (!mode)
    //       throw new ApiError({
    //         status: 400,
    //         messageText: '変動データの種類が指定されていません',
    //       });

    //     const itemsToUpdateSellPrice: Array<{
    //       id: Item['id'];
    //       sell_price: Item['sell_price'];
    //     }> = [];
    //     const itemsToUpdateBuyPrice: Array<{
    //       id: Item['id'];
    //       buy_price: Item['buy_price'];
    //     }> = [];

    //     for (const eachItem of allItemData) {
    //       //csvに存在するデータを取得
    //       const itemDataOnCsv = validData.find(
    //         (e) =>
    //           e.id == String(eachItem.id) ||
    //           e.myca_item_id == String(eachItem.myca_item_id),
    //       );

    //       if (!itemDataOnCsv) continue;

    //       //価格変動があるかどうか
    //       let sellPriceGap =
    //         eachItem.sell_price != parseInt(itemDataOnCsv.sell_price || '0')
    //           ? parseInt(itemDataOnCsv.sell_price || '0')
    //           : -1;
    //       let buyPriceGap =
    //         eachItem.buy_price != parseInt(itemDataOnCsv.buy_price || '0')
    //           ? parseInt(itemDataOnCsv.buy_price || '0')
    //           : -1;

    //       //変動対象かどうか
    //       sellPriceGap =
    //         mode == '販売だけ' || mode == '両方' ? sellPriceGap : -1;
    //       buyPriceGap = mode == '買取だけ' || mode == '両方' ? buyPriceGap : -1;

    //       if (sellPriceGap > -1 || buyPriceGap > -1) {
    //         console.log(`${eachItem.id}の変動：${sellPriceGap} ${buyPriceGap}`);

    //         //候補に追加する
    //         if (sellPriceGap > -1) {
    //           itemsToUpdateSellPrice.push({
    //             id: eachItem.id,
    //             sell_price: sellPriceGap,
    //           });
    //         }
    //         if (buyPriceGap > -1) {
    //           itemsToUpdateBuyPrice.push({
    //             id: eachItem.id,
    //             buy_price: buyPriceGap,
    //           });
    //         }
    //       } else {
    //         // console.log(
    //         //   `${eachItem.id}に関しては変動させる必要がありませんでした`,
    //         // );
    //       }
    //     }

    //     itemsToPrint = itemsToUpdateSellPrice.map((e) => e.id);

    //     console.log('プリントするべきは', itemsToPrint);

    //     //ここはバルクで一気にインサートしちゃう
    //     const txResult = await API.transaction(
    //       async (tx) => {
    //         if (itemsToUpdateSellPrice.length > 0) {
    //           const updateSellPriceResult = await tx.$queryRawUnsafe(`
    //         UPDATE Item SET
    //         sell_price = ELT(FIELD(id,${itemsToUpdateSellPrice.map((e) => e.id).join(',')}),${itemsToUpdateSellPrice.map((e) => e.sell_price).join(',')})
    //         WHERE id IN (${itemsToUpdateSellPrice.map((e) => e.id).join(',')}) AND store_id = ${parseInt(store_id)}
    //         `);
    //         }

    //         if (itemsToUpdateBuyPrice.length > 0) {
    //           const updateBuyPriceResult = await tx.$queryRawUnsafe(`
    //         UPDATE Item SET
    //         buy_price = ELT(FIELD(id,${itemsToUpdateBuyPrice.map((e) => e.id).join(',')}),${itemsToUpdateBuyPrice.map((e) => e.buy_price).join(',')})
    //         WHERE id IN (${itemsToUpdateBuyPrice.map((e) => e.id).join(',')}) AND store_id = ${parseInt(store_id)}
    //         `);
    //         }
    //       },
    //       {
    //         maxWait: 5 * 1000, // default: 2000
    //         timeout: 6 * 60 * 1000, // タイムアウトは6分（決済が5分のため）
    //       },
    //     );

    //     // validData = validData.filter((e) => e.id);

    //     // const validDataIds = validData.map((e) => e.id);
    //     // const validDataBuyPrices = validData.map((e) => e.buy_price || 0);
    //     // const validDataSellPrices = validData.map((e) => e.sell_price || 0);

    //     // const updateResult = await API.db.$queryRawUnsafe(`
    //     // UPDATE Item SET
    //     // sell_price = ELT(FIELD(id,${validDataIds.join(',')}),${validDataSellPrices.join(',')}),
    //     // buy_price = ELT(FIELD(id,${validDataIds.join(',')}),${validDataBuyPrices.join(',')})
    //     // WHERE id IN (${validDataIds.join(',')}) AND store_id = ${parseInt(store_id)}
    //     // `);

    //     //影響を受けたすべてのProductを取得
    //     const allProducts = await API.db.product.findMany({
    //       where: {
    //         store_id: parseInt(store_id),
    //         item_id: {
    //           in: itemsToPrint,
    //         },
    //         deleted: false,
    //       },
    //       select: {
    //         stock_number: true,
    //         id: true,
    //       },
    //     });

    //     const result = {
    //       templateName,
    //       productsToPrint: allProducts, //このitem_idが結びついているすべてのproductのラベルを印刷したい
    //     };

    //     console.log(`リザルトは`, result);

    //     return API.status(200).response({ data: result });
    //   }
    // }
  },
);

import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { ItemTask, TaskManager } from 'backend-core';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { ItemCsvUploadOptions } from 'common';
import { CommonProperties } from 'common';

//商品マスタのCSVをダウンロードする
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
    const { genre_id, category_id } = API.query;

    //すべてのデータをCSVファイル化する
    //とりあえず状態Aのものの在庫だけ取得
    // const allItems = await API.db.item.findMany({
    //   where:{
    //     store_id: parseInt(store_id),
    //   },
    //   select:{

    //   }
    // })

    const domain = 'item';

    const csvService = new BackendApiCsvService(API, domain);
    const fileService = new BackendApiFileService(API);

    //ストリーミング書き出しを実施
    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: domain,
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;
        const chunkSize = 1000;
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          const allItemsRaw = await API.db.item.findManyExists({
            where: {
              store_id: Number(store_id),
              genre_id: genre_id ? Number(genre_id) : undefined,
              category_id: category_id ? Number(category_id) : undefined,
            },
            include: {
              category: true,
              genre: true,
            },
            take: chunkSize,
            skip,
          });

          skip += chunkSize;
          if (allItemsRaw.length < chunkSize) {
            hasMore = false;
          }

          const resultData: Array<typeof csvService.core.dataRecord> =
            allItemsRaw.map((e) => ({
              id: e.id,
              myca_item_id: e.myca_item_id,
              display_name: e.display_name,
              display_name_ruby: e.display_name_ruby,
              expansion: e.expansion,
              cardnumber: e.cardnumber,
              rarity: e.rarity,
              pack_name: e.pack_name,
              keyword: e.keyword,
              readonly_product_code: e.readonly_product_code,
              order_number: e.order_number,
              genre_display_name: e.genre?.display_name || '',
              category_display_name: e.category?.display_name || '',
              sell_price: e.sell_price,
              buy_price: e.buy_price,
              is_buy_only: Number(e.is_buy_only),
              allow_auto_print_label: Number(e.allow_auto_print_label),
              tablet_allowed: Number(e.tablet_allowed),
              infinite_stock: Number(e.infinite_stock),
              disallow_round: Number(!e.allow_round),
              hidden: Number(e.status == 'HIDDEN'),
            }));

          await csvService.core.maker(resultData, true);
          console.log(`${resultData.length}件の新規データを書き出しました`);
        }
      },
    });

    return API.status(200).response({ data: { fileUrl: uploadRes } });
  },
);
