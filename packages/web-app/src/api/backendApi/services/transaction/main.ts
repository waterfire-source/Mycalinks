import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import {
  Customer,
  Item,
  PaymentMode,
  PaymentService,
  Prisma,
  Product,
  Register_Cash_History,
  RegisterCashHistorySourceKind,
  Reservation_Reception_Product,
  ReservationReceptionProductStatus,
  ReservationStatus,
  Set_Deal,
  Transaction,
  Transaction_Set_Deal,
  TransactionKind,
  TransactionPaymentMethod,
  TransactionStatus,
} from '@prisma/client';
import {
  BackendCoreError,
  BackendCoreTransactionService,
  BackendService,
  TaskManager,
  type TransactionService,
} from 'backend-core';
import { BackendApiReceiptService } from '@/api/backendApi/services/receipt/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { customDayjs } from 'common';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { BackendApiCustomerService } from '@/api/backendApi/services/customer/main';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { BackendApiReservationService } from '@/api/backendApi/services/reservation/main';

/**
 * API側で使うTransactionサービス
 */
export class BackendApiTransactionService extends BackendApiService {
  declare core: BackendCoreTransactionService;

  constructor(API: BackendAPI<any>, specificTransactionId?: Transaction['id']) {
    super(API);
    this.addCore(new BackendCoreTransactionService());
    this.setIds({
      transactionId: specificTransactionId,
    });
  }

  /**
   * 買取の査定完了時に、プッシュ通知を送る　他の用途にも使うかも
   * 顧客が結びついてなかったら無視
   */
  public sendBuyAssessedPushNotification = async () => {
    const transactionInfo = await this.core.existingObj;

    if (transactionInfo.customer === undefined) {
      throw new BackendCoreError({
        internalMessage: '顧客情報が設定されていません',
      });
    }

    if (
      transactionInfo.transaction_kind == TransactionKind.buy &&
      transactionInfo.reception_number &&
      transactionInfo.buy__is_assessed &&
      transactionInfo.customer?.myca_user_id
    ) {
      const mycaAppService = new BackendApiMycaAppService(this.API);

      //プッシュ通知を送る
      await mycaAppService.sendPushNotification({
        mycaUserId: transactionInfo.customer.myca_user_id!,
        title: '買取査定完了のお知らせ',
        body: `受付番号:${transactionInfo.reception_number}の買取査定が終了しました。査定内容を確認して、買取受付までお越しください。`,
      });
    }
  };

  /**
   * 受付番号などを発行する
   */
  @BackendApiService.WithIds(['storeId'])
  public printReceptionNumber = async () => {
    const transactionInfo = await this.core.existingObj;

    const receiptService = new BackendApiReceiptService(this.API);

    let receiptCommand: string | null =
      transactionInfo.transaction_kind == TransactionKind.buy
        ? receiptService.thanks.purchaseReceptionNumber
        : receiptService.thanks.saleReceptionNumber;

    const checkStatusUrl = `${process.env.NEXT_PUBLIC_SERVICE_ORIGIN}/guest/${this.ids.storeId}/transaction/`;

    receiptCommand += `
      ${receiptService.spacer}
      ${receiptService.makeCenter(
        String(transactionInfo.reception_number) || '',
        true,
      )}
      ${receiptService.spacer}
      ${receiptService.makeQr(checkStatusUrl, 8)}
      ${receiptService.spacer}
      ${receiptService.makeCenter(checkStatusUrl)}
      ${receiptService.spacer}
      ${receiptService.makeCenter('査定完了をスマホから')}
      ${receiptService.makeCenter('ご確認いただけます。')}
      `;

    receiptCommand =
      (await receiptService.makeReceiptCommand(receiptCommand)) || '';

    //スタッフ用
    let receiptCommandForStaff: string | null = '';

    //買取の時と受付の時で変える
    if (transactionInfo.transaction_kind == TransactionKind.buy) {
      // 買取で顧客情報がないと一時保留できなくなっていたので一時的にコメントアウト
      // if (!transactionInfo.customer) {
      //   throw new BackendCoreError({
      //     internalMessage: '顧客情報が設定されていません',
      //   });
      // }
      receiptCommandForStaff = receiptService.thanks.purchaseReceptionNumber;
      receiptCommandForStaff += `
        ${receiptService.spacer}
        ${receiptService.makeCenter(
          String(transactionInfo.reception_number) || '',
          true,
        )}
        ${receiptService.spacer}
        ${receiptService.makeRow(
          `お客様名:${transactionInfo.customer?.full_name ?? '未登録'}(${
            transactionInfo.customer?.full_name_ruby ?? '未登録'
          })`,
        )}
        ${receiptService.makeRow(
          `電話番号:${transactionInfo.customer?.phone_number ?? '未登録'}`,
        )}
        `;
    } else {
      if (!transactionInfo.transaction_carts) {
        throw new ApiError({
          status: 400,
          messageText: '販売商品情報が設定されていません',
        });
      }

      receiptCommandForStaff = receiptService.thanks.saleReceptionNumber;

      const receiptTime = customDayjs(transactionInfo.created_at);
      const transactionFlatted = BackendAPI.useFlat([transactionInfo])[0];

      const productCommand =
        transactionFlatted.transaction_carts
          .sort((a: any, b: any) => a.order_number - b.order_number)
          .map(
            (p: any) => `
${receiptService.makeProduct(p, 'product__', transactionInfo.transaction_kind)}
`,
          )
          .join('') + receiptService.hr;

      receiptCommandForStaff += `
        ${receiptService.spacer}
        ${receiptService.makeCenter(
          String(transactionInfo.reception_number) || '',
          true,
        )}
        ${receiptService.spacer}
        ${receiptService.makeCenter(
          `受付時間${receiptTime.tz().format('MM/DD HH:mm')}`,
        )}
        ${receiptService.spacer}
        ${productCommand}
        ${receiptService.makeRow(
          `合計点数`,
          `${transactionInfo.transaction_carts.reduce(
            (acc, cart) => acc + (cart.item_count || 0),
            0,
          )}点`,
        )}
        ${receiptService.makeRow(
          `合計金額`,
          `¥${transactionInfo.total_price.toLocaleString()}`,
        )}
        ${receiptService.hr}
        ${receiptService.spacer}
        `;
    }

    receiptCommandForStaff =
      (await receiptService.makeReceiptCommand(receiptCommandForStaff, true)) ||
      '';

    return {
      receiptCommand,
      receiptCommandForStaff,
    };
  };

  /**
   * 取引のポイントをつける
   */
  @BackendService.WithTx
  @BackendService.WithIds(['transactionId'])
  public async processPoints({
    disableGivePoint,
    customerApiService,
  }: {
    disableGivePoint?: boolean;
    customerApiService: BackendApiCustomerService;
  }) {
    const transactionInfo = await this.core.existingObj;

    //ポイントを記録する
    let pointSum: Transaction['point_amount'] = 0;
    let total_point_amount: Customer['owned_point'] | null = null;
    const point_discount_price = transactionInfo.point_discount_price;
    const thisCustomer = customerApiService;

    if (!disableGivePoint) {
      const pointInfo = await thisCustomer.core.addPointInTransaction({
        totalPrice: transactionInfo.total_price,
        paymentMethod: transactionInfo.payment_method,
        transactionKind: transactionInfo.transaction_kind,
        transactionId: transactionInfo.id,
      });

      pointSum = pointInfo.pointAmount;
      total_point_amount = pointInfo.totalPointAmount;
    }

    //消費する感じだったら
    if (point_discount_price) {
      const pointDiscountInfo = await thisCustomer.core.usePointInTransaction({
        amount: -1 * point_discount_price,
        transactionId: transactionInfo.id,
      });

      total_point_amount = pointDiscountInfo.pointHistory.result_point_amount;
    }

    const updateRes = await this.db.transaction.update({
      where: {
        id: transactionInfo.id,
      },
      data: {
        point_amount: pointSum,
        total_point_amount,
        point_discount_price,
      },
    });

    return updateRes;
  }

  /**
   * 支払い処理
   */
  @BackendService.WithTx
  @BackendService.WithIds(['transactionId'])
  public async processPayment({
    registerApiService,
    cashReceivedPrice,
    cashChangePrice,
  }: {
    registerApiService: BackendApiRegisterService;
    cashReceivedPrice?: number;
    cashChangePrice?: number;
  }): Promise<{
    paying: boolean;
  }> {
    const transactionInfo = await this.core.existingObj;
    const thisRegisterInfo = await registerApiService.core.existingObj;
    let paying = false;

    //予約前金かどうか
    const isReservationDeposit = transactionInfo.transaction_carts?.some(
      (e) => e.reservation_reception_product_id_for_deposit,
    );

    if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
      //現金だった場合、店が保有している現金を変動させる
      const cashChangePrice =
        transactionInfo.transaction_kind == TransactionKind.sell
          ? transactionInfo.total_price
          : -1 * transactionInfo.total_price;

      //予約前金の場合も考慮する
      const source_kind: Register_Cash_History['source_kind'] =
        isReservationDeposit
          ? RegisterCashHistorySourceKind.reservation_deposit
          : transactionInfo.transaction_kind == TransactionKind.sell
          ? RegisterCashHistorySourceKind.transaction_sell
          : RegisterCashHistorySourceKind.transaction_buy;

      await registerApiService.core.changeCash({
        changePrice: cashChangePrice,
        source_kind,
        source_id: transactionInfo.id,
        description: `取引${transactionInfo.id} でレジ${registerApiService.ids.registerId} の現金を変動させました`,
      });
    } else if (
      transactionInfo.transaction_kind == TransactionKind.buy &&
      transactionInfo.payment_method == TransactionPaymentMethod.bank &&
      cashReceivedPrice
    ) {
      //買取で銀行振込で一部現金だった場合、先に現金分だけ変動させておく
      const cashChangePrice = -1 * cashReceivedPrice;

      await registerApiService.core.changeCash({
        changePrice: cashChangePrice,
        source_kind: RegisterCashHistorySourceKind.transaction_buy,
        source_id: transactionInfo.id,
        description: `取引${transactionInfo.id} でレジ${registerApiService.ids.registerId} の現金を変動させました（銀行振込支払いの、一部現金）`,
      });
    }

    //Squareは販売の時しか使わない
    if (transactionInfo.transaction_kind == TransactionKind.sell) {
      //現金などのオリジナル決済システムだったらすぐにPaymentを作成する
      if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.pay,
                service: PaymentService.original,
                method: 'CASH',
                total_amount: transactionInfo.total_price,
                cash__recieved_price: Number(cashReceivedPrice || 0),
                cash__change_price: Number(cashChangePrice || 0),
              },
            },
          },
        });
      } else if (
        transactionInfo.payment_method == TransactionPaymentMethod.bank
      ) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.pay,
                service: PaymentService.original, //square経由ではないため
                method: 'BANK', //買取だとCASHのみ
                total_amount: transactionInfo.total_price, //現金が減るため、負の数

                //[TODO] 振込先をここで格納できるようにする
              },
            },
          },
        });
      }
      //以下は外部サービス
      else if (
        (
          [
            TransactionPaymentMethod.square,
            TransactionPaymentMethod.felica,
            TransactionPaymentMethod.paypay,
          ] as TransactionPaymentMethod[]
        ).includes(transactionInfo.payment_method!)
      ) {
        //決済サービスを確定していく
        //Square端末と連携されていたらその処理を行う
        if (
          this.resources.store!.square_location_id &&
          thisRegisterInfo?.square_device_id
        ) {
          //square enabledになっていない場合エラーを吐く
          if (!BackendApiSquareService.config.enabled)
            throw new ApiError({
              status: 400,
              messageText: 'この環境ではSquareを利用することができません',
            });

          const squareService = new BackendApiSquareService(this.API);

          squareService.config.locationId =
            this.resources.store!.square_location_id || '';

          //決済処理を行うためにトークンを与える
          await squareService.grantToken(); //一旦法人情報はいれなくて済む様にする

          //デバイスIDを入れる squareのRUN_MODEがsandboxだった場合、仮値
          squareService.config.deviceId =
            thisRegisterInfo.square_device_id ?? ''; //スクエアのデバイスID

          const createCheckoutResult =
            await squareService.createTerminalCheckout({
              transaction_id: transactionInfo.id,
              payment_method: transactionInfo.payment_method,
              total_amount: transactionInfo.total_price,
            });

          console.log(`端末チェックアウトは`, createCheckoutResult);

          //支払いが作成できなかった時は、普通にロールバックする
          if (!createCheckoutResult?.checkout?.id)
            throw new ApiError({
              status: 500,
              messageText: `Square端末に支払いリクエストを送信できませんでした`,
            });

          //このIDを格納しつつ、payingにする
          await this.db.transaction.update({
            where: {
              id: transactionInfo.id,
            },
            data: {
              terminal_checkout_id: createCheckoutResult?.checkout?.id,
              status: TransactionStatus.paying,
            },
          });

          //支払い待機中だったら、とりあえずキャンセルタスクを5分後に投げる
          const task = new TaskManager({
            targetWorker: 'transaction',
            kind: 'paymentTimeout',
          });

          await task.publish({
            body: [
              {
                transaction_id: transactionInfo.id,
              },
            ],
            service: this,
            fromSystem: true, //タスクを作成しない
            processDescription: `非同期取引を自動キャンセルします`,
          });

          paying = true;

          //何もサービスに結びついていない場合は、オリジナル決済として処理する
        } else {
          //POSと連携させない設定（オリジナル決済）だったら
          await this.db.transaction.update({
            where: {
              id: transactionInfo.id,
            },
            data: {
              status: TransactionStatus.completed,
              payment: {
                create: {
                  mode: PaymentMode.pay,
                  service: PaymentService.original,
                  method: transactionInfo.payment_method?.toLocaleUpperCase(),
                  total_amount: transactionInfo.total_price,
                  //カード詳細などはとりあえず入力しなくて大丈夫
                },
              },
            },
          });
        }
      } else {
        throw new ApiError({
          status: 500,
          messageText: 'このお支払い方法は利用できません',
        });
      }
    } else {
      //買取モードだったら、直接レコードを作る

      //支払い方法
      if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.pay,
                service: PaymentService.original, //square経由ではないため
                method: 'CASH',
                total_amount: -1 * transactionInfo.total_price, //現金が減るため、負の数
              },
            },
          },
        });
      } else if (
        transactionInfo.payment_method == TransactionPaymentMethod.bank
      ) {
        //一部現金があったら現金として記録する
        if (cashReceivedPrice) {
          await this.db.transaction.update({
            where: {
              id: transactionInfo.id,
            },
            data: {
              status: TransactionStatus.completed,
              payment: {
                create: {
                  mode: PaymentMode.pay,
                  service: PaymentService.original,
                  method: 'BANK/CASH',
                  total_amount: -1 * transactionInfo.total_price, //現金が減るため、負の数
                  cash__recieved_price: cashReceivedPrice,
                  //[TODO] 振込先をここで格納できるようにする
                },
              },
            },
          });
        } else {
          await this.db.transaction.update({
            where: {
              id: transactionInfo.id,
            },
            data: {
              status: TransactionStatus.completed,
              payment: {
                create: {
                  mode: PaymentMode.pay,
                  service: PaymentService.original, //square経由ではないため
                  method: 'BANK', //買取だとCASHのみ
                  total_amount: -1 * transactionInfo.total_price, //現金が減るため、負の数

                  //[TODO] 振込先をここで格納できるようにする
                },
              },
            },
          });
        }
      } else {
        throw new ApiError({
          status: 500,
          messageText: 'このお支払い方法は利用できません',
        });
      }
    }

    return {
      paying,
    };
  }

  /**
   * 返金処理
   */
  @BackendService.WithIds(['transactionId'])
  @BackendService.WithTx
  @BackendService.WithResources(['store'])
  public async processRefund({
    registerApiService,
    prevTransactionService,
  }: {
    registerApiService: BackendApiRegisterService;
    prevTransactionService: BackendApiTransactionService;
  }) {
    const transactionInfo = await this.core.existingObj;
    const prevTransactionInfo = await prevTransactionService.core.existingObj;
    if (!prevTransactionInfo.payment)
      throw new ApiError({
        status: 500,
        messageText: '前の取引に支払い情報がありません',
      });

    const result = {
      returnPrice: 0,
    };
    result.returnPrice = transactionInfo.total_price;

    const isReservationDeposit = transactionInfo.transaction_carts?.some(
      (e) => e.reservation_reception_product_id_for_deposit,
    );

    if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
      //現金だった場合、店が保有している現金を変動させる
      const cashChangePrice =
        transactionInfo.transaction_kind == TransactionKind.sell
          ? -1 * result.returnPrice
          : result.returnPrice;

      const source_kind: Register_Cash_History['source_kind'] =
        isReservationDeposit
          ? RegisterCashHistorySourceKind.reservation_deposit_return
          : transactionInfo.transaction_kind == TransactionKind.sell
          ? RegisterCashHistorySourceKind.transaction_sell_return
          : RegisterCashHistorySourceKind.transaction_buy_return;

      await registerApiService.core.changeCash({
        changePrice: cashChangePrice,
        source_kind,
        source_id: transactionInfo.id,
        description: `前の取引${transactionInfo.id} の返品処理においてできた新しい取引${transactionInfo.id} でレジ${registerApiService.ids.registerId} の現金を変動させました`,
      });
    }

    //Squareは販売の時しか使わない
    if (transactionInfo.transaction_kind == TransactionKind.sell) {
      //現金などのオリジナル決済システムだったらすぐにPaymentを作成する
      if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.refund,
                service: PaymentService.original,
                method: 'CASH',
                total_amount: -1 * result.returnPrice,
              },
            },
          },
        });
      } else if (
        transactionInfo.payment_method == TransactionPaymentMethod.bank
      ) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.refund,
                service: PaymentService.original, //square経由ではないため
                method: 'BANK', //買取だとCASHのみ
                total_amount: -1 * result.returnPrice, //現金が減るため、負の数

                //[TODO] 振込先をここで格納できるようにする
              },
            },
          },
        });
      }

      //以下は外部サービス
      else if (
        (
          [
            TransactionPaymentMethod.square,
            TransactionPaymentMethod.felica,
            TransactionPaymentMethod.paypay,
          ] as TransactionPaymentMethod[]
        ).includes(transactionInfo.payment_method!)
      ) {
        if (
          this.resources.store!.square_location_id &&
          prevTransactionInfo.payment.service == PaymentService.square
        ) {
          if (!BackendApiSquareService.config.enabled)
            throw new ApiError({
              status: 400,
              messageText: 'この環境ではSquareを利用することができません',
            });

          const squareService = new BackendApiSquareService(this.API);

          //決済処理を行うためにトークンを与える
          await squareService.grantToken(); //一旦法人情報はいれなくて済む様にする

          const createRefundResult = await squareService.createPaymentRefund({
            transaction_id: transactionInfo.id,
            paymentId: prevTransactionInfo.payment?.source_id || '',
            refund_amount: result.returnPrice,
          });

          //支払いが作成できなかった時は、普通にロールバックする
          if (!createRefundResult?.refund?.id)
            throw new ApiError({
              status: 500,
              messageText: `返金処理がうまくいきませんでした`,
            });

          //つくれたら、返金完了を待機する
          await this.core.waitForPayment();
        } else {
          //POSと連携させない設定（オリジナル決済）だったら
          await this.db.transaction.update({
            where: {
              id: transactionInfo.id,
            },
            data: {
              status: TransactionStatus.completed,
              payment: {
                create: {
                  mode: PaymentMode.refund,
                  service: PaymentService.original,
                  method: transactionInfo.payment_method?.toLocaleUpperCase(),
                  total_amount: -1 * result.returnPrice,
                  //カード詳細などはとりあえず入力しなくて大丈夫
                },
              },
            },
          });
        }
      } else {
        throw new ApiError({
          status: 500,
          messageText: 'このお支払い方法は利用できません',
        });
      }
    } else {
      //買取モードだったら、直接レコードを作る

      //支払い方法
      if (transactionInfo.payment_method == TransactionPaymentMethod.cash) {
        await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.refund,
                service: PaymentService.original,
                method: 'CASH',
                total_amount: result.returnPrice, //お客さんからもらうため
              },
            },
          },
        });
      } else if (
        transactionInfo.payment_method == TransactionPaymentMethod.bank
      ) {
        const updateRes = await this.db.transaction.update({
          where: {
            id: transactionInfo.id,
          },
          data: {
            status: TransactionStatus.completed,
            payment: {
              create: {
                mode: PaymentMode.refund,
                service: PaymentService.original, //square経由ではないため
                method: 'BANK',
                total_amount: result.returnPrice, //現金が減るため、負の数
              },
            },
          },
        });
      } else {
        throw new ApiError({
          status: 500,
          messageText: 'このお支払い方法は利用できません',
        });
      }
    }

    return result;
  }

  /**
   * 予約受付取引をサクっと返品する関数
   * 現金のみであるため、基本的に同期的にサクっと返品できる
   */
  @BackendService.WithIds(['storeId'])
  public async returnDepositTransaction({
    reservationReceptionProductIdForCancel,
    registerApiService,
    dontRefund,
    dontCancel,
  }: {
    reservationReceptionProductIdForCancel: Reservation_Reception_Product['id'];
    registerApiService: BackendApiRegisterService;
    dontRefund?: boolean;
    dontCancel?: boolean; //trueにすると、予約の取り消しにはならない（受け取り済みの予約の返品の場合など）
  }): Promise<{
    id: Transaction['id'];
    returnPrice: number;
  }> {
    const staff_account_id = this.API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //前の取引情報を取得する
    //現在の取引の情報を取得する
    const prevTransactionInfo = await this.db.transaction.findFirst({
      where: {
        store_id: this.ids.storeId,
        status: TransactionStatus.completed, //支払いや在庫調整が終わってないといけない
        transaction_carts: {
          some: {
            reservation_reception_product_id_for_deposit:
              reservationReceptionProductIdForCancel,
          },
        },
      },
      include: {
        transaction_carts: {
          include: {
            product: {
              include: {
                item: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!prevTransactionInfo) throw new ApiError('notExist');

    this.setIds({
      transactionId: prevTransactionInfo.id,
    });

    const {
      customer_id,
      transaction_kind,
      payment_method,
      tax_kind,
      subtotal_price,
      hidden,
      tax,
      id: prevTransactionId,
    } = prevTransactionInfo;

    let { total_price, total_reservation_price } = prevTransactionInfo;

    this.core.targetObject = prevTransactionInfo;

    let insertId: any = 0;
    let returnPrice: number = 0;

    const customerQuery: Partial<Prisma.TransactionCreateInput> = {};

    if (customer_id) {
      customerQuery.customer = {
        connect: {
          id: customer_id,
        },
      };
    }

    //カートのチェック、および生成
    const cartCheckRes = await this.checkReturnCart({
      reservationReceptionProductIdForCancel,
      dontCancel,
    });

    total_price = cartCheckRes.total_price;
    total_reservation_price = cartCheckRes.total_reservation_price;

    try {
      //Transactionは先に作ってしまう
      const createTransactionResult = await this.db.transaction.create({
        data: {
          staff_account: {
            connect: {
              id: Number(staff_account_id),
            },
          },
          store: {
            connect: {
              id: this.ids.storeId,
            },
          },
          ...customerQuery, //会員かもしくは会員登録をした場合はこのクエリを入れる
          transaction_kind,
          is_return: true,
          hidden,
          total_price,
          subtotal_price,
          tax,
          payment_method,
          tax_kind,
          original_transaction: {
            //前の取引を紐づける
            connect: {
              id: prevTransactionId,
            },
          },
          total_reservation_price,
          status: TransactionStatus.draft, //一旦下書きとして作る
          transaction_carts: cartCheckRes.cartsInput,
        },
        include: {
          transaction_carts: {
            include: {
              product: {
                include: {
                  condition_option: true,
                  item: true,
                },
              },
            },
          },
        },
      });
      insertId = createTransactionResult?.id;
      const returnTransactionService = new BackendApiTransactionService(
        this.API,
        insertId,
      );
      returnTransactionService.core.targetObject = createTransactionResult;

      const txResult = await this.safeTransaction(
        async (tx) => {
          /**
           * 在庫等のロールバック（キャンセルをする時だけ）
           */
          if (!dontCancel) {
            await this.core.return({
              reservationReceptionProductIdForCancel,
            });
          }

          if (!dontRefund) {
            const refundRes = await returnTransactionService.processRefund({
              registerApiService,
              prevTransactionService: this,
            });

            returnPrice = refundRes.returnPrice;
          }

          //完了日時を入れる
          await tx.transaction.update({
            where: {
              id: createTransactionResult.id,
            },
            data: {
              finished_at: new Date(),
              register_id: registerApiService.ids.registerId,
            },
          });
        },
        {
          maxWait: 5 * 1000, // default: 2000
          timeout: 60 * 1000 * 3, // 3分
        },
      );
    } catch (e: any) {
      console.log(e);

      await this.db.transaction.update({
        where: {
          id: insertId,
        },
        data: {
          status: TransactionStatus.draft, //下書きに戻す
          original_transaction_id: null,
        },
      });

      throw e;
    }

    return {
      id: insertId,
      returnPrice,
    };
  }

  /**
   * 返品のカートチェック
   */
  @BackendService.WithIds(['transactionId'])
  public async checkReturnCart({
    reservationReceptionProductIdForCancel,
    dontCancel,
  }: {
    reservationReceptionProductIdForCancel:
      | Reservation_Reception_Product['id']
      | undefined; //取り消す予約ID
    dontCancel?: boolean; //trueにすると、予約の取り消しにはならない（受け取り済みの予約の返品の場合など）
  }): Promise<{
    total_price: number; //返品取引を何円にするのかのやつ（主に前金取り消し用）
    total_reservation_price: number; //返品取引を何円にするのかのやつ（主に前金取り消し用）
    cartsInput: Prisma.Transaction_CartCreateNestedManyWithoutTransactionInput;
    toReturnDepositTransactions: Array<{
      reservation_reception_id: Reservation_Reception_Product['id'];
    }>;
  }> {
    const transactionInfo = await this.core.existingObj;
    if (!transactionInfo.transaction_carts)
      throw new ApiError({
        status: 500,
        messageText: 'カート情報が見つかりません',
      });

    const result: Awaited<ReturnType<typeof this.checkReturnCart>> = {
      total_price: 0,
      total_reservation_price: 0,
      cartsInput: {
        create: [],
      },
      toReturnDepositTransactions: [],
    };

    const reservationDepositCart = transactionInfo.transaction_carts.find(
      (e) =>
        e.reservation_reception_product_id_for_deposit ===
        reservationReceptionProductIdForCancel,
    );

    if (reservationReceptionProductIdForCancel) {
      if (!reservationDepositCart) {
        throw new ApiError({
          status: 404,
          messageText: 'この取引に結びついている、この受付が見つかりません',
        });
      }

      //受付情報を取得する
      const reservationReceptionProduct =
        await this.db.reservation_Reception_Product.findUnique({
          where: {
            id: reservationDepositCart.reservation_reception_product_id_for_deposit!,
            status: dontCancel
              ? ReservationReceptionProductStatus.RECEIVED
              : ReservationReceptionProductStatus.DEPOSITED,
          },
        });

      if (!reservationReceptionProduct) {
        throw new ApiError({
          status: 404,
          messageText: 'この取引に結びついている、この受付が見つかりません',
        });
      }

      //返品のカートを作成する
      result.cartsInput.create = [
        {
          product_id: reservationDepositCart.product_id,
          item_count: reservationDepositCart.item_count,
          unit_price: reservationDepositCart.total_unit_price!,
          wholesale_total_price: reservationDepositCart.wholesale_total_price,
          reservation_price: reservationDepositCart.reservation_price,
          reservation_reception_product_id_for_deposit:
            reservationDepositCart.reservation_reception_product_id_for_deposit,
        },
      ];

      result.total_price =
        reservationDepositCart.reservation_price! *
        reservationDepositCart.item_count;
      result.total_reservation_price =
        reservationDepositCart.reservation_price! *
        reservationDepositCart.item_count;
    } else {
      //予約取り消しを明示されていないのに予約受付取引として登録されていた場合エラー
      if (reservationDepositCart) {
        throw new ApiError({
          status: 400,
          messageText:
            '予約取り消しを明示されていないのに予約受付取引として登録されています',
        });
      }

      //受け取り済みの在庫が含まれている取引だった場合、それらをリストアップする
      const toReturnReceiveCarts = transactionInfo.transaction_carts.filter(
        (e) => e.reservation_reception_product_id_for_receive,
      );

      if (toReturnReceiveCarts.length > 0) {
        result.toReturnDepositTransactions = toReturnReceiveCarts.map((e) => ({
          reservation_reception_id:
            e.reservation_reception_product_id_for_receive!,
        }));
      }

      //それ以外の場合、一旦普通に全てカートに詰める
      result.cartsInput.create = transactionInfo.transaction_carts.map((e) => ({
        product: {
          connect: {
            id: e.product_id,
          },
        },
        item_count: e.item_count,
        unit_price: e.total_unit_price!,
        reservation_price: e.reservation_price,
        wholesale_total_price: e.wholesale_total_price,
        sale_discount_price: e.sale_discount_price,
        discount_price: e.discount_price,
        consignment_sale_unit_price: e.consignment_sale_unit_price,
        consignment_commission_unit_price: e.consignment_commission_unit_price,
        ...(e.reservation_reception_product_id_for_receive
          ? {
              reservation_reception_product_for_receive: {
                connect: {
                  id: e.reservation_reception_product_id_for_receive,
                },
              },
            }
          : null),
      }));
    }

    return result;
  }

  /**
   * カートが適切かどうかを判断する
   * トランザクションには入れない処理
   */
  @BackendService.WithIds(['storeId'])
  public async checkCart({
    carts,
    setDeals,
    transactionKind,
    paymentMethod,
    customerApiService,
    fromTablet,
  }: {
    carts: TransactionService.CartInput;
    setDeals:
      | Array<{
          set_deal_id: Set_Deal['id'];
          apply_count: Transaction_Set_Deal['apply_count'];
          total_discount_price: Transaction_Set_Deal['total_discount_price'];
        }>
      | undefined;
    transactionKind: Transaction['transaction_kind'];
    paymentMethod?: Transaction['payment_method'];
    customerApiService: BackendApiCustomerService;
    fromTablet?: boolean;
  }): Promise<{
    set_deal_discount_price: Transaction['set_deal_discount_price'];
    total_reservation_price: Transaction['total_reservation_price'];
    total_consignment_sale_price: Transaction['total_consignment_sale_price'];
    allProductInfo: Array<
      Product & {
        item: Item;
      }
    >;
    cartsInput: Prisma.Transaction_CartCreateNestedManyWithoutTransactionInput;
    setDealInput: Prisma.Transaction_Set_DealCreateNestedManyWithoutTransactionInput;
    reservationReceiveProducts: Array<Reservation_Reception_Product>;
  }> {
    const result: Awaited<ReturnType<typeof this.checkCart>> = {
      set_deal_discount_price: 0,
      total_reservation_price: 0,
      total_consignment_sale_price: 0,
      allProductInfo: [],
      cartsInput: {
        create: [],
      },
      setDealInput: {
        create: [],
      },
      reservationReceiveProducts: [],
    };

    //セット販売の件
    if (setDeals?.length) {
      result.set_deal_discount_price =
        await this.core.getTotalSetDealDiscountPrice(carts, setDeals);

      result.setDealInput.create = setDeals;
    }

    //予約受付IDを指定しているのに顧客情報がなかったらエラー
    const includesReservationDeposit = carts.some(
      (e) => e.reservation_reception_product_id_for_deposit,
    );
    const reservationDepositProductIds = carts
      .filter((e) => e.reservation_reception_product_id_for_deposit)
      .map((e) => e.reservation_reception_product_id_for_deposit!);
    const includesReservationReceive = carts.some(
      (e) => e.reservation_reception_product_id_for_receive,
    );

    if (
      includesReservationDeposit &&
      !(await customerApiService.core.existingObj)
    ) {
      throw new ApiError({
        status: 500,
        messageText: '予約の受付には顧客情報が必要です',
      });
    }

    //必要な情報を取得しておく
    const [
      allProductInfo,
      reservationReceptionInfo,
      tabletAllowedGenresCategories,
    ] = await Promise.all([
      carts
        ? await this.db.product.findMany({
            where: {
              store_id: Number(this.ids.storeId),
              id: {
                in: carts.map((e) => e.product_id),
              },
            },
            include: {
              item: true,
              ...(transactionKind == TransactionKind.sell
                ? {
                    reservations: {
                      include: {
                        //受け取り取引と明示されている時は受付まで取得
                        receptions: true,
                      },
                    },
                    consignment_client: {
                      select: {
                        enabled: true,
                        commission_cash_price: true,
                        commission_card_price: true,
                      },
                    },
                  }
                : null),
            },
          })
        : [],
      includesReservationDeposit
        ? await this.db.reservation_Reception.findFirst({
            where: {
              customer_id: customerApiService.ids.customerId,
              products: {
                some: {},
                every: {
                  id: {
                    in: reservationDepositProductIds,
                  },
                  reservation: {
                    status: ReservationStatus.OPEN, //予約が受付中
                  },
                  status: ReservationReceptionProductStatus.CREATED, //受付可能状態
                },
              },
            },
            include: {
              products: {
                include: {
                  reservation: {
                    include: {
                      receptions: true,
                    },
                  },
                },
              },
            },
          })
        : undefined,
      fromTablet
        ? await this.db.tablet_Allowed_Genre_Category.findMany({
            where: {
              store_id: this.ids.storeId,
            },
          })
        : undefined,
    ]);

    //cartsの中身を見ていく

    //予約受付があった場合、予約受付で定義されているのにカートで指定されてなかったらエラー
    if (includesReservationDeposit) {
      if (!reservationReceptionInfo) {
        throw new ApiError({
          status: 404,
          messageText: '予約受付が見つかりません',
        });
      }

      const reservationReceptionProducts =
        reservationReceptionInfo.products.map((e) => e.reservation.product_id);

      if (
        !reservationReceptionProducts.every((e) =>
          carts.find((cartP) => cartP.product_id == e),
        )
      ) {
        throw new ApiError({
          status: 400,
          messageText:
            '予約受付で定義されているのにカートで指定されてない商品が含まれています',
        });
      }
    }

    //cartsInputを作っていく
    result.cartsInput.create = await Promise.all(
      carts.map(
        async (
          {
            product_id,
            item_count,
            unit_price,
            discount_price,
            sale_id,
            sale_discount_price,
            reservation_price,
            reservation_reception_product_id_for_deposit,
            reservation_reception_product_id_for_receive,
          },
          i,
        ) => {
          const thisProductInfo = allProductInfo.find(
            (e) => e.id == product_id,
          );

          if (!thisProductInfo)
            throw new ApiError({
              status: 400,
              messageText: '指定できない商品が含まれています',
            });

          //買取なのに割引になってたらエラー
          if (transactionKind == TransactionKind.buy && discount_price < 0) {
            throw new ApiError({
              status: 400,
              messageText: '買取では割引は指定できません',
            });
          }
          //販売なのに割増になってたらエラー
          else if (
            transactionKind == TransactionKind.sell &&
            discount_price > 0
          ) {
            throw new ApiError({
              status: 400,
              messageText: '販売では割増は指定できません',
            });
          }

          //タブレットからの注文だった場合、上限数などを確認
          if (fromTablet && tabletAllowedGenresCategories) {
            //ここは関数化するかもしれない
            const allowedConditionOptions =
              tabletAllowedGenresCategories.filter(
                (def) =>
                  def.item_category_id === thisProductInfo.item.category_id &&
                  def.item_genre_id === thisProductInfo.item.genre_id,
              );

            const allowedConditionOption = allowedConditionOptions.find(
              (def) =>
                (!def.condition_option_id ||
                  thisProductInfo.condition_option_id ===
                    def.condition_option_id) &&
                (!def.specialty_id ||
                  thisProductInfo.specialty_id === def.specialty_id) &&
                (!def.no_specialty || thisProductInfo.specialty_id === null),
            );

            if (!allowedConditionOption) {
              throw new ApiError({
                status: 400,
                messageText:
                  'タブレットでの注文が許可されていない商品が含まれています',
              });
            }

            //注文可能数を確認
            if (
              allowedConditionOption.limit_count &&
              item_count > allowedConditionOption.limit_count
            ) {
              throw new ApiError({
                status: 400,
                messageText: `${thisProductInfo.display_name}の在庫タブレットからの注文可能数は${allowedConditionOption.limit_count}枚までです`,
              });
            }
          }

          let consignment_sale_unit_price = 0;
          let consignment_commission_unit_price = 0;

          //予約受付があった場合、妥当性を調べていく
          if (reservationReceptionInfo) {
            //このカートの予約情報を取得
            const thisReservationReceptionProduct =
              reservationReceptionInfo.products.find(
                (e) => e.reservation.product_id == product_id,
              );

            if (!thisReservationReceptionProduct) {
              throw new ApiError({
                status: 400,
                messageText: '予約受付で扱っていない在庫が含まれています',
              });
            }

            //前金の指定が正しいか確認
            //unit_priceが0じゃないといけない
            if (unit_price != 0) {
              throw new ApiError({
                status: 400,
                messageText: '予約受付の時、unit_priceは0にしてください',
              });
            }

            //前金の分、reservation_priceが入ってないといけない
            if (
              reservation_price !=
              thisReservationReceptionProduct.reservation.deposit_price
            ) {
              throw new ApiError({
                status: 400,
                messageText:
                  '予約受付の時、reservation_priceは前金の金額にしてください',
              });
            }

            //個数的に大丈夫か確認
            const reservationService = new BackendApiReservationService(
              this.API,
              thisReservationReceptionProduct.reservation.id,
            );
            reservationService.core.targetObject =
              thisReservationReceptionProduct.reservation;

            await reservationService.core.getAvailableMargin({
              customerId: customerApiService.ids.customerId,
              itemCount: item_count,
            });

            result.total_reservation_price +=
              thisReservationReceptionProduct.reservation.deposit_price *
              item_count;
          } else if (transactionKind == TransactionKind.sell) {
            //受付じゃない時、
            const openReservations = thisProductInfo.reservations.filter(
              (e) => e.status == ReservationStatus.OPEN,
            );

            const closedReservations = thisProductInfo.reservations.filter(
              (e) => e.status == ReservationStatus.CLOSED,
            );

            const thisReceiveReservation = closedReservations.find((e) =>
              //@ts-expect-error because of
              (e.receptions as Reservation_Reception_Product[]).find(
                (r) => r.id == reservation_reception_product_id_for_receive,
              ),
            );

            //受け取りじゃないのに、受付中のものが含まれていたらエラー
            if (!thisReceiveReservation && openReservations.length > 0) {
              throw new ApiError({
                status: 400,
                messageText: '取引に予約受付中のものが含まれています',
              });
            }

            //受け取りモードだった時
            if (includesReservationReceive) {
              //受け取る対象商品か判断
              if (closedReservations.length > 0) {
                const receptionProducts =
                  //@ts-expect-error because of
                  (thisReceiveReservation?.receptions ||
                    []) as Reservation_Reception_Product[];

                //このお客さんが対象かどうかを判断
                const customerReservation = receptionProducts.find(
                  (e) =>
                    e.customer_id == customerApiService.ids.customerId &&
                    e.status == ReservationReceptionProductStatus.DEPOSITED,
                );

                //なかったらエラー
                if (!thisReceiveReservation || !customerReservation) {
                  throw new ApiError({
                    status: 400,
                    messageText: `この予約在庫はこの顧客によってすでに受け取り済みか、受付していないものです`,
                  });
                }

                //受け取り個数が適切か見る
                if (customerReservation.item_count != item_count) {
                  throw new ApiError({
                    status: 400,
                    messageText: `この予約在庫は受付した個数と異なります`,
                  });
                }

                //unit_priceが適切かみる
                // if (
                //   unit_price !=
                //   thisReceiveReservation.deposit_price +
                //     thisReceiveReservation.remaining_price
                // ) {
                //   throw new ApiError({
                //     status: 400,
                //     messageText: `予約在庫の金額の指定が不適切です`,
                //   });
                // }

                //reservation_priceが適切か見る
                if (
                  reservation_price !=
                  -1 * thisReceiveReservation.deposit_price
                ) {
                  throw new ApiError({
                    status: 500,
                    messageText: `reservation_priceの指定が不適切です`,
                  });
                }

                //reservation_priceを足す
                result.total_reservation_price +=
                  reservation_price * item_count;

                //productsに追加
                result.reservationReceiveProducts.push(customerReservation);
              }
            } else {
              //そうでもない時、受付終了予約だったら数が大丈夫そうか確認
              if (closedReservations.length > 0) {
                //受け取られていない個数を確認
                const receptions = closedReservations.flatMap(
                  //@ts-expect-error because of
                  (e) => e.receptions,
                ) as Reservation_Reception_Product[];

                const unreceivedCount = receptions
                  .filter(
                    (e) =>
                      e.status == ReservationReceptionProductStatus.DEPOSITED,
                  )
                  .reduce((acc, e) => acc + e.item_count, 0);

                //現在の在庫数から予約分をひいて、そこから販売したい数を引いて0を下回らなければOK
                if (
                  thisProductInfo.stock_number - unreceivedCount - item_count <
                  0
                ) {
                  throw new ApiError({
                    status: 400,
                    messageText: '予約機能で確保している在庫です',
                  });
                }
              }
            }
          }

          //委託商品だったら
          if (thisProductInfo.consignment_client_id) {
            if (transactionKind == TransactionKind.sell) {
              //無効な委託者だったらエラー
              if (!thisProductInfo.consignment_client!.enabled)
                throw new ApiError({
                  status: 400,
                  messageText: `
在庫: ${thisProductInfo.display_name} は無効の委託者による委託商品です
              `,
                });

              //セールや個別割引が指定されていたらエラー
              if (sale_id || discount_price)
                throw new ApiError({
                  status: 400,
                  messageText: `委託販売ではセールや個別割引は指定できません`,
                });

              const clientInfo = thisProductInfo.consignment_client!;

              //有効な委託で、支払い方法が指定されていたら、委託手数料を求める
              if (paymentMethod) {
                let commissionPercent = 0;
                switch (paymentMethod) {
                  case TransactionPaymentMethod.cash:
                  case TransactionPaymentMethod.bank: {
                    commissionPercent = clientInfo.commission_cash_price;
                    break;
                  }
                  case TransactionPaymentMethod.square:
                  case TransactionPaymentMethod.paypay:
                  case TransactionPaymentMethod.felica: {
                    commissionPercent = clientInfo.commission_card_price;
                    break;
                  }
                  default:
                    throw new ApiError({
                      status: 400,
                      messageText: `委託販売では対応していない支払い方法です`,
                    });
                }

                consignment_commission_unit_price = Math.round(
                  (unit_price * commissionPercent) / 100,
                );

                consignment_sale_unit_price = unit_price;
                result.total_consignment_sale_price +=
                  consignment_sale_unit_price * item_count;
              }
            } else
              throw new ApiError({
                status: 400,
                messageText: `委託販売では販売取引以外は指定できません`,
              });
          }

          return {
            order_number: i + 1,
            product: {
              connect: {
                id: product_id,
              },
            },
            item_count,
            unit_price,
            discount_price,
            ...(sale_id && {
              sale: {
                connect: {
                  id: sale_id,
                },
              },
            }),
            sale_discount_price,
            consignment_sale_unit_price,
            consignment_commission_unit_price,
            original_unit_price:
              transactionKind == TransactionKind.sell
                ? thisProductInfo.actual_sell_price
                : thisProductInfo.actual_buy_price,
            reservation_price,
            ...(reservation_reception_product_id_for_deposit
              ? {
                  reservation_reception_product_for_deposit: {
                    connect: {
                      id: reservation_reception_product_id_for_deposit,
                    },
                  },
                }
              : null),
            ...(reservation_reception_product_id_for_receive
              ? {
                  reservation_reception_product_for_receive: {
                    connect: {
                      id: reservation_reception_product_id_for_receive,
                    },
                  },
                }
              : null),
          };
        },
      ),
    );

    result.allProductInfo = allProductInfo;

    return result;
  }

  //取得できるTransactionのフィールドを定義（改善必要そう）
  public get listTransactionFields() {
    if (this.API.user?.id) {
      //認証済みだったらみっちり

      return {
        include: {
          staff_account: {
            select: {
              display_name: true,
            },
          },
          reception_staff_account: {
            select: {
              display_name: true,
            },
          },
          input_staff_account: {
            select: {
              display_name: true,
            },
          },
          register: {
            select: {
              display_name: true,
            },
          },
          customer: {
            select: {
              full_name: true,
              full_name_ruby: true,
            },
          },
          payment: {
            select: {
              id: true,
              mode: true,
              service: true,
              method: true,
              source_id: true,
              total_amount: true,
              card__card_brand: true,
              card__card_type: true,
              card__exp_month: true,
              card__exp_year: true,
              card__last_4: true,
              cash__recieved_price: true,
              cash__change_price: true,
              bank__checked: true,
            },
          },
          transaction_carts: {
            select: {
              product: {
                select: {
                  id: true,
                  display_name: true,
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
                      category: {
                        select: {
                          display_name: true,
                        },
                      },
                      genre: {
                        select: {
                          display_name: true,
                        },
                      },
                    },
                  },
                },
              },
              item_count: true,
              unit_price: true,
              discount_price: true,
              original_unit_price: true,
              sale_id: true,
              sale_discount_price: true,
              total_discount_price: true,
              total_unit_price: true,
              product_id: true,
              id: true,
              order_number: true,
              reservation_reception_product_id_for_deposit: true,
              reservation_reception_product_id_for_receive: true,
              consignment_sale_unit_price: true,
              consignment_commission_unit_price: true,
              reservation_price: true,
            },
          },
          transaction_customer_carts: {
            select: {
              product_id: true,
              item_count: true,
              unit_price: true,
              discount_price: true,
              id: true,
              original_item_count: true,
            },
          },
          set_deals: {
            select: {
              set_deal_id: true,
              total_discount_price: true,
              apply_count: true,
            },
          },
          return_transactions: {
            select: {
              id: true,
              staff_account: {
                select: {
                  display_name: true,
                },
              },
            },
          },
        },
      } as Prisma.TransactionFindManyArgs;
    } else {
      //認証済みじゃなかったら制限される

      return {
        select: {
          buy__is_assessed: true,
          reception_number: true,
          status: true,
          id: true,
        },
      } as Prisma.TransactionFindManyArgs;
    }
  }
}
