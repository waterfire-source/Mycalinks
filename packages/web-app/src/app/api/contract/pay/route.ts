//POSの初期費用を支払うAPI
//ついでにカード情報を登録しておいて、毎月払い
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { NextAction } from 'backend-core';

import {
  ContractPaymentKind,
  ContractPaymentStatus,
  ContractStatus,
} from '@prisma/client';
import { ApiResponse, createContractApi, payContractApi } from 'api-generator';
import { BackendApiContractService } from '@/api/backendApi/services/contract/main';

// 契約支払いAPI
export const POST = BackendAPI.create(payContractApi, async (API, { body }) => {
  const { token, corporation, account, card } = body;

  //情報を取得する
  const thisContractInfo = await API.db.contract.findUnique({
    where: {
      status: ContractStatus.NOT_STARTED,
      token,
      token_expires_at: {
        gt: new Date(),
      },
    },
  });

  if (!thisContractInfo) throw new ApiError('notExist');

  //日付を見る
  if (thisContractInfo.start_at.getTime() < new Date().getTime())
    throw new ApiError(createContractApi.error.pastStartAt);

  //メールアドレスが使えるか確認
  const duplicateAccount = await API.db.account.findUnique({
    where: {
      email: account.email,
    },
  });

  if (duplicateAccount)
    throw new ApiError({
      status: 400,
      messageText: 'このメールアドレスは使えません',
    });

  const txRes = await API.transaction(async (tx) => {
    const contractService = new BackendApiContractService(
      API,
      thisContractInfo.id,
    );

    const cardToken = card.token;

    //カードを作成する
    const saveCardRes = await contractService.core.saveContractCard({
      token: cardToken,
    });

    //法人などを作成する
    const updateRes = await tx.contract.update({
      where: {
        id: thisContractInfo.id,
      },
      data: {
        email: account.email,
        corporation: {
          create: {
            ...corporation,
          },
        },
      },
    });

    //支払いを作成する
    const { contractPayment, gmoPayment } =
      await contractService.core.createPayment({
        kind: ContractPaymentKind.INITIAL_FEE,
      });

    //完了してたらアクティベートする
    let tds: ApiResponse<typeof payContractApi>['tds'] = undefined;

    if (contractPayment.status == ContractPaymentStatus.PAID) {
      await contractService.core.activate();
    } else if (
      gmoPayment.nextAction == NextAction.REDIRECT &&
      'redirectInformation' in gmoPayment
    ) {
      tds = {
        redirectUrl: gmoPayment.redirectInformation?.redirectUrl ?? '',
      };
    } else
      throw new ApiError({
        status: 500,
        messageText: '不明エラー',
      });

    //最後にステータスを取得する
    const resultInfo = await tx.contract.findUnique({
      where: {
        id: thisContractInfo.id,
      },
      select: {
        status: true,
      },
    });

    return {
      contract: resultInfo!,
      tds,
    };
  });

  return txRes;
});
