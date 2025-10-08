import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { TransactionKind, TransactionPaymentMethod } from '@prisma/client';
import { BackendApiCustomerService } from '@/api/backendApi/services/customer/main';

//特定の顧客に追加できるポイントを確認する
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { customer_id } = API.params;
    const { totalPrice } = API.query;
    const { transactionKind } = API.query;
    const { paymentMethod } = API.query;

    const thisCustomer = new BackendApiCustomerService(
      API,
      Number(customer_id),
    );
    const pointInfo = await thisCustomer.core.addPointInTransaction({
      totalPrice: Number(totalPrice),
      dryRun: true,
      //[TODO] 見直し
      paymentMethod: paymentMethod as TransactionPaymentMethod,
      transactionKind: transactionKind as TransactionKind,
    });

    return API.response({ data: pointInfo });
  },
);
