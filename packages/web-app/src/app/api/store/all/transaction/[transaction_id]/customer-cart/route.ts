import { apiRole, BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import {
  SystemLogDomain,
  Transaction_Customer_Cart,
  TransactionKind,
  TransactionStatus,
} from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiLogService } from '@/api/backendApi/services/log/main';

//顧客カートの内容更新
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos, apiRole.mycaUser], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef); //左にcheckField統合する？

    const logService = new BackendApiLogService(
      API,
      SystemLogDomain.TRANSACTION,
      '顧客向け取引カート更新API',
    );

    const { transaction_id: id } = API.params;

    logService.core.setLogResource({
      TRANSACTION: parseInt(id),
    });

    //MycaのID
    const mycaUserId = API.mycaUser?.id;

    const { carts } = API.body;

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    //指定された取引の情報を取得する
    const transactionInfo = await API.db.transaction.findUnique({
      where: {
        customer: {
          is: {
            myca_user_id: mycaUserId,
          },
        },
        id: parseInt(id),
        status: TransactionStatus.draft, //下書き状態のものだけ
        transaction_kind: TransactionKind.buy, //今は買取のみ
        buy__is_assessed: true, //査定済みのものだけ
        reception_number: {
          gt: 0, //受付番号がしっかり入っているもののみ
        },
        signature_image_url: null, //すでに署名したものは変更できない
      },
      include: {
        transaction_carts: true,
      },
    });

    logService.core.add('変更前の情報');
    logService.core.addJson({
      transactionInfo,
    });

    if (!transactionInfo || !Array.isArray(carts))
      throw new ApiError('notExist');

    //本カート情報とリクエストボディを照らし合わせて、適切か判断する
    for (const customerCart of carts) {
      //同じものがカートから見つかるか確認
      if (
        !transactionInfo.transaction_carts.find(
          (originalCart) =>
            originalCart.product_id == customerCart.product_id &&
            originalCart.unit_price == customerCart.unit_price &&
            originalCart.discount_price == customerCart.discount_price,
        ) ||
        !(customerCart.item_count >= 0)
      )
        throw new ApiError({
          status: 404,
          messageText: `元々査定されていない商品を指定しています`,
        });
    }

    await API.transaction(
      async (tx) => {
        //顧客カートの内容を作っていく
        //一度削除する

        await tx.transaction_Customer_Cart.deleteMany({
          where: {
            transaction_id: transactionInfo.id,
          },
        });

        const newCarts = carts.map((e) => {
          const originalCart = transactionInfo.transaction_carts.find(
            (originalCart) =>
              originalCart.product_id == e.product_id &&
              originalCart.unit_price == e.unit_price &&
              originalCart.discount_price == e.discount_price,
          );

          return {
            transaction_id: transactionInfo.id,
            product_id: e.product_id,
            item_count: e.item_count,
            unit_price: e.unit_price,
            discount_price: e.discount_price,
            original_item_count: originalCart!.item_count,
          } as Transaction_Customer_Cart;
        });

        logService.core.add('変更後のカート');
        logService.core.addJson({
          newCarts,
        });

        //挿入する
        const createResult = await tx.transaction_Customer_Cart.createMany({
          data: newCarts,
        });

        return createResult;
      },
      {
        maxWait: 5 * 1000, // default: 2000
        timeout: 6 * 60 * 1000, // タイムアウトは6分（決済が5分のため）
      },
    );

    logService.core.add('完了');
    await logService.core.save();

    return API.status(200).response({
      msgContent: ResponseMsgKind.updated,
    });
  },
);
