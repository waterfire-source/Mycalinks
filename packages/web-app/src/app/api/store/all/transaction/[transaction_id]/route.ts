import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { SystemLogDomain, TransactionStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiLogService } from '@/api/backendApi/services/log/main';

//取引の情報をみっちり取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.mycaUser], //Mycaユーザーで自分の取引だったらみっちり情報を取得でき
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { transaction_id } = API.params;

    //MycaのID
    const mycaUserId = API.mycaUser?.id;

    let result: any = {};

    const selectResult = await API.db.transaction.findMany({
      where: {
        customer: {
          is: {
            myca_user_id: mycaUserId,
            // myca_user_id: 123491,
          },
        },
        id: parseInt(transaction_id || '0'),
        hidden: false, //非表示取引ではない
      },
      include: {
        store: {
          select: {
            display_name: true,
          },
        },
        transaction_carts: {
          select: {
            product: {
              select: {
                id: true,
                display_name: true,
                image_url: true,
                management_number: true,
                condition_option: {
                  select: {
                    display_name: true,
                  },
                },
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                item: {
                  select: {
                    cardnumber: true,
                    expansion: true,
                    rarity: true,
                  },
                },
              },
            },
            item_count: true,
            unit_price: true,
            discount_price: true,
            reservation_price: true,
            sale_discount_price: true,
            total_discount_price: true,
            total_unit_price: true,
          },
          orderBy: {
            order_number: 'asc',
          },
        },

        //顧客カートの情報も含ませる
        transaction_customer_carts: {
          select: {
            product: {
              select: {
                id: true,
                display_name: true,
                image_url: true,
                management_number: true,
                condition_option: {
                  select: {
                    display_name: true,
                  },
                },
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                item: {
                  select: {
                    cardnumber: true,
                    expansion: true,
                    rarity: true,
                  },
                },
              },
            },
            item_count: true,
            unit_price: true,
            discount_price: true,
          },
        },
      },
    });

    result = BackendAPI.useFlat(selectResult, {
      product__item__: 'item_',
    });

    if (result.length != 1) throw new ApiError('notExist');
    result = result[0];

    result.transaction_carts.forEach((cart: any) => {
      const conditionOptionName = cart.product__condition_option__display_name;
      cart.product__conditions = conditionOptionName
        ? [
            {
              condition_option__display_name: conditionOptionName,
            }, //旧式に合わせるため
          ]
        : [];
    });

    result.transaction_customer_carts.forEach((cart: any) => {
      const conditionOptionName = cart.product__condition_option__display_name;
      cart.product__conditions = conditionOptionName
        ? [
            {
              condition_option__display_name: conditionOptionName,
            }, //旧式に合わせるため
          ]
        : [];
    });

    return API.status(200).response({ data: result });
  },
);

//アプリ会員から取引を編集する（主に署名、同意用）
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: ['myca_user'],
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);
    const logService = new BackendApiLogService(
      API,
      SystemLogDomain.TRANSACTION,
      '顧客向け取引情報更新API',
    );

    const { transaction_id } = API.params;

    logService.core.setLogResource({
      TRANSACTION: parseInt(transaction_id),
    });

    //MycaのID
    const mycaUserId = API.mycaUser?.id;

    const { signature_image_url, term_accepted_at } = API.body;

    let result: any = {};

    //確認
    const thisTransactionInfo = await API.db.transaction.findUnique({
      where: {
        customer: {
          is: {
            myca_user_id: mycaUserId,
          },
        },
        status: TransactionStatus.draft,
        id: parseInt(transaction_id),
        signature_image_url: null, //再アップロードは禁止であるため
      },
      select: {
        id: true,
        can_create_signature: true,
      },
    });

    if (!thisTransactionInfo) throw new ApiError('notExist');

    //署名は、署名ができる状態じゃないと残せない
    // if (signature_image_url && !thisTransactionInfo.can_create_signature)
    //   throw new ApiError({
    //     status: 400,
    //     messageText: '署名ができる状態になっていません',
    //   });

    //更新する
    result = await API.db.transaction.update({
      where: {
        id: thisTransactionInfo.id,
      },
      data: {
        signature_image_url, //署名の画像URLをセットする
        term_accepted_at: term_accepted_at
          ? new Date(term_accepted_at)
          : undefined, //同意をする
      },
      select: {
        id: true,
      },
    });

    logService.core.add('取引情報を更新');

    logService.core.addJson({
      result,
    });

    await logService.core.save();

    return API.status(200).response({ data: result });
  },
);
