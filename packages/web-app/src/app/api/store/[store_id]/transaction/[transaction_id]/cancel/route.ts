import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { TransactionStatus } from '@prisma/client';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';

//取引をキャンセルするAPI（現在は下書きのものに限る）
//完了済みの取引のキャンセルについては売上を元に戻すのか戻さないのかなど色々考える必要がありそう（今の所必要なさそうなため特に実装しない）
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, transaction_id } = API.params;

    //ステータスをキャンセルにする
    const transactionService = new BackendApiTransactionService(
      API,
      transaction_id,
    );
    const transactionInfo = await transactionService.core.existingObj;

    if (
      transactionInfo.status != TransactionStatus.draft &&
      transactionInfo.status != TransactionStatus.paying
    ) {
      throw new ApiError({
        status: 400,
        messageText: 'この取引はキャンセルできません',
      });
    }
    await API.transaction(async (tx) => {
      //payingだったら返品する
      if (transactionInfo.status == TransactionStatus.paying) {
        await transactionService.core.return({});
      }

      const updateResult = await API.db.transaction.update({
        where: {
          id: transactionInfo.id,
        },
        data: {
          status: TransactionStatus.canceled, //キャンセルにする
        },
      });

      //端末チェックアウトIDがある場合、そちらもキャンセルする
      if (updateResult.terminal_checkout_id) {
        const squareService = new BackendApiSquareService(API);
        await squareService.grantToken();

        await squareService.cancelTerminalCheckout(
          updateResult.terminal_checkout_id,
        );
      }
    });

    return API.status(200).response({
      msgContent: '取引がキャンセルできました',
    });
  },
);
