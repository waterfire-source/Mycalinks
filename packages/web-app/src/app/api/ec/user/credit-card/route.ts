// ECユーザーのクレジットカードを保存する

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiEcPaymentService } from '@/api/backendApi/services/ec/payment/main';
import {
  getEcUserCreditCardApi,
  registerEcUserCreditCardApi,
} from 'api-generator';

export const POST = BackendAPI.create(
  registerEcUserCreditCardApi,
  async (API, { body }) => {
    const app_user_id = API.mycaUser!.id;

    let { token } = body;

    //登録する
    const ecPaymentService = new BackendApiEcPaymentService(API);

    //カードを保存
    const saveCardRes = await ecPaymentService.core.saveCard({
      token,
      appUserId: app_user_id,
    });

    return saveCardRes;
  },
);

// ECユーザーのクレジットカード情報を取得する
//とりあえずプライマリーのやつしか取得しない形

export const GET = BackendAPI.create(getEcUserCreditCardApi, async (API) => {
  const app_user_id = API.mycaUser!.id;

  const selectRes = await API.db.gmo_Credit_Card.findMany({
    where: {
      app_user_id,
      is_primary: true,
    },
  });

  return {
    cards: selectRes,
  };
});
