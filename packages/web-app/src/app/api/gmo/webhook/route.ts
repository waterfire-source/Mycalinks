import { BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiGmoService } from '@/api/backendApi/services/gmo/main';
import {
  Ec_Order_Payment,
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentService,
  EcPaymentStatus,
  PaymentMode,
} from '@prisma/client';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { TaskManager } from 'backend-core';

//Gmo用のwebhookエンドポイント
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [''], //認証しなくても使えるようにするため
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);
    const gmoService = new BackendApiGmoService(API);

    //webhookを検証する
    const { body, type } = gmoService.verifyWebhook<{
      accessId: Ec_Order_Payment['source_id'];
      event: 'CASH_PAID';
    }>();
    const { accessId, event } = body;

    console.log('webhookのボディは--------------\n', JSON.stringify(API.body));

    if (accessId && event === 'CASH_PAID') {
      gmoService.core.client.mode = type;
      switch (type) {
        case 'ec': {
          //このアクセスIDの支払いを取得する
          const payment = await API.db.ec_Order_Payment.findFirst({
            where: {
              source_id: accessId,
              service: EcPaymentService.GMO,
              status: EcPaymentStatus.PAYING,
              mode: PaymentMode.pay,
              order: {
                status: EcOrderStatus.UNPAID,
              },
            },
            include: {
              order: true,
            },
          });

          if (!payment) throw new ApiError('notExist');

          //オーダー情報取得
          let { gmoOrder, finished } =
            await gmoService.core.client.getOrder(accessId);

          //なかったらエラー
          if (!gmoOrder) throw new ApiError('notExist');

          if ('cashResult' in gmoOrder && !finished) {
            const cashResult = gmoOrder.cashResult;

            if (cashResult?.bankTransferPaymentInformation) {
              //入金額が支払金額よりも大きいかどうかを確認
              const depositAmount = Number(
                cashResult?.bankTransferPaymentInformation.depositAmount ?? 0,
              );
              const paymentAmount = Number(payment.total_amount);

              if (depositAmount >= paymentAmount) {
                finished = true;

                console.log(
                  `銀行振込 payment: ${payment.id} depositAmount: ${depositAmount} paymentAmount: ${paymentAmount}`,
                );
              } else {
                //入金額が足りなかった時にメールを送信する
                const taskManager = new TaskManager({
                  targetWorker: 'notification',
                  kind: 'sendEmail',
                });

                console.log(`
                  入金額が足りなかった時にメールを送信する
                  ecOrder: ${payment.order_id}
                  銀行振込 payment: ${payment.id} depositAmount: ${depositAmount} paymentAmount: ${paymentAmount}
                `);

                await taskManager.publish({
                  body: [
                    {
                      as: 'system',
                      to: 'ec-support@myca.co.jp',
                      title: '[Mycalinks Mall] お客様の入金が不足しています',
                      bodyText: `
ecOrder: ${payment.order_id}
銀行振込 payment: ${payment.id} depositAmount: ${depositAmount} paymentAmount: ${paymentAmount}
                      `,
                    },
                  ],
                  fromSystem: true,
                  service: API,
                });
              }
            }
          }

          if (finished) {
            //完了してたらステータスを色々変える
            const [updatePaymentRes, updateOrderRes] = await Promise.all([
              API.db.ec_Order_Payment.update({
                where: { id: payment.id },
                data: {
                  status: EcPaymentStatus.COMPLETED,
                  source_event_json: API.query,
                },
              }),
              API.db.ec_Order.update({
                where: { id: payment.order_id },
                data: {
                  status: EcOrderStatus.PAID,
                  cart_stores: {
                    updateMany: {
                      where: {},
                      data: {
                        status: EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING,
                      },
                    },
                  },
                },
                include: {
                  cart_stores: {
                    include: {
                      store: {
                        include: {
                          ec_setting: true,
                          accounts: true,
                        },
                      },
                      products: {
                        include: {
                          product: {
                            include: {
                              item: true,
                              specialty: {
                                select: {
                                  display_name: true,
                                },
                              },
                              condition_option: {
                                select: {
                                  handle: true,
                                },
                              },
                            },
                          },
                        },
                      },
                      shipping_method: true,
                    },
                  },
                },
              }),
            ]);

            //メールを送る
            const orderService = new BackendApiEcOrderService(
              API,
              updateOrderRes.id,
            );
            orderService.core.targetObject = updateOrderRes;
            await orderService.core.sendPaidMail();
          }
        }
      }
    }

    return API.status(200).response({ msgContent: 'completed' });
  },
);
