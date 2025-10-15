import { BackendService } from '@/services/internal/main';
import {
  Item,
  Product,
  Sale_Department,
  Sale_Product,
  Sale_Product_History,
  SaleCalculaterHistoryStatus,
  SaleRule,
  SaleStatus,
  Store,
  Transaction,
} from '@prisma/client';
import { customDayjs } from 'common';

//バックエンドのセールモデル

import { Sale } from '@prisma/client';

import { BackendCoreError } from '@/error/main';
import { checkIfPartOfCron } from 'common';

type resultSaleDataType = {
  sale: Sale | null;
  allowedItemCount: number; //-1で無制限
  originalPrice: number; //元々の価格
  discountPrice: number; //割引分の価格
  resultPrice: number; //最終的な価格
};

export class BackendCoreSaleService extends BackendService {
  constructor() {
    super();
    // this.setIds({
    //   saleId,
    // });
  }

  //特定のセールを特定の商品に適用することができるかを判断する
  @BackendService.WithIds(['storeId'])
  public async checkIfAttachableSale({
    transaction_kind,
    saleInfo,
    productInfo,
    asPostCheck,
  }: {
    //色々考えた結果、引数が少々複雑になったのは致し方がない
    transaction_kind: Transaction['transaction_kind'];
    saleInfo: {
      id: Sale['id']; //IDは必ず必要
      info?: Sale & {
        //事前に取得できてた場合は指定する（パフォーマンスのため）
        departments: Sale_Department[];
        products: Sale_Product[];
        product_history: Sale_Product_History[];
      };
    };
    productInfo: {
      id: Product['id'];
      info?: {
        //こちらもキャッシュを利用する感じで
        product: Product & { item: Item | null };
      };
    };
    asPostCheck?: boolean; //追加した後の確認として行うかどうか
  }) {
    //カスタムDBオブジェクトを使える
    const db = this.db;

    //必要な情報が揃っているか確認
    if (!saleInfo.info) {
      const thisSaleInfo = await db.sale.findUnique({
        where: {
          id: saleInfo.id,
          store_id: this.ids.storeId!,
          transaction_kind,
          status: SaleStatus.ON_HELD,
          on_pause: {
            not: true,
          },
        },
        include: {
          products: true,
          product_history: true,
          departments: true,
        },
      });

      if (!thisSaleInfo)
        throw new BackendCoreError({
          internalMessage: 'セール情報が見つかりません',
          externalMessage: 'セール情報が見つかりません',
        });

      saleInfo.info = thisSaleInfo;
    }

    //商品情報も取得する
    if (!productInfo.info) {
      const thisProductInfo = await db.product.findUnique({
        where: {
          id: productInfo.id,
          store_id: this.ids.storeId!,
        },
        include: {
          item: true,
        },
      });

      if (!thisProductInfo)
        throw new BackendCoreError({
          internalMessage: '商品が見つかりません',
          externalMessage: '商品が見つかりません',
        });

      productInfo.info = {
        product: thisProductInfo,
      };
    }

    //これですべての情報が揃ったため、ここから判断していく
    //nullを返したら適用できないセールだったことにする

    let isTarget = false;

    //まずは商品
    for (const p of saleInfo.info!.products) {
      //除外設定に入っていた場合はすぐに次のセールにいく
      if (p.rule == SaleRule.exclude && p.product_id == productInfo.id)
        return null;

      //含有設定に入っていた場合は、このループを抜けて次のステップに進む
      if (p.rule == SaleRule.include && p.product_id == productInfo.id) {
        console.log('含有商品に入っていました');
        isTarget = true;
        break;
      }
    }

    //部門の方も確認 すでに対象であることがわかっている場合、時間の無駄なため飛ばす

    if (!isTarget && saleInfo.info!.departments.length) {
      for (const d of saleInfo.info!.departments) {
        //除外設定に入っていた場合はすぐに次のセールにいく 現在はこのパターンはないため大丈夫
        // if(d.rule == SaleRule.exclude && allDepartmentId.includes(d.department_id)) continue candidateLoop;

        //含有設定に入っていた場合はこのループを抜けて次のステップに進む
        if (
          d.rule == SaleRule.include &&
          (d.item_genre_id == null ||
            d.item_genre_id == productInfo.info.product.item?.genre_id) &&
          (d.item_category_id == null ||
            d.item_category_id == productInfo.info.product.item?.category_id)
        ) {
          console.log('含有部門に入っていました');
          isTarget = true;
          break;
        }
      }
    }

    //ここまで来て、対象商品じゃなかったら次のセールにいく
    if (!isTarget) return null;

    //割引量を計算する

    if (!saleInfo.info!.discount_amount) return null;

    const thisSaleResultData: resultSaleDataType = {
      sale: null,
      allowedItemCount: -1, //-1で無制限
      originalPrice:
        productInfo.info.product[
          `specific_${transaction_kind as 'sell' | 'buy'}_price`
        ] ??
        productInfo.info.product[
          `${transaction_kind as 'sell' | 'buy'}_price`
        ] ??
        0, //元々の価格
      discountPrice: 0, //割引分の価格
      resultPrice: 0, //最終的な価格
    };

    //この辺も必要に応じて関数かしたい
    if (saleInfo.info!.discount_amount.includes('%')) {
      //%指定だった場合

      thisSaleResultData.resultPrice =
        (thisSaleResultData.originalPrice *
          parseInt(saleInfo.info!.discount_amount)) /
        100;
      thisSaleResultData.discountPrice =
        thisSaleResultData.resultPrice - thisSaleResultData.originalPrice;
    } else {
      //数値指定だった場合

      thisSaleResultData.resultPrice =
        thisSaleResultData.originalPrice +
        parseInt(saleInfo.info!.discount_amount);
      thisSaleResultData.discountPrice = parseInt(
        saleInfo.info!.discount_amount,
      );
    }

    //最後に、個数系の制限にあたってないか確認する
    if (saleInfo.info!.end__total_item_count) {
      console.log('このセールは最大個数制限が決められているため、検証します');

      //トータルだった場合は、現時点での商品の総数と比較する
      const currentSum = saleInfo.info!.product_history.reduce(
        (curSum, e) => curSum + e.total_item_count,
        0,
      );

      const remainCount = saleInfo.info!.end__total_item_count - currentSum;

      if (
        (!asPostCheck && remainCount <= 0) ||
        (asPostCheck && remainCount < 0)
      ) {
        //後チェックの場合は0でもOKとする（ギリセーフなため）
        //個数オーバーであるためこのセールを飛ばす
        return null;
      } else {
        //オーバーしてなかった場合、残り個数をデータに入れる
        thisSaleResultData.allowedItemCount = remainCount;
        console.log('最大個数制限にはひっかからなかったので続行します');
      }
    }

    //個別個数の方も確認
    if (saleInfo.info!.end__unit_item_count) {
      console.log('このセールは個別個数制限が決められているため、検証します');

      const currentSum =
        saleInfo.info!.product_history.find(
          (e) => e.product_id == productInfo.id,
        )?.total_item_count || 0;

      const remainCount = saleInfo.info!.end__unit_item_count - currentSum;

      if (
        (!asPostCheck && remainCount <= 0) ||
        (asPostCheck && remainCount < 0)
      ) {
        //個数オーバーであるためこのセールを飛ばす
        return null;
      } else {
        //オーバーしてなかった場合、残り個数をデータに入れる
        if (thisSaleResultData.allowedItemCount < 1) {
          thisSaleResultData.allowedItemCount = remainCount;
        }

        //すでに残り個数が指定されている場合、少ない方に合わせる
        else if (thisSaleResultData.allowedItemCount > remainCount) {
          thisSaleResultData.allowedItemCount = remainCount;
        }

        console.log('個別個数制限に引っ掛からなかったので続行します');
      }
    }

    //あたっていなかったらこのセールを候補として追加する
    // @ts-expect-error becuase of ここで厳密に型を保持する必要がないため
    delete saleInfo.info.products;
    // @ts-expect-error becuase of ここで厳密に型を保持する必要がないため
    delete saleInfo.info.product_history;
    // @ts-expect-error becuase of ここで厳密に型を保持する必要がないため
    delete saleInfo.info.departments;

    thisSaleResultData.sale = saleInfo.info as Sale;

    //セール情報を返す
    return thisSaleResultData;
  }

  //セールのステータスを更新する
  public async updateStatus({
    storeId,
    customDate,
  }: {
    storeId?: Store['id'];
    customDate?: string;
  }) {
    //まずは現在時間を取得する（10分単位）
    const now = customDayjs();

    const tenLevel = now.tz().format('mm').slice(0, 1) + '0';
    const nowTenLevel = customDayjs.tz(
      now.tz().format(customDate || `YYYY-MM-DD HH:${tenLevel}:00`),
    ); //日本での時刻入力として扱う

    const nowDate = nowTenLevel.toDate();
    const nowTime = nowDate.getTime();

    //ログを残す
    const createLogResult = await this.db.sale_Calculate_History.create({
      data: {},
    });

    //ログ
    let logText = `
実行対象区分：${nowTenLevel.format('YYYY-MM-DD HH:mm:ss')} ${
      storeId ? `対象ストア: ${storeId}` : ''
    }
`;

    //まず 開催中 or 未開催で開催日時が現在時刻よりも前のものをすべて取得する
    const allSales = await this.db.sale.findMany({
      where: {
        status: {
          not: SaleStatus.FINISHED, //終了済みのものはもう大丈夫
        },
        start_datetime: {
          lte: nowTenLevel.toDate(),
        },
        ...(storeId ? { store_id: storeId } : null),
      },
      select: {
        id: true,
        status: true,
        start_datetime: true,
        end__datetime: true,
        end__total_item_count: true,
        end__unit_item_count: true,
        repeat_cron_rule: true,
        sale_end_datetime: true,
        product_history: {
          select: {
            product_id: true,
            total_item_count: true,
          },
        },
        products: true,
      },
    });

    logText += `
処理対象セールは${allSales.length}個あります
`;

    try {
      //ここで処理を行う

      //ステータスの更新にあたっては以下を確認しないといけない
      //一つのセールに対して、一応すべての処理を通らせる

      //・開催にできるか
      //　　・繰り返しのルールの開始時間に相当していた場合は開催（既存の履歴を一旦全て削除する）
      //　　・それ以外、普通に開催時間に相当していた場合は開催

      //・未開催にできるか
      //　　・繰り返し設定があり、セール自体の終了時間には達していないが、繰り返しの終了時間に達している場合
      //　　・繰り返し設定があり、セール自体の終了時間には達していないが、個数制限に完全に達している場合、

      //・開催済みにできるか
      //　　・セール自体の終了時間に相当していた場合
      //　　・繰り返し設定がなく、セールの個数上限に達していた場合

      //すべてのセールを確認していく
      for (const eachSale of allSales) {
        const startTime = eachSale.start_datetime.getTime();
        const endTime = eachSale.sale_end_datetime?.getTime();
        const repeatStartCron = eachSale.repeat_cron_rule || '';

        //セールの個数上限に達しているかどうか
        let ifAlreadyMax = false;
        if (eachSale.end__total_item_count) {
          //履歴の合計数を求める
          const totalItemCount = eachSale.product_history.reduce(
            (curSum, e) => curSum + e.total_item_count,
            0,
          );

          if (totalItemCount >= eachSale.end__total_item_count)
            ifAlreadyMax = true;
        }

        // 対象商品を個別で選択されていた時のみ
        const targetProducts = eachSale.products.filter(
          (e) => e.rule == SaleRule.include,
        );

        if (
          eachSale.end__unit_item_count &&
          eachSale.end__unit_item_count > 0 &&
          targetProducts.length
        ) {
          //履歴のそれぞれのアイテムの合計数が指定数に達しているか確認
          ifAlreadyMax = targetProducts.every((e) => {
            //履歴にあるか確認する
            const targetHistory = eachSale.product_history.find(
              (hp) => e.product_id == hp.product_id,
            );

            if (!targetHistory) return false;

            return (
              targetHistory.total_item_count >= eachSale.end__unit_item_count!
            );
          });
        }

        //繰り返し設定かどうか
        const ifRepeatSale = repeatStartCron;

        await this.transaction(async (tx) => {
          let currentSaleStatus: Sale['status'] = eachSale.status;

          //開催にできるか確認する
          //もしくは繰り返しの範疇に相当しているか確認
          //もしくは、繰り返しセールではなくて、開催時間を過ぎていたら
          if (
            ((!ifRepeatSale && nowTime >= startTime) ||
              checkIfPartOfCron(
                repeatStartCron,
                nowDate,
                eachSale.start_datetime,
                eachSale.end__datetime,
              )) &&
            currentSaleStatus != SaleStatus.ON_HELD
          ) {
            //ステータスを開催中に設定する
            const updateResult = await tx.sale.update({
              where: {
                id: eachSale.id,
              },
              data: {
                status: SaleStatus.ON_HELD,
              },
            });

            currentSaleStatus = updateResult.status;

            logText += `
セール:${eachSale.id} のステータスを${currentSaleStatus}に変更しました
`;
          }

          //未開催にできるか確認する（繰り返し設定があるもののみ）
          //まず、繰り返しセールでありかつ、セール自体の終了時間になってないか確認
          if (ifRepeatSale && currentSaleStatus != SaleStatus.NOT_HELD) {
            //CRONの終了時間に達しているか（それぞれの） もしくは個数制限を完全に突破してしまっているものがあるか確認
            if (
              !checkIfPartOfCron(
                //範囲内に入っていてはいけないため、!をつける
                repeatStartCron,
                nowDate,
                eachSale.start_datetime,
                eachSale.end__datetime,
              ) ||
              ifAlreadyMax
            ) {
              //ステータスを一旦未開催に戻す
              //同時に履歴を削除する
              const updateResult = await tx.sale.update({
                where: {
                  id: eachSale.id,
                },
                data: {
                  status: SaleStatus.NOT_HELD,
                },
              });

              await tx.sale_Product_History.deleteMany({
                where: {
                  sale_id: eachSale.id,
                },
              });

              currentSaleStatus = updateResult.status;

              logText += `
セール:${eachSale.id} のステータスを${currentSaleStatus}に変更しました
`;
            }
          }

          //開催終了にできるか確認する

          //セール自体の終了時間に相当している（過去のものでもOK）か確認
          //繰り返し設定ではなく、上限値に達しているか確認
          if (
            (endTime && nowTime >= endTime) ||
            (!ifRepeatSale && ifAlreadyMax)
          ) {
            //ステータスを開催済に設定する
            const updateResult = await tx.sale.update({
              where: {
                id: eachSale.id,
              },
              data: {
                status: SaleStatus.FINISHED,
              },
            });

            currentSaleStatus = updateResult.status;

            logText += `
セール:${eachSale.id} のステータスを${currentSaleStatus}に変更しました
`;
          }
        });
      }

      //最後に更新する
      await this.db.sale_Calculate_History.update({
        where: {
          id: createLogResult.id,
        },
        data: {
          log_text: logText,
          status: SaleCalculaterHistoryStatus.OK,
        },
      });
      console.log('セールのステータス更新処理:\n\n' + logText);
    } catch (e: any) {
      console.log(e);

      const errorLog = logText + '\n\nエラー発生: ' + e.message;

      await this.db.sale_Calculate_History.update({
        where: {
          id: createLogResult.id,
        },
        data: {
          log_text: errorLog,
          status: SaleCalculaterHistoryStatus.ERROR,
        },
      });
      console.log('セールのステータス更新処理:\n\n' + errorLog);
    }
  }
}
