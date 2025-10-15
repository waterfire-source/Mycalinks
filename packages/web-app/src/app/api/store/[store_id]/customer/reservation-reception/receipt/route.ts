// 顧客ごとの特定の予約の予約票を印刷するためのコマンド

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiCustomerService } from '@/api/backendApi/services/customer/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiReceiptService } from '@/api/backendApi/services/receipt/main';
import { ReservationReceptionProductStatus } from '@prisma/client';
import { getCustomerReservationReceptionReceiptApi } from 'api-generator';
import { customDayjs } from 'common';

export const GET = BackendAPI.create(
  getCustomerReservationReceptionReceiptApi,
  async (API, { params, query }) => {
    //予約票を生成する

    //情報を取得する
    const receptionInfo = await API.db.reservation_Reception_Product.findUnique(
      {
        where: {
          id: query.reservation_reception_product_id,
          status: {
            in: [
              ReservationReceptionProductStatus.CREATED,
              ReservationReceptionProductStatus.DEPOSITED,
            ],
          },
          reservation: {
            store_id: params.store_id,
          },
        },
        include: {
          reservation_reception: {
            include: {
              customer: true,
              staff_account: {
                select: {
                  display_name: true,
                  nick_name: true,
                },
              },
            },
          },
          reservation: {
            include: {
              product: {
                include: {
                  specialty: {
                    select: {
                      display_name: true,
                    },
                  },
                  item: true,
                },
              },
            },
          },
        },
      },
    );

    if (!receptionInfo) throw new ApiError('notExist');

    const product = receptionInfo.reservation.product;
    const item = product.item;
    const customer = receptionInfo.reservation_reception.customer;
    const reservation = receptionInfo.reservation;
    const productService = new BackendApiProductService(API, product.id);
    const productName = productService.core.getProductNameWithMeta(product);
    const releaseDate = customDayjs(item.release_date)
      .tz()
      .format('YYYY年MM月DD日');

    const receptionDate = customDayjs(receptionInfo.created_at)
      .tz()
      .format('YYYY年MM月DD日');

    const rs = new BackendApiReceiptService(API);
    const customerService = new BackendApiCustomerService(API, customer.id);
    const fullAddress = await customerService.core.fullAddress;
    const barcode = await customerService.core.barcode;

    const receiptBody = `
${rs.thanks.reservation}
${rs.makeCenter(productName)}
${rs.makeCenter(`発売日 ${releaseDate}`)}
${rs.makeRow('予約番号', String(receptionInfo.id))}
${rs.hr}
${rs.makeRow(
  '商品単価',
  `¥${(
    reservation.deposit_price! + reservation.remaining_price!
  ).toLocaleString()}`,
)}
${rs.makeRow('前金', `¥${reservation.deposit_price!.toLocaleString()}`)}
${rs.makeRow('予約数量', `${receptionInfo.item_count}点`)}
${rs.makeRow(
  '合計前金',
  `¥${(
    reservation.deposit_price! * receptionInfo.item_count
  ).toLocaleString()}`,
)}
${rs.makeRow('残金', `¥${reservation.remaining_price!.toLocaleString()}`)}
${rs.makeRow(
  '合計残金',
  `¥${(
    reservation.remaining_price! * receptionInfo.item_count
  ).toLocaleString()}`,
)}
${rs.makeRow('備考')}
${rs.makeRow(reservation.description || '')}
${rs.hr}
${rs.makeRow('予約日', receptionDate)}
${rs.makeRow(
  '担当',
  receptionInfo.reservation_reception.staff_account.nick_name || '',
)}
${rs.makeRow('お名前', customer.full_name || '')}
${rs.makeRow('フリガナ', customer.full_name_ruby || '')}
${rs.makeRow('ご住所')}
${rs.makeRow(fullAddress)}
${rs.makeRow('TEL', customer.phone_number || '')}
${rs.hr}
${rs.makeBarcode(Number(barcode))}
${rs.tinySpacer}
${rs.makeTitle('注意事項')}
${rs.makeRow(`
アプリ会員の方は、アプリからもご予約内容の確認や商品の受け取りが可能です。
この予約票は、商品をお受け取りいただくまで大切に保管してください。お渡しの際にご提示いただきます。
なお、非会員の方は予約票を紛失されると商品をお渡しできない場合がございます。くれぐれもご注意ください。  
`)}
    `;

    const receiptCommand = await rs.makeReceiptCommand(receiptBody);

    return {
      receiptCommand,
    };
  },
);
