//新しい法人を作るためのAPI
//基本的にMycaPOSの管理者しか叩けないようにしたいが、現在はいずれかの法人アカウントでログインしていれば叩ける
//アカウントID: 1じゃないと実行できないようにする

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { createCorporationApi, getCorporationApi } from 'api-generator';

export const POST = BackendAPI.create(
  createCorporationApi,
  async (API, { body }) => {
    if (API.user?.id != 1 && process.env.NEXT_PUBLIC_DATABASE_KIND != 'staging')
      throw new ApiError({
        status: 401,
        messageText: '実行できません',
      });

    const { email } = body;

    const txRes = await API.transaction(async (tx) => {
      const createCorporationRes = await tx.corporation.create({
        data: {
          name: `法人 ${email}`,
        },
      });

      //神アカウントを作成する
      const { linked_corporation, ...createAccountRes } =
        await tx.account.create({
          data: {
            email,
            hashed_password: '',
            salt: '',
            login_flg: false,
            linked_corporation_id: createCorporationRes.id,
            display_name: `法人 ${email} アカウント`,
            group_id:
              mycaPosCommonConstants.account.specialAccountGroup.corp.id,
          },
          include: {
            linked_corporation: true,
          },
        });

      return {
        ...createAccountRes,
        corporation: linked_corporation,
      };
    });

    return {
      account: txRes,
    };
  },
);

//法人取得
export const GET = BackendAPI.create(getCorporationApi, async (API) => {
  //一旦誰でも取得できることにする
  const corporation = await API.db.corporation.findUnique({
    where: {
      id: API.user!.corporation_id,
    },
    select: {
      id: true,
      name: true,
      ceo_name: true,
      head_office_address: true,
      phone_number: true,
      kobutsusho_koan_iinkai: true,
      kobutsusho_number: true,
      invoice_number: true,
      zip_code: true,
      square_available: true,
      tax_mode: true,
      price_adjustment_round_rank: true,
      price_adjustment_round_rule: true,
      use_wholesale_price_order_column: true,
      use_wholesale_price_order_rule: true,
      wholesale_price_keep_rule: true,
      enabled_staff_account: true,
    },
  });

  if (!corporation) throw new ApiError('notExist');

  return {
    corporation,
  };
});
