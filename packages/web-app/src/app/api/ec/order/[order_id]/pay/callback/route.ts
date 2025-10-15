import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiGmoService } from '@/api/backendApi/services/gmo/main';
import { NextResponse } from 'next/server';
import {
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentService,
  EcPaymentStatus,
  PaymentMode,
} from '@prisma/client';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';

// ECの支払いコールバック
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.everyone],
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const gmoService = new BackendApiGmoService(API, 'ec');

    const { accessId, event } = gmoService.getCallbackInfo<{
      accessId: string;
      event: string;
    }>();

    console.log(accessId, event);

    if (event != 'TDS_CHARGE_FINISHED')
      throw new ApiError({
        status: 500,
        messageText: '決済失敗',
      });

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
    const { gmoOrder, finished } =
      await gmoService.core.client.getOrder(accessId);

    //なかったらエラー
    if (!gmoOrder) throw new ApiError('notExist');

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
            payments: true,
            cart_stores: {
              include: {
                store: {
                  include: {
                    ec_setting: true,
                    accounts: true,
                  },
                },
                shipping_method: {
                  include: {
                    regions: true,
                    weights: {
                      include: {
                        regions: true,
                      },
                    },
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
              },
            },
          },
        }),
      ]);

      const ecOrderService = new BackendApiEcOrderService(
        API,
        updateOrderRes.id,
      );
      ecOrderService.core.targetObject = updateOrderRes;

      await ecOrderService.core.sendOrderMail();
    }

    // 成功ページへ遷移
    return NextResponse.redirect(
      new URL(
        `/ec/order/result/${payment.order.id}`,
        process.env.NEXT_PUBLIC_EC_ORIGIN_WITH_CREDENTIAL!,
      ),
    );
  },
);
