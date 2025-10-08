//仕入れ値関連
import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
//仕入れ値関係の処理をまとめるファイル

import {
  OrderRule,
  Product,
  Product_Wholesale_Price_History,
  Transaction,
  WholesalePriceHistoryResourceType,
  WholesalePriceKeepRule,
} from '@prisma/client';

/**
 * 仕入れ値関連
 */
export class BackendCoreProductWholesalePriceService extends BackendService {
  constructor(productId?: Product['id']) {
    super();
    this.setIds({
      productId,
    });
  }

  //良い感じに配分する
  @BackendService.WithResources(['store'])
  public adjustDivide = (sum: {
    totalWholesalePrice: number;
    totalItemCount: number;
  }) => {
    //ストアの設定によって変える
    const thisStoreInfo = this.resources.store!;

    let arr: Array<number> = [];

    //一度割ってみて、割り切れるか確認
    const remain = sum.totalWholesalePrice % sum.totalItemCount;

    const basePrice = (sum.totalWholesalePrice - remain) / sum.totalItemCount;

    arr = Array.from({ length: sum.totalItemCount }, (_) => basePrice);
    //あまりを分配
    for (let i = 0; i < remain; i++) arr[i]++;

    //一つにまとめる
    let adjustedArr: Array<{
      item_count: number;
      unit_price: number;
    }> = [];

    adjustedArr = arr.reduce((acc, each) => {
      //すでにこの単価のものがあるか確認
      const thisRecord = acc.find((e) => e.unit_price == each);

      if (thisRecord) {
        thisRecord.item_count++;
      } else {
        acc.push({
          item_count: 1,
          unit_price: each,
        });
      }

      return acc;
    }, adjustedArr);

    return adjustedArr;
  };

  /**
   * 仕入れ値レコード取得・消費関数
   * 消費というのはそのレコードを削除するということ
   * 所有権などは特に確認しない
   * @params spend?: 取得した分のレコードを消費（削除）するかどうか
   * @params item_count: 消費or取得する商品数
   * @params reverse?: 逆順にするかどうか trueだったら逆順 指定しなかったら正順
   * @params sparePrice?: 万が一仕入れ値が足りなかった時に補填する価格 通常は買取価格 指定しなかったら0になる
   * @params resource_type?: 特定のリソースのタイプ 指定しなかったらnull
   * @params specificProductId?: 特定の商品についてだったら
   * @params specificPrice?: 特定の値段を選択することでその値段のレコードだけ消費することができる
   *
   * @returns useWholesalePrice: 取得レコードのリスト
   */
  @BackendService.WithResources(['store'])
  public getRecords = async ({
    spend,
    item_count,
    reverse,
    specificProductId,
    specificPrice,
    sparePrice = 0,
    resource_type = WholesalePriceHistoryResourceType.PRODUCT,
    resource_id,
  }: {
    spend?: boolean;
    item_count: number;
    reverse?: boolean;
    specificProductId?: Product['id'];
    specificPrice?: Product_Wholesale_Price_History['unit_price'];
    sparePrice?: number;
    resource_type?: Product_Wholesale_Price_History['resource_type'];
    resource_id?: Product_Wholesale_Price_History['resource_id'];
  }): Promise<{
    originalRecords: Array<
      WholesalePriceRecord & { id: Product_Wholesale_Price_History['id'] }
    >;
    nothingCount: number;
    useRecords: Array<WholesalePriceRecord>;
    remainRecords: Array<WholesalePriceRecord>;
    totalWholesalePrice: number;
  }> => {
    const db = this.db;
    const product_id = specificProductId ?? this.ids.productId;

    if (!product_id)
      throw new BackendCoreError({
        internalMessage: '仕入れ値を取得する対象の商品IDが指定されていません',
        externalMessage: 'サーバーエラー',
      });

    const thisStoreInfo = this.resources.store!;

    //順番クエリを取得する
    const orderBy = reverse
      ? {
          [thisStoreInfo.use_wholesale_price_order_column]:
            thisStoreInfo.use_wholesale_price_order_rule == OrderRule.asc
              ? OrderRule.desc
              : OrderRule.asc,
        }
      : {
          [thisStoreInfo.use_wholesale_price_order_column]:
            thisStoreInfo.use_wholesale_price_order_rule,
        };

    //使った分（取得分）のレコード
    const useRecords: Array<
      WholesalePriceRecord & { id: Product_Wholesale_Price_History['id'] }
    > = [];

    //とりあえず取得する
    const originalRecords = await db.product_Wholesale_Price_History.findMany({
      where: {
        product_id,
        resource_type,
        resource_id,
        unit_price: specificPrice ?? undefined,
        //これより、product_idとresource_typeとresource_idは混ざることがない
      },
      orderBy,
      include: {
        children: {
          select: {
            product_id: true,
            item_count: true,
            unit_price: true,
            arrived_at: true,
            order_num: true,
            is_exact: true,
            resource_type: true,
            resource_id: true,
          },
        },
      },
    });

    //priceが直接指定されているのにレコードが一つもなかったら想定外の動作になっているためエラー
    if (specificPrice != undefined && !originalRecords.length)
      throw new BackendCoreError({
        internalMessage:
          'この在庫に結び付けられていない仕入れ値が参照されています',
        externalMessage:
          'この在庫に結び付けられていない仕入れ値が参照されています',
      });

    const remainRecords = structuredClone(originalRecords);

    //指定された個数分だけ確認する
    let nothingCount = 0;

    for (let i = 0; i < item_count; i++) {
      //先頭の仕入れ値レコードを取得する
      const target = remainRecords[0];

      //なかったら仕入れ値が足りないため、補填価格でどうにかする
      if (!target) {
        //priceが直接指定されているのにたりなかったらおかしいためエラー
        if (specificPrice != undefined)
          throw new BackendCoreError({
            internalMessage: '指定された仕入れ値の在庫数が足りません',
            externalMessage: '仕入れ値の在庫数が足りません',
          });

        nothingCount++;

        let currentUseRecord: WholesalePriceRecord | undefined = undefined;
        if ((currentUseRecord = useRecords.find((e) => e.id == 0))) {
          currentUseRecord.item_count++;
        } else {
          useRecords.push({
            id: 0,
            product_id,
            unit_price: sparePrice,
            item_count: 1,
            arrived_at: new Date(),
            is_exact: false,
            resource_id,
            resource_type,
          });
        }

        continue;
      }

      //あったらレコードを使いつつ、使ったレコードに追加
      let currentUseRecord: WholesalePriceRecord | undefined = undefined;
      if ((currentUseRecord = useRecords.find((e) => e.id == target.id))) {
        currentUseRecord.item_count++;
      } else {
        useRecords.push({
          ...target,
          item_count: 1,
        });
      }

      if (target.item_count > 1) {
        target.item_count--;
      } else {
        //1だったら要素ごと削除
        remainRecords.shift();
      }
    }

    //消費しないといけなかったら
    if (spend) {
      //適切に書き換える
      await this.adjustGapRecords(originalRecords, remainRecords);

      if (
        product_id &&
        resource_type == WholesalePriceHistoryResourceType.PRODUCT
      ) {
        this.addAfterCommit(async (db) => {
          const id = product_id;
          await db.$executeRaw`
          UPDATE Product p
          INNER JOIN (
            SELECT
              product_id,
              ROUND(SUM(item_count * unit_price) / SUM(item_count)) AS avg_price,
              MIN(unit_price) AS min_price,
              MAX(unit_price) AS max_price,
              SUM(item_count * unit_price) AS total_wholesale_price
            FROM Product_Wholesale_Price_History
            WHERE product_id = ${id}
              AND resource_type = ${WholesalePriceHistoryResourceType.PRODUCT}
            GROUP BY product_id
          ) stats ON stats.product_id = p.id
          SET
            p.average_wholesale_price = stats.avg_price,
            p.minimum_wholesale_price = stats.min_price,
            p.maximum_wholesale_price = stats.max_price,
            p.total_wholesale_price = stats.total_wholesale_price
          WHERE p.id = ${id};
          `;
          console.log(
            'トランザクションが終わったので仕入れ値平均値を計算し直しました',
          );
        });
      }
    }

    return {
      originalRecords, //もともとの仕入れレコード ID付き
      remainRecords: remainRecords.map((e) => ({ ...e, id: undefined })), //変更後の仕入れレコード
      useRecords: useRecords.map((e) => ({ ...e, id: undefined })), //使った仕入れ値レコード
      nothingCount, //仕入れ値がなかった数
      totalWholesalePrice: useRecords.reduce(
        (curSum, e) => curSum + e.item_count * e.unit_price,
        0,
      ),
    };
  };

  /**
   * どのレコードを削除するべきか、どのレコードを更新するべきかを吟味する
   */
  public async adjustGapRecords(
    originalRecords: Array<
      WholesalePriceRecord & { id: Product_Wholesale_Price_History['id'] }
    > = [],
    remainRecords: Array<
      WholesalePriceRecord & { id: Product_Wholesale_Price_History['id'] }
    > = [],
  ) {
    const deleteIds: number[] = [];
    const updateData: Array<{
      id: Product_Wholesale_Price_History['id'];
      item_count: Product_Wholesale_Price_History['item_count'];
    }> = [];

    //originalRecordsの方をベースに見ていく
    originalRecords.forEach((r) => {
      const remainRecord = remainRecords.find((e) => e.id == r.id);

      if (!remainRecord) {
        deleteIds.push(r.id);
      } else if (remainRecord.item_count != r.item_count) {
        updateData.push({
          id: r.id,
          item_count: remainRecord.item_count,
        });
      }
    });

    await Promise.all([
      this.db.product_Wholesale_Price_History.deleteMany({
        where: {
          id: {
            in: deleteIds,
          },
        },
      }),
      ...updateData.map((e) =>
        this.db.product_Wholesale_Price_History.update({
          where: {
            id: e.id,
          },
          data: {
            item_count: e.item_count,
          },
        }),
      ),
    ]);
  }

  /**
   * レコードの更新を行う関数 PRODUCT仕入れ値かつexactのみ書き換えることができる
   * 到着日時などを書き換えることはできず、仕入れ値の値のみ可能
   *
   * 棚卸で後から仕入れ値を注入するとかに使う なので現在は0円の仕入れ値レコードのみ対応
   */
  @BackendService.WithResources(['store'])
  @BackendService.WithTx
  public async updateRecord(
    id: Product_Wholesale_Price_History['id'],
    unit_price: Product_Wholesale_Price_History['unit_price'],
  ) {
    //このレコードを取得しつつ書き換える 取得の方は必要ないかも？
    const thisRecordInfo =
      await this.db.product_Wholesale_Price_History.findUnique({
        where: {
          id,
          resource_type: WholesalePriceHistoryResourceType.PRODUCT,
          is_exact: true,
        },
      });

    if (!thisRecordInfo)
      throw new BackendCoreError({
        internalMessage: '指定された仕入れ値レコードが存在しません',
        externalMessage: '指定された仕入れ値レコードが存在しません',
      });

    if (thisRecordInfo.unit_price != 0)
      throw new BackendCoreError({
        internalMessage: '0円の仕入れ値レコードのみ書き換えられます',
        externalMessage: '0円の仕入れ値レコードのみ書き換えられます',
      });

    const updateRes = await this.db.product_Wholesale_Price_History.update({
      where: {
        id,
      },
      data: {
        unit_price,
      },
    });

    this.addAfterCommit(async (db) => {
      const id = thisRecordInfo.product_id;
      await db.$executeRaw`
      UPDATE Product p
      INNER JOIN (
        SELECT
          product_id,
          ROUND(SUM(item_count * unit_price) / SUM(item_count)) AS avg_price,
          MIN(unit_price) AS min_price,
          MAX(unit_price) AS max_price,
          SUM(item_count * unit_price) AS total_wholesale_price
        FROM Product_Wholesale_Price_History
        WHERE product_id = ${id}
          AND resource_type = ${WholesalePriceHistoryResourceType.PRODUCT}
        GROUP BY product_id
      ) stats ON stats.product_id = p.id
      SET
        p.average_wholesale_price = stats.avg_price,
        p.minimum_wholesale_price = stats.min_price,
        p.maximum_wholesale_price = stats.max_price,
        p.total_wholesale_price = stats.total_wholesale_price
      WHERE p.id = ${id};
      `;
      console.log(
        'トランザクションが終わったので仕入れ値平均値を計算し直しました',
      );
    });

    return updateRes;
  }

  /**
   * レコード登録関数 childrenを指定することもできる
   * 平均値でセットする設定になっていたらここでセットする時にならすようにする
   * @params records: 登録するレコード
   * @params tx?: トランザクションオブジェクト 指定しないとトランザクションの外で実行される、
   * @params resource_type?: 特定のresource_typeですべて書き換える場合に指定
   * @params resource_id?: 特定のresource_idですべて書き換える場合に指定
   *
   * @returns 特になし
   */
  //平均値でセットする感じになっていたら、同じresource_type同じresource_idで同じproduct_idのレコードを全て取得し、それらの平均値を求めてから新しくレコードを作ってそれを格納する形にする
  //childrenがあるレコードは束ねないようにする
  @BackendService.WithResources(['store'])
  @BackendService.WithTx
  public setRecords = async ({
    records,
    resource_type,
    resource_id,
    product_id,
  }: {
    records: Array<WholesalePriceRecord>;
    resource_type?: Product_Wholesale_Price_History['resource_type'];
    resource_id?: Product_Wholesale_Price_History['resource_id'];
    product_id?: Product_Wholesale_Price_History['product_id'];
  }) => {
    const db = this.db;

    if (!records.length)
      return {
        createdRecords: [],
      };

    //個別と平均で変えていく
    const thisStoreInfo = this.resources.store!;

    //個別設定だったら もしくはproduct_idが全て同じじゃなかったら個別で登録する
    //childrenが含まれていたとしても個別で登録
    const isSingleProduct = records.every(
      (e) => records[0].product_id == e.product_id,
    );

    const createdRecords: Array<Product_Wholesale_Price_History> = [];

    if (
      thisStoreInfo.wholesale_price_keep_rule ==
        WholesalePriceKeepRule.individual ||
      (!product_id && !isSingleProduct) ||
      records.some((e) => e.children?.length)
    ) {
      // if (false) {
      for (const record of records) {
        //すでに同じレコードがあったらカウントアップする形
        const thisRecord = await db.product_Wholesale_Price_History.findFirst({
          where: {
            product_id: product_id ?? record.product_id,
            resource_type: resource_type ?? record.resource_type!,
            resource_id: resource_id ?? record.resource_id ?? record.product_id,
            unit_price: record.unit_price,
            arrived_at: record.arrived_at ?? new Date(), //arrived_atが指定されている時
            children: {
              //子がないものだけ取得する
              every: {
                product_id: 0,
              },
            },
          },
        });

        if (thisRecord) {
          //すでにある場合はカウントアップ
          await db.product_Wholesale_Price_History.update({
            where: {
              id: thisRecord.id,
            },
            data: {
              item_count: {
                increment: record.item_count,
              },
            },
          });
        } else {
          const createRes = await db.product_Wholesale_Price_History.create({
            data: {
              ...record,
              id: undefined,
              resource_id: record.resource_id ?? record.product_id,
              ...(product_id && { product_id }),
              ...(resource_type && { resource_type }),
              ...(resource_id && { resource_id }),
              children:
                record.children && record.children.length
                  ? {
                      create: record.children.map((e) => ({
                        ...e,
                        parent_id: undefined,
                        children: undefined,
                        resource_id: e.product_id,
                        resource_type: WholesalePriceHistoryResourceType.CHILD,
                      })),
                    }
                  : undefined,
            },
          });
          createdRecords.push(createRes);
        }
      }

      //Productにレコードを入れるスタイルだったら平均仕入れ値などを計算し直す コミット後でOK
      if (
        (resource_type ?? WholesalePriceHistoryResourceType.PRODUCT) ==
          WholesalePriceHistoryResourceType.PRODUCT &&
        isSingleProduct
      ) {
        const record = records[0];

        this.addAfterCommit(async (db) => {
          const id = product_id ?? record.product_id;
          await db.$executeRaw`
          UPDATE Product p
          INNER JOIN (
            SELECT
              product_id,
              ROUND(SUM(item_count * unit_price) / SUM(item_count)) AS avg_price,
              MIN(unit_price) AS min_price,
              MAX(unit_price) AS max_price,
              SUM(item_count * unit_price) AS total_wholesale_price
            FROM Product_Wholesale_Price_History
            WHERE product_id = ${id}
              AND resource_type = ${WholesalePriceHistoryResourceType.PRODUCT}
            GROUP BY product_id
          ) stats ON stats.product_id = p.id
          SET
            p.average_wholesale_price = stats.avg_price,
            p.minimum_wholesale_price = stats.min_price,
            p.maximum_wholesale_price = stats.max_price,
            p.total_wholesale_price = stats.total_wholesale_price
          WHERE p.id = ${id};
          `;
          console.log(
            'トランザクションが終わったので仕入れ値平均値を計算し直しました',
          );
        });
      }
    }
    //平均値を使うスタイルだったら
    else {
      //product_idは一種類しかない　それを取得
      const specificProductId = product_id ?? records[0].product_id;
      const specificResourceType =
        resource_type ??
        records[0].resource_type ??
        WholesalePriceHistoryResourceType.PRODUCT;
      const specificResourceId =
        resource_id ??
        (specificResourceType == WholesalePriceHistoryResourceType.PRODUCT
          ? specificProductId
          : records[0].resource_id);

      //一旦他のレコードも取得する
      const otherRecords = await db.product_Wholesale_Price_History.findMany({
        where: {
          product_id: specificProductId,
          resource_type: specificResourceType,
          resource_id: specificResourceId,
          children: {
            none: {},
          }, //子がないものだけ取得する
        },
      });

      //レコード同士で合体してくっつける
      const unifiedRecords: Array<WholesalePriceRecord> = records.concat(
        otherRecords.map((e) => ({
          product_id: e.product_id,
          unit_price: e.unit_price,
          item_count: e.item_count,
        })),
      );

      //平均でレコードを作る
      const generatedRecords = this.generateRecords({
        totalCount: unifiedRecords.reduce(
          (curSum, e) => curSum + e.item_count,
          0,
        ),
        totalWholesalePrice: unifiedRecords.reduce(
          (curSum, e) => curSum + e.item_count * e.unit_price,
          0,
        ),
        resource_type: specificResourceType,
        resource_id: specificResourceId,
        specificProductId,
      });

      //このレコードで全てのレコードを書き換える
      await db.product_Wholesale_Price_History.deleteMany({
        where: {
          id: {
            in: otherRecords.map((e) => e.id),
          },
        },
      });

      const createRes = await db.product_Wholesale_Price_History.createMany({
        //@ts-expect-error becuase of because of resource_idは確実に指定されている
        data: generatedRecords,
      });

      if (specificResourceType == WholesalePriceHistoryResourceType.PRODUCT) {
        this.addAfterCommit(async (db) => {
          const id = specificProductId;
          await db.$executeRaw`
          UPDATE Product p
          INNER JOIN (
            SELECT
              product_id,
              ROUND(SUM(item_count * unit_price) / SUM(item_count)) AS avg_price,
              MIN(unit_price) AS min_price,
              MAX(unit_price) AS max_price,
              SUM(item_count * unit_price) AS total_wholesale_price
            FROM Product_Wholesale_Price_History
            WHERE product_id = ${id}
              AND resource_type = ${WholesalePriceHistoryResourceType.PRODUCT}
            GROUP BY product_id
          ) stats ON stats.product_id = p.id
          SET
            p.average_wholesale_price = stats.avg_price,
            p.minimum_wholesale_price = stats.min_price,
            p.maximum_wholesale_price = stats.max_price,
            p.total_wholesale_price = stats.total_wholesale_price
          WHERE p.id = ${id};
          `;
          console.log(
            'トランザクションが終わったので仕入れ値平均値を計算し直しました',
          );
        });
      }
    }

    return {
      createdRecords,
    };
  };

  // /**
  //  * 取引返品のために仕入れ値レコードを複製する関数
  //  * @params oldTransactionId: 前の取引ID
  //  * @params newTransactionId: 新しい取引ID
  //  *
  //  * @returns 特になし
  //  */
  // public duplicateTransactionRecords = async ({
  //   oldTransactionId,
  //   newTransactionId,
  // }: {
  //   oldTransactionId: Transaction['id'];
  //   newTransactionId: Transaction['id'];
  // }) => {
  //   const db = this.db;

  //   //前のトランザクションのレコードを取得（レコード取得関数では取得できない範疇）
  //   const oldRecords = await db.product_Wholesale_Price_History.findMany({
  //     where: {
  //       resource_type: WholesalePriceHistoryResourceType.TRANSACTION,
  //       resource_id: oldTransactionId,
  //     },
  //     include: {
  //       children: {
  //         select: {
  //           product_id: true,
  //           item_count: true,
  //           unit_price: true,
  //           arrived_at: true,
  //           order_num: true,
  //           is_exact: true,
  //           resource_type: true,
  //           resource_id: true,
  //         },
  //       },
  //     },
  //   });

  //   //セットする
  //   await this.setRecords({
  //     records: oldRecords,
  //     resource_id: newTransactionId,
  //   });
  // };

  //レコードを生成する関数も必要に応じて作る
  //基本的に返り値の要素数は1になるが、割り切れないものがあったばあい複数になる
  public generateRecords = ({
    totalCount,
    totalWholesalePrice,
    resource_type,
    resource_id,
    arrived_at,
    specificProductId,
  }: {
    totalCount: number; //トータルの仕入れカウント
    totalWholesalePrice: number; //トータルの仕入れ値
    resource_type?: Product_Wholesale_Price_History['resource_type'];
    resource_id?: Product_Wholesale_Price_History['resource_id'];
    arrived_at?: Product_Wholesale_Price_History['arrived_at'];
    specificProductId?: Product_Wholesale_Price_History['product_id'];
  }): Array<WholesalePriceRecord> => {
    const adjustedArr = this.adjustDivide({
      totalItemCount: totalCount,
      totalWholesalePrice: totalWholesalePrice,
    });
    const product_id = specificProductId || this.ids.productId || 0;

    if (!product_id)
      throw new BackendCoreError({
        internalMessage: '仕入れ値を取得する対象の商品IDが指定されていません',
        externalMessage: 'サーバーエラー',
      });

    return adjustedArr.map((e) => ({
      product_id,
      item_count: e.item_count,
      unit_price: e.unit_price,
      resource_id: resource_id,
      resource_type: resource_type,
      arrived_at,
    }));
  };
}

export type WholesalePriceRecord = {
  //これを配列型にする想定
  product_id: Product_Wholesale_Price_History['product_id'];
  item_count: Product_Wholesale_Price_History['item_count'];
  unit_price: Product_Wholesale_Price_History['unit_price'];
  arrived_at?: Product_Wholesale_Price_History['arrived_at'];
  order_num?: Product_Wholesale_Price_History['order_num'];
  is_exact?: Product_Wholesale_Price_History['is_exact'];
  resource_type?: Product_Wholesale_Price_History['resource_type'];
  resource_id?: Product_Wholesale_Price_History['resource_id'];
  children?: Array<Omit<WholesalePriceRecord, 'children'>>;
};
