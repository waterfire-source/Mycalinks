import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma, TransactionStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';

//取引の作成
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: ['create_transaction_return'], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const {
      dontRefund,
      register_id, //一旦全品返品を規定にする　部分返品が必要な場合はその時に実装
      reservation_reception_product_id_for_cancel,
    } = API.body;

    //このレジを取得する
    //ログイン中のアカウントに結びついているレジを取得する
    const thisRegister = new BackendApiRegisterService(
      API,
      API.user!.register_id ?? register_id,
    );
    const thisRegisterInfo = await thisRegister.core.existingObj;

    const { store_id, transaction_id } = API.params;

    //基本的に部分返品は対応していないが、例外として予約前金取り消しの処理だけ、実質的に部分返品に対応していることになる（特例）
    if (reservation_reception_product_id_for_cancel) {
      const depositTransactionService = new BackendApiTransactionService(
        API,
        Number(transaction_id),
      );

      const returnRes =
        await depositTransactionService.returnDepositTransaction({
          reservationReceptionProductIdForCancel:
            reservation_reception_product_id_for_cancel,
          registerApiService: thisRegister,
          dontRefund,
        });

      //これで早期リターンしちゃう
      return API.status(201).response({ data: returnRes });
    }

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //現在の取引の情報を取得する
    const prevTransactionInfo = await API.db.transaction.findFirst({
      where: {
        id: Number(transaction_id || ''),
        store_id: Number(store_id || ''),
        status: TransactionStatus.completed, //支払いや在庫調整が終わってないといけない
        //返品取引が存在してはいけない
        return_transactions: {
          none: {},
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

    const {
      customer_id,
      transaction_kind,
      payment_method,
      tax_kind,
      subtotal_price,
      point_amount,
      discount_price,
      coupon_discount_price,
      point_discount_price,
      set_deal_discount_price,
      tax,
      id: prevTransactionId,
    } = prevTransactionInfo;

    let {
      total_price,
      total_reservation_price,
      total_consignment_sale_price,
      hidden,
    } = prevTransactionInfo;

    const prevTransactionService = new BackendApiTransactionService(
      API,
      prevTransactionId,
    );
    prevTransactionService.core.targetObject = prevTransactionInfo;

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
    const cartCheckRes = await prevTransactionService.checkReturnCart({
      reservationReceptionProductIdForCancel:
        reservation_reception_product_id_for_cancel,
    });

    if (reservation_reception_product_id_for_cancel) {
      total_price = cartCheckRes.total_price;
      total_reservation_price = cartCheckRes.total_reservation_price;
    }

    try {
      //Transactionは先に作ってしまう
      const createTransactionResult = await API.db.transaction.create({
        data: {
          staff_account: {
            connect: {
              id: Number(staff_account_id),
            },
          },
          store: {
            connect: {
              id: parseInt(store_id || ''),
            },
          },
          ...customerQuery, //会員かもしくは会員登録をした場合はこのクエリを入れる
          transaction_kind,
          is_return: true,
          hidden, //非表示取引の返品は非表示にする
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
          total_consignment_sale_price,
          point_amount,
          discount_price,
          coupon_discount_price,
          point_discount_price,
          set_deal_discount_price,
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
        API,
        insertId,
      );

      returnTransactionService.core.targetObject = createTransactionResult;

      const txResult = await API.transaction(
        async (tx) => {
          /**
           * 在庫等のロールバック
           */
          await prevTransactionService.core.return({
            reservationReceptionProductIdForCancel:
              reservation_reception_product_id_for_cancel,
          });

          const refundRes = await returnTransactionService.processRefund({
            registerApiService: thisRegister,
            prevTransactionService,
          });

          returnPrice = refundRes.returnPrice;

          //受付の方の取引もあった場合、それもキャンセル
          if (cartCheckRes.toReturnDepositTransactions.length > 0) {
            for (const thisToReturnDepositTransaction of cartCheckRes.toReturnDepositTransactions) {
              const depositTransactionService =
                new BackendApiTransactionService(API);

              const returnRes =
                await depositTransactionService.returnDepositTransaction({
                  reservationReceptionProductIdForCancel:
                    thisToReturnDepositTransaction.reservation_reception_id,
                  registerApiService: thisRegister,
                  dontCancel: true,
                });

              console.log(`予約受付取引も同時にキャンセルしました`, returnRes);

              returnPrice += returnRes.returnPrice;
            }
          }

          //完了日時を入れる
          await tx.transaction.update({
            where: {
              id: createTransactionResult.id,
            },
            data: {
              finished_at: new Date(),
              register_id: thisRegisterInfo.id,
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

      await API.db.transaction.update({
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

    return API.status(201).response({ data: { id: insertId, returnPrice } });
  },
);
