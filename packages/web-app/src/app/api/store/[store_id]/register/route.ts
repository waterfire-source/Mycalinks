import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, Register, RegisterStatus } from '@prisma/client';
import {
  createRegisterDef,
  getRegisterDef,
} from '@/app/api/store/[store_id]/register/def';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';

//レジの作成を行うAPI
export const POST = BackendAPI.defineApi(
  createRegisterDef,
  async (API, { params, body }) => {
    //更新モードだったら
    let currentInfo: Register | null = null;
    const {
      id,
      display_name,
      cash_reset_price,
      sell_payment_method,
      buy_payment_method,
      // account_id,
      status,
      auto_print_receipt_enabled,
    } = body;

    //account_idを指定してきたら、とりあえずログイン中のアカウントかどうかを確認する
    // if (account_id && account_id != Number(API.user!.id))
    //   throw new ApiError(createRegisterDef.error.invalidAccountId);

    let is_primary = false;

    const allRegisters = await API.db.register.findManyExists({
      where: {
        store_id: params.store_id,
      },
    });

    let thisRegister: BackendApiRegisterService | null = null;
    if (id) {
      //存在するか確認
      thisRegister = new BackendApiRegisterService(API, id);
      currentInfo = await thisRegister.core.existingObj;
    } else {
      //新規作成の場合、初めての作成だったらis_primary=true
      if (!allRegisters.find((e) => e.is_primary)) {
        is_primary = true;
      }
    }

    //upsertする
    const txRes = await API.transaction(async (tx) => {
      const result = await tx.register.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          display_name: display_name ?? '新規レジ',
          buy_payment_method,
          sell_payment_method,
          cash_reset_price,
          // account_id,
          store_id: params.store_id,
          is_primary,
          auto_print_receipt_enabled,
        },
        update: {
          display_name,
          buy_payment_method,
          sell_payment_method,
          cash_reset_price,
          // account_id,
          auto_print_receipt_enabled,
        },
      });

      //ステータス変更
      if (thisRegister && status != undefined) {
        await thisRegister.core.changeStatus(status);
      }

      return result;
    });

    return txRes;
  },
);

//レジの取得API
export const GET = BackendAPI.defineApi(
  getRegisterDef,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.RegisterWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        // case 'inUse':
        //   const thisQuery = value
        //     ? {
        //         not: null,
        //       }
        //     : null;

        //   whereInput.push({
        //     account_id: thisQuery,
        //   });
        //   break;

        // case 'me':
        //   whereInput.push({
        //     account_id: Number(API.user?.id),
        //   });

        //   break;

        case 'status':
          whereInput.push({
            [key]: value as RegisterStatus,
          });

          break;
      }
    }

    const selectRes = await API.db.register.findManyExists({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
    });

    return {
      registers: selectRes,
    };
  },
);
