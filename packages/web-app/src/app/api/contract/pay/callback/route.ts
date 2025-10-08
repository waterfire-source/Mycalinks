import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiGmoService } from '@/api/backendApi/services/gmo/main';
import { BackendApiContractService } from '@/api/backendApi/services/contract/main';
import { ContractPaymentStatus } from '@prisma/client';

// 契約の支払いコールバック
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.everyone],
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const gmoService = new BackendApiGmoService(API, 'contract');

    const { accessId, event } = gmoService.getCallbackInfo<{
      accessId: string;
      event: string;
    }>();

    if (event != 'TDS_CHARGE_FINISHED')
      throw new ApiError({
        status: 500,
        messageText: '決済失敗',
      });

    //このアクセスIDの支払いを取得する
    const payment = await API.db.contract_Payment.findUnique({
      where: {
        gmo_access_id: accessId,
      },
      include: {
        contract: true,
      },
    });

    //オーダー情報取得
    const { gmoOrder, finished } =
      await gmoService.core.client.getOrder(accessId);

    //なかったらエラー
    if (!gmoOrder || !payment) throw new ApiError('notExist');

    //完了してたらアクティベートする
    if (finished) {
      const contractService = new BackendApiContractService(
        API,
        payment.contract_id,
      );

      //お支払い完了にする
      await API.db.contract_Payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: ContractPaymentStatus.PAID,
          finished_at: new Date(),
        },
      });

      await API.transaction(async () => {
        await contractService.core.activate();
      });
    } else
      throw new ApiError({
        status: 500,
        messageText: '支払いに失敗しました',
      });

    //成功ページへ遷移
    return NextResponse.redirect(
      new URL(
        `/register/thanks?email=${payment.contract.email}`,
        process.env.NEXT_PUBLIC_BIZ_ORIGIN!,
      ),
    );
  },
);
