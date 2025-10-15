import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  Customer,
  Prisma,
  TransactionKind,
  TransactionStatus,
} from '@prisma/client';
import { BackendApiCustomerService } from '@/api/backendApi/services/customer/main';
import { putTransactionDef } from '@/app/api/store/[store_id]/transaction/api';

//取引の情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [''], //誰でも実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, transaction_id } = API.params;

    let result: any = {};

    //認証済みじゃなかったら取得できる情報が制限される
    //現在はユーザーの種類を問わない

    console.log(transaction_id, 'ですよ');

    const selectResult = await API.db.transaction.findMany({
      where: {
        id: parseInt(transaction_id),
        store_id: parseInt(store_id),
      },
      select: {
        buy__is_assessed: true,
        status: true,
        id: true,
      },
    });

    result = selectResult;

    if (result.length != 1) throw new ApiError('notExist');
    result = result[0];

    return API.status(200).response({ data: result });
  },
);

//取引の情報を更新するAPI
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, transaction_id } = API.params;

    const {
      customer_id,
      can_create_signature,
      id_kind,
      id_number,
      parental_consent_image_url,
      parental_contact,
      payment,
    } = API.body as putTransactionDef['request']['body'];

    //取引があるか確認
    const currentInfo = await API.db.transaction.findUnique({
      where: {
        id: Number(transaction_id),
        // status: TransactionStatus.completed, //完了したものに限る
        store_id: Number(store_id),
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    let customerInfo: Customer | null = null;
    let updateField: Prisma.TransactionUpdateInput = {};

    if (customer_id) {
      //顧客があるのか確認
      customerInfo = await API.db.customer.findUnique({
        where: {
          id: customer_id,
        },
      });

      if (!customerInfo)
        throw new ApiError({
          status: 404,
          messageText: `指定された顧客が見つかりませんでした`,
        });

      updateField.customer = {
        connect: {
          store_id: Number(store_id),
          id: customerInfo.id,
        },
      };

      //ここで、同意しているかどうかを見る
      updateField.term_accepted_at = customerInfo.term_accepted_at;
    }

    //下書き取引だったら
    if (currentInfo.status == TransactionStatus.draft) {
      //許可されているフィールド
      //買取取引の場合のみできる
      if (currentInfo.transaction_kind == TransactionKind.buy) {
        API.checkField([
          'customer_id',
          'can_create_signature',
          'id_kind',
          'id_number',
          'parental_consent_image_url',
          'parental_contact',
        ]);

        updateField = {
          ...updateField,
          can_create_signature,
          id_kind,
          id_number,
          parental_consent_image_url,
          parental_contact,
        };
      }
    } else if (currentInfo.status == TransactionStatus.completed) {
      //完了取引だったら
      //許可されているフィールド

      //ポイントの変更
      API.checkField(['customer_id', 'payment']);

      if (customer_id && customerInfo && currentInfo.total_price) {
        const thisCustomer = new BackendApiCustomerService(
          API,
          Number(customer_id),
        );

        const pointInfo = await thisCustomer.core.addPointInTransaction({
          totalPrice: currentInfo.total_price,
          dryRun: false,
          paymentMethod: currentInfo.payment_method,
          transactionKind: currentInfo.transaction_kind,
        });

        updateField.point_amount = pointInfo.pointAmount;
        updateField.total_point_amount = pointInfo.totalPointAmount;
      }
    }

    const result = await API.transaction(async () => {
      const updateTransactionRes = await API.db.transaction.update({
        where: { id: currentInfo.id },
        data: {
          ...updateField,
          ...(payment && {
            payment: {
              update: {
                bank__checked: payment.bank__checked,
              },
            },
          }),
        },
        include: {
          payment: true,
        },
      });

      return updateTransactionRes;
    });

    return API.status(200).response({ data: result });
  },
);
