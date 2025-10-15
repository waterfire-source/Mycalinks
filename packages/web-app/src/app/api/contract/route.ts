import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiGmoService } from '@/api/backendApi/services/gmo/main';
import { CustomCrypto } from '@/utils/crypto';
import { createContractApi, getContractsApi } from 'api-generator';
import { ContractStatus } from '@prisma/client';

// 契約作成
export const POST = BackendAPI.create(
  createContractApi,
  async (API, { body }) => {
    const {
      start_at,
      main_account_monthly_fee,
      corporation_management_account_fee,
      mobile_device_connection_fee,
      initial_fee,
    } = body;

    //トークンを生成する
    const uuid = CustomCrypto.generateUuid();

    const now = new Date();

    if (start_at.getTime() < now.getTime())
      throw new ApiError(createContractApi.error.pastStartAt);

    //URLにのせるためURLセーフ
    const token = CustomCrypto.base64Encode(uuid);
    const token_expires_at = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); //とりあえず一ヶ月後を期限にする

    //月額を求める
    const monthly_payment_price =
      main_account_monthly_fee +
      corporation_management_account_fee +
      mobile_device_connection_fee;
    //初期費用
    const initial_payment_price = initial_fee;

    //とりあえず作成する
    const txRes = await API.transaction(async (tx) => {
      //作成する
      const createRes = await tx.contract.create({
        data: {
          token,
          token_expires_at,
          start_at,
          main_account_monthly_fee,
          corporation_management_account_fee,
          mobile_device_connection_fee,
          initial_fee,
          initial_payment_price,
          monthly_payment_price,
        },
      });

      //GMOの顧客を発行
      const gmoService = new BackendApiGmoService(API, 'contract');

      const createMemberRes = await gmoService.core.client.createMember({
        id: createRes.id,
      });

      if (!createMemberRes.memberId)
        throw new ApiError({
          status: 500,
          messageText: 'メンバーが作成できませんでした',
        });

      const updateRes = await tx.contract.update({
        where: {
          id: createRes.id,
        },
        data: {
          gmo_customer_id: createMemberRes.memberId!,
        },
      });

      return updateRes;
    });

    return txRes;
  },
);

// 契約一覧
export const GET = BackendAPI.create(
  getContractsApi,
  async (API, { query }) => {
    const { token } = query;

    const thisContractInfo = await API.db.contract.findUnique({
      where: {
        token,
        status: ContractStatus.NOT_STARTED,
      },
      select: {
        token_expires_at: true,
        start_at: true,
        main_account_monthly_fee: true,
        corporation_management_account_fee: true,
        mobile_device_connection_fee: true,
        initial_fee: true,
        initial_payment_price: true,
        monthly_payment_price: true,
      },
    });

    if (!thisContractInfo) throw new ApiError('notExist');

    return thisContractInfo;
  },
);
