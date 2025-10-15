import {
  EcOrderCartStoreStatus,
  EcOrderStatus,
  EcPaymentMethod,
  EcPaymentStatus,
  PaymentMode,
} from '@prisma/client';
import {
  BackendCoreEcOrderService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//支払いタイムアウト
//3Dセキュアが失敗した時とかコンビニ決済が払われなかった時など
export const paymentTimeoutController: TaskCallback<
  typeof workerDefs.ecOrder.kinds.paymentTimeout.body
> = async (task) => {
  //この取引情報を取得する
  const orderId = task.body[0].data.order_id;

  task.setIds({
    ecOrderId: orderId,
  });

  const orderInfo = await task.db.ec_Order.findUnique({
    where: {
      id: task.ids.ecOrderId,
      status: EcOrderStatus.UNPAID, //入金中のものに限る
    },
  });

  //なかったら無視する
  if (!orderInfo) return;

  const txRes = await task.transaction(async (tx) => {
    //ロールバックする
    const thisOrder = new BackendCoreEcOrderService(orderId);
    task.give(thisOrder);

    await thisOrder.rollbackProducts();

    //下書きに戻す
    const updateRes = await tx.ec_Order.update({
      where: {
        id: orderInfo.id,
        status: EcOrderStatus.UNPAID, //一応条件をつける
      },
      data: {
        status: EcOrderStatus.DRAFT,
        payments: {
          updateMany: {
            where: {
              status: EcPaymentStatus.PAYING,
              mode: PaymentMode.pay,
            },
            data: {
              status: EcPaymentStatus.CANCELED,
            },
          },
        },
        cart_stores: {
          updateMany: {
            where: {},
            data: {
              status: EcOrderCartStoreStatus.DRAFT,
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
    });

    return updateRes;
  });

  //現金支払いだった場合、タイムアウトのメールを送信する
  switch (txRes.payment_method) {
    case EcPaymentMethod.CONVENIENCE_STORE:
    case EcPaymentMethod.BANK: {
      const payment = txRes.payments
        .filter(
          (e) =>
            e.status == EcPaymentStatus.CANCELED && e.mode == PaymentMode.pay,
        )
        .sort(
          (a, b) =>
            //ID降順にする
            b.id - a.id,
        )[0];

      const ecOrderService = new BackendCoreEcOrderService(orderId);
      task.give(ecOrderService);
      ecOrderService.targetObject = txRes;

      await ecOrderService.sendCashPaymentTimeoutMail(payment);

      break;
    }
  }
};
