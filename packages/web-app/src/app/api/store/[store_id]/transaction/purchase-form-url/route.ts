import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';

import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiReceiptService } from '@/api/backendApi/services/receipt/main';

//買取受付フォーム用のURL発行
//ゆくゆくはいたずら防止でランダムURLのようなものを自動生成できるようにする
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;
    const { type = 'purchase' } = API.query;

    let receiptCommand: string | null = '';

    let receiptCommandBody: string = '';

    const receiptUtil = new BackendApiReceiptService(API);

    receiptCommandBody +=
      type === 'reservation'
        ? receiptUtil.thanks.reservationForm
        : receiptUtil.thanks.purchaseForm;

    //ここはとりあえず固定値で
    const formUrl =
      type === 'reservation'
        ? `${process.env.NEXT_PUBLIC_SERVICE_ORIGIN}/guest/${store_id}/reservation-reception-form`
        : `${process.env.NEXT_PUBLIC_SERVICE_ORIGIN}/guest/${store_id}/purchase-reception-form`;

    receiptCommandBody += `
  ${receiptUtil.spacer}
  ${receiptUtil.makeQr(formUrl, 8)}
  ${receiptUtil.spacer}
  ${receiptUtil.makeCenter(formUrl)}
  ${receiptUtil.spacer}
  ${receiptUtil.makeCenter('上記QRコードまたはリンクから')}
  ${receiptUtil.makeCenter('必要事項を入力の上')}
  ${receiptUtil.makeCenter('レジまでお越しください。')}
  `;

    receiptCommand =
      (await receiptUtil.makeReceiptCommand(receiptCommandBody)) || null;

    return API.status(200).response({
      data: {
        formUrl,
        receiptCommand,
      },
    });
  },
);
