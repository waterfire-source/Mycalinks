import { BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';

//Square用のwebhookエンドポイント
// [TODO]: redisのpub/subを使ってよりサーバー間の連携が早くできる様にする
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [''], //認証しなくても使えるようにするため
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);
    const squareService = new BackendApiSquareService(API);

    //webhookを検証する
    squareService.verifyWebhook();

    console.log('webhookのボディは--------------\n', JSON.stringify(API.body));

    // const { type, data } = API.body;

    // let targetObject: any = {};
    // let transaction_id: Transaction['id'] | null;

    // //イベントを確認しつつステータスを更新する
    // switch (type) {
    //   case 'payment.updated': {
    //     targetObject = data?.object?.payment;
    //     if (
    //       targetObject &&
    //       targetObject.reference_id &&
    //       targetObject.status == 'COMPLETED'
    //     ) {
    //       transaction_id = parseInt(
    //         targetObject.reference_id.replace(
    //           BackendApiSquareService.config.refIdPrefix,
    //           '',
    //         ),
    //       );

    //       const createPaymentResult = await API.db.$primary().payment.upsert({
    //         where: {
    //           transaction_id,
    //         },
    //         update: {},
    //         create: {
    //           transaction: {
    //             connect: {
    //               id: transaction_id,
    //             },
    //           },
    //           mode: PaymentMode.pay,
    //           service: PaymentService.square,
    //           method: targetObject.source_type,
    //           source_event_json: API.body,
    //           source_id: targetObject.id,
    //           total_amount: targetObject.amount_money.amount,
    //         },
    //       });

    //       console.log('支払いの詳細は', targetObject);

    //       //Paymentテーブルを作る
    //       switch (targetObject.source_type) {
    //         //カードだった場合
    //         case 'CARD':
    //           const cardDetails = targetObject.card_details?.card;
    //           await API.db.$primary().payment.update({
    //             where: {
    //               id: createPaymentResult?.id,
    //             },
    //             data: {
    //               card__card_brand: cardDetails.card_brand,
    //               card__card_type: cardDetails.card_type,
    //               card__exp_month: cardDetails.exp_month,
    //               card__exp_year: cardDetails.exp_year,
    //               card__last_4: cardDetails.last_4,
    //             },
    //           });

    //           break;

    //         //[TODO] ここでPayPayや電子マネーの詳細情報についても記録したい
    //       }

    //       //ステータスを更新する
    //       await API.db.$primary().transaction.update({
    //         where: {
    //           id: transaction_id,
    //         },
    //         data: {
    //           status: TransactionStatus.completed,
    //         },
    //       });
    //     }

    //     break;

    //   //返金が完了した時
    //   case 'refund.updated':
    //     targetObject = data?.object?.refund;
    //     if (
    //       targetObject &&
    //       targetObject.payment_id &&
    //       targetObject.status == 'COMPLETED'
    //     ) {
    //       const paymentInfo = await API.db.$primary().payment.findFirst({
    //         where: {
    //           source_id: targetObject.payment_id,
    //           mode: PaymentMode.pay,
    //           service: PaymentService.square,
    //         },
    //         include: {
    //           transaction: {
    //             include: {
    //               next_transaction: {
    //                 select: {
    //                   id: true,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       });

    //       transaction_id = paymentInfo?.transaction.next_transaction?.id || 0;
    //       if (transaction_id) {
    //         await API.db.$primary().transaction.update({
    //           where: {
    //             id: transaction_id,
    //           },
    //           data: {
    //             status: TransactionStatus.completed,
    //             payment: {
    //               create: {
    //                 mode: PaymentMode.refund,
    //                 service: PaymentService.square,
    //                 source_event_json: API.body,
    //                 source_id: targetObject.id,
    //                 method: targetObject.destination_type, //買取だとCASHのみ
    //                 total_amount: -1 * targetObject.amount_money.amount, //返金であるため負の数
    //               },
    //             },
    //           },
    //         });
    //       }
    //     }

    //     break;

    //   //端末のチェックアウトが更新された時
    //   case 'terminal.checkout.updated':
    //     targetObject = data?.object?.checkout;
    //     if (
    //       targetObject &&
    //       targetObject.reference_id &&
    //       targetObject.status == 'CANCELED'
    //     ) {
    //       transaction_id = parseInt(
    //         targetObject.reference_id.replace(
    //           BackendApiSquareService.config.refIdPrefix,
    //           '',
    //         ),
    //       );

    //       //ステータスを更新する（キャンセルにする）
    //       await API.db.$primary().transaction.update({
    //         where: {
    //           id: transaction_id,
    //         },
    //         data: {
    //           status: TransactionStatus.canceled,
    //         },
    //       });
    //     }
    //     break;

    //   //端末ペアリングが完了した時
    //   case 'device.code.paired':
    //     {
    //       targetObject = data?.object?.device_code;

    //       const code = targetObject.code;
    //       const deviceId = targetObject.device_id;
    //       const locationId = targetObject.location_id;

    //       if (code && deviceId && locationId) {
    //         const targetRegister = await API.db.register.findFirst({
    //           where: {
    //             store: {
    //               square_location_id: locationId,
    //             },
    //             square_device_code: code,
    //           },
    //         });

    //         if (targetRegister) {
    //           //deviceIdを繋ぎこむ
    //           await API.db.register.update({
    //             where: {
    //               id: targetRegister.id,
    //             },
    //             data: {
    //               square_device_id: deviceId,
    //             },
    //           });
    //         } else {
    //           console.log('ないdeviceCode参照しちゃってんじゃん？');
    //         }
    //       }
    //     }
    //     //有効期限内のデバイスコードが紐づいているレジにdeviceIdをいれつつ、連携完了を入れる

    //     break;
    // }

    return API.status(200).response({ msgContent: 'completed' });
  },
);
