import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { jpFormat } from 'dayjs-jp-format'; // load on demand
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  TransactionKind,
  TransactionPaymentMethod,
  TransactionStatus,
  TransactionTaxKind,
} from '@prisma/client';
import { BackendApiReceiptService } from '@/api/backendApi/services/receipt/main';
import { customDayjs } from 'common';

customDayjs.extend(jpFormat); // use plugin

//レシートの印刷
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, transaction_id } = API.params;

    const { type, cash_recieved_price, cash_change_price, is_reprint } =
      API.query;

    //現在の取引の情報を取得する
    let thisTransactionInfo: any = await API.db.transaction.findMany({
      where: {
        id: parseInt(transaction_id || ''),
        store_id: parseInt(store_id || ''),
        status: {
          not: TransactionStatus.canceled, //キャンセルではない奴のみ
        },
      },
      include: {
        transaction_carts: {
          include: {
            product: {
              include: {
                condition_option: true,
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                consignment_client: {
                  select: {
                    display_name: true,
                    display_name_on_receipt: true,
                  },
                },
                item: {
                  select: {
                    rarity: true,
                    cardnumber: true,
                    expansion: true,
                  },
                },
              },
            },
            sale: true,
          },
        },
        store: true,
        customer: true,
        staff_account: true,
        payment: true,
      },
    });

    thisTransactionInfo = BackendAPI.useFlat(thisTransactionInfo);

    if (!thisTransactionInfo.length) throw new ApiError('notExist');

    const t = thisTransactionInfo[0];
    const s = API.resources.store!;

    //一旦買取の時のレシートは考慮していない
    //領収書についても未対応

    let receiptCommand: string | null = '';

    //顧客用のレシート
    let receiptCommandForCustomer: string | null = '';

    // const taxAmount = Math.round(
    //   t.total_price * (storeSetting.tax / (1 + storeSetting.tax)),
    // );

    // const receiptUtil = new BackendReceiptModel(API);
    const receiptUtil = new BackendApiReceiptService(API);

    // 税額
    const tax = t.tax;

    switch (type) {
      case 'receipt': {
        let receiptCommandBody: string = '';
        let receiptCommandBodyForCustomer: string = '';

        //取引の情報

        let receiptTitleCommand: string = '';

        switch (t.transaction_kind) {
          case TransactionKind.sell:
            receiptTitleCommand = receiptUtil.thanks.sell;
            break;

          case TransactionKind.buy:
            receiptTitleCommand =
              t.status == TransactionStatus.draft
                ? receiptUtil.thanks.estimate
                : receiptUtil.thanks.buy;
            break;
        }

        const receiptTitleCommandForCustomer =
          receiptUtil.thanks.buyForCustomer; //顧客用のレシート

        const transactionInfoCommand = `
        ${is_reprint ? receiptUtil.makeCenter('【再印刷】') : ''}
  ${receiptUtil.makeRow(
    customDayjs.tz(t.finished_at).format('YYYY年MM月DD日HH:mm:ss'),
    `取引ID:${t.id}`,
  )}
  ${receiptUtil.makeRow(
    `レジ:${t.register_id}`,
    `決済方法:${
      t.payment_method === TransactionPaymentMethod.cash
        ? '現金'
        : t.payment_method === TransactionPaymentMethod.square
        ? 'カード'
        : t.payment_method === TransactionPaymentMethod.felica
        ? '電子マネー'
        : t.payment_method === TransactionPaymentMethod.paypay
        ? 'QR決済'
        : t.payment_method === TransactionPaymentMethod.bank
        ? '銀行振込'
        : ''
    }`,
  )}
  ${receiptUtil.makeRow(
    `登録番号:${API.resources.corporation?.invoice_number}`,
    t.customer_id ? `会員番号:${t.customer_id}` : '',
  )}

  ${receiptUtil.makeRow(
    t.staff_account?.nick_name ? `担当者:${t.staff_account?.nick_name}` : '',
  )}
  
  ${receiptUtil.hr}
  `;

        //カートの中身
        const cartsCommand =
          t.transaction_carts
            .sort((a: any, b: any) => a.order_number - b.order_number)
            .map(
              (p: any) => `
  ${receiptUtil.makeProduct(p, 'product__', t.transaction_kind)}
  `,
            )
            .join('') + receiptUtil.hr;

        const itemTotalCount = t.transaction_carts.reduce(
          (curSum: number, p: any) => curSum + p.item_count,
          0,
        );
        // const subTotalPrice = t.transaction_carts.reduce((curSum: number, p: any) => curSum + p.unit_price * p.item_count, 0)
        const subTotalPrice = t.subtotal_price || 0;

        //小計など
        const priceInfoCommand =
          t.transaction_kind == TransactionKind.buy
            ? `

  ${
    t.discount_price
      ? receiptUtil.makeRow(`割増`, `+ ${t.discount_price.toLocaleString()}`)
      : ''
  }
  ${receiptUtil.makeRow(
    `合計`,
    `${itemTotalCount}点    ¥${t.total_price.toLocaleString()}`,
  )}
  ${receiptUtil.makeRow(
    `(${t.tax_kind == TransactionTaxKind.EXCLUDE_TAX ? '外' : '内'}税額`,
    `¥${tax.toLocaleString()})`,
  )}
  ${receiptUtil.hr}
  ${
    t.status == TransactionStatus.completed
      ? `
      ${receiptUtil.spacer}
      ${receiptUtil.spacer}
      ${receiptUtil.spacer}
      ${receiptUtil.spacer}
      ${receiptUtil.makeRow('署名/Signature', 'signature')}
      ${receiptUtil.hr}
    `
      : ''
  }
  `
            : `
  
  ${receiptUtil.makeRow(
    `小計`,
    `${itemTotalCount}点    ¥${subTotalPrice.toLocaleString()}`,
  )}
  ${
    t.discount_price
      ? receiptUtil.makeRow(`割引`, `${t.discount_price.toLocaleString()}`)
      : ''
  }
  ${
    t.point_discount_price
      ? receiptUtil.makeRow(
          `ポイント適用`,
          `${t.point_discount_price.toLocaleString()}`,
        )
      : ''
  }
  ${receiptUtil.makeRow(
    `(${t.tax_kind == TransactionTaxKind.EXCLUDE_TAX ? '外' : '内'}税額`,
    `¥${tax.toLocaleString()})`,
  )}
  ${receiptUtil.hr}
  ${receiptUtil.makeRow(`合計`, `¥${t.total_price.toLocaleString()}`)}
  ${
    cash_recieved_price || t.payment__cash__recieved_price
      ? receiptUtil.makeRow(
          `お預かり`,
          `¥${(
            Number(cash_recieved_price) ||
            t.payment__cash__recieved_price ||
            0
          )?.toLocaleString()}`,
        ) +
        receiptUtil.makeRow(
          `お釣り`,
          `¥${(
            Number(cash_change_price) ||
            t.payment__cash__change_price ||
            0
          )?.toLocaleString()}`,
        )
      : ''
  }
  ${receiptUtil.makeRow('')}
  ${receiptUtil.hr}
  `;

        const priceInfoCommandForCustomer = `

  ${
    t.discount_price
      ? receiptUtil.makeRow(`割増`, `+ ${t.discount_price.toLocaleString()}`)
      : ''
  }
  ${receiptUtil.makeRow(
    `合計`,
    `${itemTotalCount}点    ¥${t.total_price.toLocaleString()}`,
  )}
  ${receiptUtil.makeRow(
    `(${t.tax_kind == TransactionTaxKind.EXCLUDE_TAX ? '外' : '内'}税額`,
    `¥${tax.toLocaleString()})`,
  )}
  ${receiptUtil.hr}
  `;

        //ポイントカード
        const pointCommand =
          t.customer_id && t.total_point_amount
            ? `
  ${receiptUtil.makeCenter('＜ポイントカード＞')}
  ${receiptUtil.makeRow(`会員番号`, t.customer__myca_user_id)}
  ${receiptUtil.makeRow(
    `前回まで`,
    `${(
      t.total_point_amount -
      (t.point_amount ?? 0) -
      (t.point_discount_price ?? 0)
    ).toLocaleString()}P`,
  )}
  ${
    t.point_amount
      ? receiptUtil.makeRow(
          `今回加算`,
          `${(t.point_amount ?? 0).toLocaleString()}P`,
        )
      : ''
  }
  ${
    t.point_discount_price
      ? receiptUtil.makeRow(
          `今回消費`,
          `${Math.abs(t.point_discount_price ?? 0).toLocaleString()}P`,
        )
      : ''
  }
  ${receiptUtil.makeRow(`累計`, `${t.total_point_amount.toLocaleString()}P`)}
  ${receiptUtil.hr}
  `
            : ''; //一旦お釣りとかは残さない

        receiptCommandBody +=
          receiptTitleCommand +
          transactionInfoCommand +
          cartsCommand +
          priceInfoCommand +
          pointCommand;

        receiptCommandBodyForCustomer +=
          receiptTitleCommandForCustomer +
          transactionInfoCommand +
          cartsCommand +
          priceInfoCommandForCustomer +
          pointCommand;

        receiptCommand =
          (await receiptUtil.makeReceiptCommand(receiptCommandBody)) || null;

        //買取モードだったら顧客用のレシートも追加する
        if (
          t.transaction_kind == TransactionKind.buy &&
          t.status == TransactionStatus.completed
        ) {
          receiptCommandForCustomer =
            (await receiptUtil.makeReceiptCommand(
              receiptCommandBodyForCustomer,
            )) || null;
        }

        break;
      }
      case 'ryoshu': {
        const ryoshuHeaderCommand = `
      ${receiptUtil.thanks.ryoshu}
      ${is_reprint ? receiptUtil.makeCenter('【再印刷】') : ''}
      ${receiptUtil.makeRow(
        `No. ${t.id}`,
        `発行日 ${customDayjs(t.finished_at).tz().format('rrrr年M月D日')}`,
      )}
      ${receiptUtil.makeRow(
        `登録番号:${API.resources.corporation?.invoice_number}`,
        '',
      )}
      ${receiptUtil.spacer}
      ${receiptUtil.spacer}
      ${receiptUtil.makeRow('', '様')}
      ${receiptUtil.hr}
      ${receiptUtil.spacer}
      ${receiptUtil.makeRow('金額', `￥${t.total_price.toLocaleString()} -`)}
      `;

        const ryoshuContentCommand = `

      ${receiptUtil.spacer}
      ${receiptUtil.spacer}
      ${receiptUtil.makeRow('但し、')}
      ${receiptUtil.hr}
      ${receiptUtil.spacer}
      ${receiptUtil.makeCenter('上記の金額正に領収いたしました')}
      `;

        const ryoshuPriceInfoCommand = `
      ${receiptUtil.makeTitle('内訳')}
      ${receiptUtil.makeRow(
        '税抜金額',
        `￥${(t.total_price - tax).toLocaleString()} -`,
      )}
      ${receiptUtil.makeRow('消費税額', `￥${tax.toLocaleString()} -`)}
      `;

        // 領収書にも収入印紙を表示（5万円以上かつ現金決済の場合）
        const revenueStampCommand = receiptUtil.makeRevenueStamp(
          t.total_price,
          t.payment_method === TransactionPaymentMethod.cash
            ? 'cash'
            : undefined,
        );

        receiptCommand =
          (await receiptUtil.makeReceiptCommand(
            ryoshuHeaderCommand +
              ryoshuContentCommand +
              ryoshuPriceInfoCommand +
              revenueStampCommand,
          )) || null;

        break;
      }
    }

    return API.status(200).response({
      data: {
        transactionData: t, //開発用に詳細なデータを残しているだけ
        receiptCommand,
        receiptCommandForCustomer,
      },
    });
  },
);
