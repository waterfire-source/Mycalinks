import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { BackendCoreStoreService } from '@/services/internal/store/main';
import {
  PaymentMode,
  Register,
  Register_Cash_History,
  RegisterCashHistorySourceKind,
  RegisterStatus,
  TransactionKind,
  TransactionPaymentMethod,
  TransactionSalesKind,
  TransactionStatus,
} from '@prisma/client';
import { customDayjs } from 'common';
export class BackendCoreRegisterService extends BackendService {
  constructor(registerId?: Register['id']) {
    super();
    this.setIds({
      registerId,
    });
  }

  declare targetObject?: Register;

  //指定されたレジが存在するか確認しつつ、リソース情報を格納する
  //ここでは論理削除は許さない、許されない
  public get existingObj() {
    return (async () => {
      //すでにobjがある場合それを返す
      if (this.targetObject) return this.targetObject;

      //ない場合リソースから取得（前の処理が残っている）
      let registerInfo = this.resources.register;

      //それもなかったら取得
      if (!registerInfo) {
        registerInfo = await this.db.register.findUnique({
          where: {
            id: this.ids.registerId,
          },
        });
      }

      if (!registerInfo)
        throw new BackendCoreError({
          internalMessage: 'レジが見つかりません',
        });

      this.targetObject = registerInfo;

      return this.targetObject;
    })();
  }

  /**
   * レジ開け、締めを行う
   */
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['store'])
  public changeStatus = async (newStatus: RegisterStatus) => {
    const thisRegisterInfo = await this.existingObj;

    const storeModel = new BackendCoreStoreService(this.ids.storeId);
    this.give(storeModel);

    switch (newStatus) {
      //サブレジなのに、開店してない時に開レジしようとしてたらエラー
      case RegisterStatus.OPEN: {
        if (thisRegisterInfo.status == newStatus)
          throw new BackendCoreError({
            internalMessage: 'すでに開いているレジです',
            externalMessage: 'すでに開いているレジです',
          });

        if (
          this.resources.store!.register_cash_manage_by_separately &&
          !thisRegisterInfo.is_primary &&
          !this.resources.store!.opened
        )
          throw new BackendCoreError({
            internalMessage:
              '開店していない時にサブレジを開けることはできません',
            externalMessage:
              '開店していない時にサブレジを開けることはできません',
          });

        //一回の営業で2回目開けようとしていたらエラー
        //最後にレジを開けた時間が開店時間以上だったら2回目の開レジということになるためエラー
        //まだ開店してなかったら耐える
        let lastOpenedAt: Date | undefined;
        try {
          lastOpenedAt = await storeModel.todayOpenedAt;
        } catch (error) {
          // エラー回避のためここにコメントが必要
        }
        const lastRegisterOpenedAt = await this.getLastOpenedAt();

        if (
          lastRegisterOpenedAt &&
          lastOpenedAt &&
          lastOpenedAt.getTime() - 5000 < lastRegisterOpenedAt.getTime()
        )
          throw new BackendCoreError({
            internalMessage: '1回の営業で2回レジを開けることはできません',
            externalMessage: '1回の営業で2回レジを開けることはできません',
          });

        break;
      }

      case RegisterStatus.CLOSED: {
        if (thisRegisterInfo.status == newStatus)
          throw new BackendCoreError({
            internalMessage: 'すでにしまっているレジです',
            externalMessage: 'すでにしまっているレジです',
          });
      }
    }

    //ステータスを変える
    const updateRes = await this.db.register.update({
      where: {
        id: thisRegisterInfo.id,
      },
      data: {
        status: newStatus,
      },
    });

    //一括設定にしてたら他のレジも書き換える
    // レジ金を全体で管理する設定になっていた場合、他のレジ（有効なもの）も全て同時に書き換える
    if (!this.resources.store!.register_cash_manage_by_separately) {
      await this.db.register.updateMany({
        where: {
          store_id: thisRegisterInfo.store_id,
          deleted: false,
        },
        data: {
          status: updateRes.status,
        },
      });
    }

    const allRegisters = await this.db.register.findMany({
      where: {
        store_id: thisRegisterInfo.store_id,
        deleted: false,
      },
    });

    //後処理
    switch (newStatus) {
      case RegisterStatus.OPEN: {
        //ストアが閉店になっていたら開店する
        if (!this.resources.store!.opened) {
          //メインレジじゃないといけない
          if (!thisRegisterInfo.is_primary) {
            throw new BackendCoreError({
              internalMessage: 'メインレジでないと開店できません',
              externalMessage: 'メインレジでないと開店できません',
            });
          }

          //開店する
          await storeModel.changeOpen(true);
        }
        break;
      }

      case RegisterStatus.CLOSED: {
        //開店していて、すべてのレジが閉まっていたら閉店する
        if (
          this.resources.store!.opened &&
          allRegisters.every((r) => r.status == RegisterStatus.CLOSED)
        ) {
          //このレジがメインレジじゃなかったらエラー
          if (!thisRegisterInfo.is_primary) {
            throw new BackendCoreError({
              internalMessage: 'メインレジでないと閉店できません',
              externalMessage: 'メインレジでないと閉店できません',
            });
          }

          await storeModel.changeOpen(false);
        }

        //開店していて、全てのレジは閉まっていないのにこれがメインレジがだったらエラー
        if (
          this.resources.store!.opened &&
          !allRegisters.every((r) => r.status == RegisterStatus.CLOSED) &&
          thisRegisterInfo.is_primary
        ) {
          throw new BackendCoreError({
            internalMessage: 'メインレジは先に閉めることができません',
            externalMessage: 'メインレジは先に閉めることができません',
          });
        }

        break;
      }
    }
    return updateRes;
  };

  /**
   * 開レジ時間を取得する
   * @returns 最後の開レジ時間
   */
  public getLastOpenedAt = async () => {
    const thisRegisterInfo = await this.existingObj;

    //履歴を参照
    const lastOpenedInfo = await this.db.register_Status_History.findFirst({
      where: {
        register_id: thisRegisterInfo.id,
        setting_value: RegisterStatus.OPEN,
      },
      orderBy: {
        run_at: 'desc',
      },
    });

    return lastOpenedInfo?.run_at;
  };

  //今日開店からの現金履歴を取得
  //一括設定の場合、ストアないの全ての履歴
  @BackendService.WithIds(['registerId', 'storeId'])
  @BackendService.WithResources(['store'])
  public getCashHistory = async (openMode?: boolean) => {
    const thisRegisterInfo = await this.existingObj;
    const storeModel = new BackendCoreStoreService(this.ids.storeId);
    const manageSeparately =
      this.resources.store!.register_cash_manage_by_separately;

    //最終開店日時を取得
    let lastOpenedAt: Date | undefined;
    let lastRegisterOpenedAt: Date | undefined;
    try {
      lastOpenedAt = await storeModel.todayOpenedAt;
    } catch (error) {
      // エラー回避のためここにコメントが必要
    }

    const now = customDayjs();

    //開レジ時間（ない場合は開店時間で） 開店点検の時は現在時刻
    const openedDateTime = openMode
      ? now
      : lastRegisterOpenedAt
      ? customDayjs(lastRegisterOpenedAt)
      : customDayjs(lastOpenedAt);

    //この辺から他の決済方法のデータなども全てまとめて取得する様にする

    const resultData = {
      openedDateTime: openedDateTime.toDate(),
      manageSeparately,
      initCashPrice: 0, //開店時のレジ現金量
      idealCashPrice: 0, //理論上の現金
      transaction_sell: 0, //現金販売売上
      transaction_buy: 0, //現金買取売上（絶対値）
      transaction_sell_return: 0, //現金販売返金合計（絶対値）
      transaction_buy_return: 0, //現金買取返金合計（絶対値）
      reservation_deposit: 0, //予約前金合計
      reservation_deposit_return: 0, //予約前金返金合計
      import: 0, //入金
      export: 0, //出金
      sales: 0, //リセット時の調整金 こいつだけマイナスを許可する
      adjust: 0, //過不足の調整 こいつもマイナス許可
    };

    const registerCondition = manageSeparately
      ? {
          register_id: thisRegisterInfo.id, //個別の場合はレジID
        }
      : {
          register: {
            store_id: this.ids.storeId,
          }, //一括の場合はstoreId指定をする
        };

    //開レジ直前のレジ金を取得する 個別設定の場合と一括設定で処理を分ける
    const initCashPriceInfo = await this.db.register_Cash_History.findFirst({
      where: {
        ...registerCondition,
        datetime: {
          lte: openedDateTime.toDate(),
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    resultData.initCashPrice =
      (manageSeparately
        ? initCashPriceInfo?.result_register_cash_price
        : initCashPriceInfo?.result_cash_price) ?? 0;

    //開店時からの現金変動履歴を取得する ここも個別と一括で条件を分ける
    //レジを絞る
    const cashHistories = await this.db.register_Cash_History.findMany({
      where: {
        ...registerCondition,
        datetime: {
          gt: openedDateTime.toDate(),
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    //それぞれの額を取得する
    cashHistories.forEach((history) => {
      if (history.source_kind in resultData) {
        resultData[history.source_kind] += Math.abs(history.change_price); //それ以外は絶対値を取得する
      }
    });

    //理想現金を算出
    resultData.idealCashPrice =
      resultData.initCashPrice +
      resultData.transaction_sell +
      resultData.transaction_buy_return -
      resultData.transaction_buy -
      resultData.transaction_sell_return -
      resultData.reservation_deposit_return +
      resultData.reservation_deposit +
      resultData.import -
      resultData.export;
    // resultData.sales +
    // resultData.adjust;

    return resultData;
  };

  //指定された期間の売上情報やレジの入出金などを全てまとめる
  //レジ精算（金種とかのやつ）の情報はフレキシブルな期間で表せられないため、ここでは割愛
  //レジごとにするのか一括でストアのものを取得するのかは選べる

  //[TODO] となるとこれはTransactionModelのスコープでは？
  @BackendService.WithIds(['registerId', 'storeId'])
  @BackendService.WithResources(['store'])
  public async getMoneyInfo(
    startAt: Date,
    endAt: Date,
    onlyThisRegister?: boolean,
  ) {
    //cash qrなどは固定にしようか、動的にしようかは迷う

    //cash qrなどは固定にしようか、動的にしようかは迷う
    const template = {
      salesSummary: {
        //販売実績
        salesRawTotal: 0, //返金分を差し引く前
        salesTotal: 0, //合計売上
        salesTotalExcludeTax: 0, //税抜き合計売上
        salesTotalTax: 0, //合計税額
        discountTotal: 0, //値引き
        refundTotal: 0, //返金額合計
        reservationDepositTotal: 0, //予約前金合計
        reservationDepositRefundTotal: 0, //予約前金返金合計
        saleCount: 0, //販売件数
        refundCount: 0, //返金件数
        customerCount: 0, //客数
        customerUnitPrice: 0, //客単価
        importTotal: 0, //入金合計 //[TODO] なぜここに入金が？
        exportTotal: 0, //出金合計
        importCount: 0, //入金件数
        exportCount: 0, //出金件数
      },
      purchaseSummary: {
        purchaseRawTotal: 0, //返金分を差し引く前
        purchaseTotal: 0, //合計買取額
        purchaseTotalExcludeTax: 0, //税抜き合計買取額
        purchaseTotalTax: 0, //合計税額
        discountTotal: 0, //割り増し合計額
        refundTotal: 0, //返金合計額
        purchaseCount: 0, //買取件数
        purchaseProductCount: 0, //買取枚数
        refundCount: 0, //返金件数
        customerCount: 0, //買取客数
        customerUnitPrice: 0, //客単価
      },
      cash: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
      bank: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
      square: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
      felica: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
      paypay: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },

      //影響範囲を少なくするため、一旦このプロパティ名でイク
      buy_cash: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
      buy_bank: {
        payTotal: 0, //決済額
        refundTotal: 0, //返金額
        payCount: 0, //決済件数
        refundCount: 0, //返金件数
        pureTotal: 0, //純決済額
      },
    };

    //これらの期間の取引を全て洗い出す
    const allTransactions = await this.db.transaction.findMany({
      where: {
        store_id: this.ids.storeId!,
        finished_at: {
          gt: startAt,
          lt: endAt,
        },
        status: TransactionStatus.completed, //取引が完全に終了しているもののみ
        ...(onlyThisRegister ? { register_id: this.ids.registerId! } : null),
      },
      include: {
        payment: true,
        transaction_carts: true,
      },
    });

    const portKind = [
      RegisterCashHistorySourceKind.export,
      RegisterCashHistorySourceKind.import,
    ];

    //上の関数でいい気もするが、一応キャッシュフローも取得
    const allCashFlow = await this.db.register_Cash_History.findMany({
      where: {
        register: {
          ...(onlyThisRegister ? { id: this.ids.registerId! } : null),
          store_id: this.ids.storeId!,
        },
        datetime: {
          gt: startAt,
          lt: endAt,
        },
        source_kind: {
          in: portKind,
        },
      },
    });

    const payCalcData = allTransactions.reduce((sum, t) => {
      const includeReservationDeposit = t.transaction_carts.some(
        (e) => e.reservation_reception_product_id_for_deposit,
      );
      switch (t.transaction_kind) {
        case TransactionKind.sell: {
          if (!t.is_return) {
            //通常売上
            //Paymentレコードがないと有効な支払いとしてみない
            if (!t.payment || !t.payment.mode || !t.payment_method) return sum;
            const p = t.payment;
            const totalAmount = Math.abs(p.total_amount);

            if (p.mode == PaymentMode.pay) {
              //前金の支払いだったら別扱い

              if (!includeReservationDeposit) {
                //割引を取得
                const totalUnitDiscount = t.transaction_carts.reduce(
                  (curSum, e) =>
                    curSum + e.total_discount_price! * e.item_count,
                  0,
                );
                const totalDiscount = Math.abs(
                  t.total_discount_price! + totalUnitDiscount,
                );

                sum.salesSummary.discountTotal += totalDiscount;

                //合計売上をつける
                sum.salesSummary.salesRawTotal += totalAmount;

                //販売件数 客数をつける
                sum.salesSummary.saleCount += 1;
                sum.salesSummary.customerCount += 1;

                sum[t.payment_method!][`${p.mode!}Total`] += totalAmount;
                sum[t.payment_method!][`${p.mode!}Count`] += 1;
              } else {
                sum.salesSummary.reservationDepositTotal += totalAmount;
              }
            }
          } else {
            //通常売上
            //Paymentレコードがないと有効な支払いとしてみない
            if (!t.payment || !t.payment.mode || !t.payment_method) return sum;
            const p = t.payment;
            const totalAmount = Math.abs(p.total_amount);

            if (p.mode == PaymentMode.refund) {
              if (!includeReservationDeposit) {
                sum.salesSummary.refundTotal += totalAmount;
                sum.salesSummary.refundCount += 1;

                sum[t.payment_method!][`${p.mode!}Total`] += totalAmount;
                sum[t.payment_method!][`${p.mode!}Count`] += 1;
              } else {
                sum.salesSummary.reservationDepositRefundTotal += totalAmount;
              }
            }
          }

          break;
        }

        case TransactionKind.buy: {
          if (!t.is_return) {
            //買取
            //Paymentレコードがないと有効な支払いとしてみない
            if (!t.payment || !t.payment.mode || !t.payment_method) return sum;
            const p = t.payment;
            const totalAmount = Math.abs(p.total_amount);

            if (p.mode == PaymentMode.pay) {
              //割引を取得
              const totalUnitDiscount = t.transaction_carts.reduce(
                (curSum, e) => curSum + e.total_discount_price! * e.item_count,
                0,
              );
              const totalDiscount = Math.abs(
                t.discount_price + totalUnitDiscount,
              );
              const totalProductCount = t.transaction_carts.reduce(
                (curSum, e) => curSum + e.item_count,
                0,
              );

              sum.purchaseSummary.discountTotal += totalDiscount;

              sum.purchaseSummary.purchaseRawTotal += totalAmount;

              //買取商品数
              sum.purchaseSummary.purchaseProductCount += totalProductCount;

              //販売件数 客数をつける
              sum.purchaseSummary.purchaseCount += 1;
              sum.purchaseSummary.customerCount += 1;
            } else if (p.mode == PaymentMode.refund) {
              sum.purchaseSummary.refundTotal += totalAmount;
              sum.purchaseSummary.refundCount += 1;
            }

            sum[`buy_${t.payment_method as 'bank' | 'cash'}`][
              `${p.mode!}Total`
            ] += totalAmount;
            sum[`buy_${t.payment_method as 'bank' | 'cash'}`][
              `${p.mode!}Count`
            ] += 1;
          } else {
            //買取
            //Paymentレコードがないと有効な支払いとしてみない
            if (!t.payment || !t.payment.mode || !t.payment_method) return sum;
            const p = t.payment;
            const totalAmount = Math.abs(p.total_amount);

            if (p.mode == PaymentMode.refund) {
              sum.purchaseSummary.refundTotal += totalAmount;
              sum.purchaseSummary.refundCount += 1;

              sum[`buy_${t.payment_method as 'bank' | 'cash'}`][
                `${p.mode!}Total`
              ] += totalAmount;
              sum[`buy_${t.payment_method as 'bank' | 'cash'}`][
                `${p.mode!}Count`
              ] += 1;
            }
          }

          break;
        }
      }

      return sum;
    }, template);

    //入出金の履歴の方も取得する[TODO] この関数内でやりたくない
    const finallyCalcData = allCashFlow.reduce((sum, h) => {
      sum.salesSummary[`${h.source_kind as (typeof portKind)[number]}Total`] +=
        Math.abs(h.change_price);
      sum.salesSummary[
        `${h.source_kind as (typeof portKind)[number]}Count`
      ] += 1;

      return sum;
    }, payCalcData);

    //集計
    // finallyCalcData.salesSummary.salesTotal =
    //   finallyCalcData.salesSummary.salesRawTotal -
    //   finallyCalcData.salesSummary.refundTotal;

    finallyCalcData.salesSummary.salesTotal =
      finallyCalcData.salesSummary.salesRawTotal;

    finallyCalcData.purchaseSummary.purchaseTotal =
      finallyCalcData.purchaseSummary.purchaseRawTotal;

    //ここでは全て内税であるため、外税/内税の設定は特に考慮する必要なし
    //税金
    finallyCalcData.salesSummary.salesTotalTax = Math.round(
      finallyCalcData.salesSummary.salesTotal *
        (this.resources.store!.tax_rate / (1 + this.resources.store!.tax_rate)),
    );

    finallyCalcData.purchaseSummary.purchaseTotalTax = Math.round(
      finallyCalcData.purchaseSummary.purchaseTotal *
        (this.resources.store!.tax_rate / (1 + this.resources.store!.tax_rate)),
    );

    finallyCalcData.salesSummary.salesTotalExcludeTax =
      finallyCalcData.salesSummary.salesTotal -
      finallyCalcData.salesSummary.salesTotalTax;

    finallyCalcData.purchaseSummary.purchaseTotalExcludeTax =
      finallyCalcData.purchaseSummary.purchaseTotal -
      finallyCalcData.purchaseSummary.purchaseTotalTax;

    //客単価
    finallyCalcData.salesSummary.customerUnitPrice = finallyCalcData
      .salesSummary.customerCount
      ? Math.round(
          finallyCalcData.salesSummary.salesTotal /
            finallyCalcData.salesSummary.customerCount,
        )
      : 0;

    finallyCalcData.purchaseSummary.customerUnitPrice = finallyCalcData
      .purchaseSummary.customerCount
      ? Math.round(
          finallyCalcData.purchaseSummary.purchaseTotal /
            finallyCalcData.purchaseSummary.customerCount,
        )
      : 0;

    //純決済額
    Object.values(TransactionPaymentMethod).forEach((m) => {
      finallyCalcData[m].pureTotal =
        finallyCalcData[m].payTotal - finallyCalcData[m].refundTotal;
    });

    //買取だけ取得で対応 [TODO] もっと良い方法があるはず
    (['buy_bank', 'buy_cash'] as const).forEach((m) => {
      finallyCalcData[m].pureTotal =
        finallyCalcData[m].payTotal - finallyCalcData[m].refundTotal;
    });

    return finallyCalcData;
  }

  //前金は含まない
  public static moneyInfoToSalesList = (
    moneyInfo: Awaited<ReturnType<typeof this.prototype.getMoneyInfo>>,
  ) => {
    const salesList: Array<{
      kind: TransactionSalesKind;
      payment_method: TransactionPaymentMethod;
      total_price: number;
    }> = [];

    //販売の方
    Object.values(TransactionPaymentMethod).forEach((m) => {
      const info = moneyInfo[m];
      const payment_method = m;

      salesList.push(
        {
          kind: TransactionSalesKind.sell,
          payment_method,
          total_price: info.payTotal,
        },
        {
          kind: TransactionSalesKind.sell_return,
          payment_method,
          total_price: info.refundTotal,
        },
      );
    });

    //買取
    (['buy_bank', 'buy_cash'] as const).forEach((m) => {
      const info = moneyInfo[m];
      const payment_method = m.replace('buy_', '') as TransactionPaymentMethod;

      salesList.push(
        {
          kind: TransactionSalesKind.buy,
          payment_method,
          total_price: info.payTotal,
        },
        {
          kind: TransactionSalesKind.buy_return,
          payment_method,
          total_price: info.refundTotal,
        },
      );
    });

    return salesList;
  };

  //レジ内現金を変動させる 同時にストアの現金量も調整する
  //レジ金を個別で管理しない設定になっていた場合は、ストアの現金料だけ調整する
  //changePriceが0だった場合、変動させない
  @BackendService.WithIds(['registerId', 'storeId'])
  @BackendService.WithResources(['store'])
  @BackendService.WithTx
  public async changeCash({
    toPrice,
    changePrice,
    source_id,
    source_kind,
    description,
  }: {
    toPrice?: number; //この金額までの変動
    changePrice?: number; //変動額
    source_id?: Register_Cash_History['source_id']; //変動に結びつけるリソースのIDなど
    source_kind: Register_Cash_History['source_kind']; //変動の種類
    description?: Register_Cash_History['description']; //備考
  }) {
    if (toPrice == undefined && changePrice == undefined)
      throw new BackendCoreError({
        internalMessage: 'レジ金を変動させるには変動量の指定が必要です',
        externalMessage: 'レジ金を変動させるには変動量の指定が必要です',
      });

    const staff_account_id =
      this.resources.actionAccount?.id ??
      BackendService.coreConfig.systemAccountId;

    let registerInfo;

    //register_id = 1でかつstore_id = 1じゃない場合、デフォルトを参照するモードであるため取得し直す[のちに削除予定なロジック]
    if (this.ids.registerId == 1 && this.ids.storeId != 1) {
      registerInfo = await this.db.register.findFirstExists({
        where: {
          store_id: this.ids.storeId,
        },
        include: {
          store: true,
        },
      });
    } else {
      registerInfo = await this.db.register.findUniqueExists({
        where: {
          id: this.ids.registerId,
          store_id: this.ids.storeId,
        },
        include: {
          store: true,
        },
      });
    }

    if (!registerInfo)
      throw new BackendCoreError({
        internalMessage: 'レジ金を変動させるにはレジ情報が必要です',
        externalMessage: 'レジ金を変動させるにはレジ情報が必要です',
      });

    const storeSetting = registerInfo.store;

    let actualChangePrice: number; //変動額
    let resultPrice: number; //レジのresultPrice（全体の場合0）
    let storeResultPrice: number; //ストアのresultPrice
    let shouldChangeRegisterPrice = false;

    //個別かどうかを見極める
    if (storeSetting.register_cash_manage_by_separately) {
      shouldChangeRegisterPrice = true;

      //変動させる量を計算する
      actualChangePrice =
        changePrice ?? toPrice! - registerInfo.total_cash_price;
      resultPrice = registerInfo.total_cash_price + actualChangePrice;
      storeResultPrice = storeSetting.total_cash_price + actualChangePrice;
    } else {
      //全体でレジ金を管理する時
      actualChangePrice =
        changePrice ?? toPrice! - storeSetting.total_cash_price;
      resultPrice = registerInfo.total_cash_price; // = 0なはず
      storeResultPrice = storeSetting.total_cash_price + actualChangePrice;
    }

    if (resultPrice < 0)
      throw new BackendCoreError({
        internalMessage: 'レジ内現金が0を下回ってしまいます',
        externalMessage: 'レジ内現金が0を下回ってしまいます',
      });

    //非同期で一気に変動させる
    const changeRes = await Promise.all([
      shouldChangeRegisterPrice &&
        this.db.register.update({
          //ここは個別設定の時だけ
          //レジの情報を書き換え
          where: {
            id: registerInfo.id,
          },
          data: {
            total_cash_price: {
              increment: actualChangePrice,
            },
          },
        }),
      this.db.store.update({
        //ストアの情報を書き換え
        where: {
          id: registerInfo.store_id,
        },
        data: {
          total_cash_price: {
            increment: actualChangePrice,
          },
        },
      }),
      this.db.register_Cash_History.create({
        data: {
          staff_account_id,
          source_kind,
          source_id,
          change_price: actualChangePrice,
          result_cash_price: storeResultPrice,
          result_register_cash_price: resultPrice,
          register_id: registerInfo.id, //全体設定の時でもここは入力する
          description,
        },
      }),
    ]);

    return {
      register: (shouldChangeRegisterPrice
        ? changeRes[0]
        : registerInfo) as Register,
      store: changeRes[1],
      register_cash_history: changeRes[2],
    };
  }
}
