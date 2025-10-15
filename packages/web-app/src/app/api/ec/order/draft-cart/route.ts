import { BackendAPI } from '@/api/backendApi/main';
import { Ec_Order, EcOrderCartStoreStatus, Prisma } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { ApiResponse, getEcDraftCartApi } from 'api-generator';

//下書きカートの情報（現在は中の商品数のみ）

//EC顧客側用オーダー取得API
export const GET = BackendAPI.create(
  getEcDraftCartApi,
  async (API, { query }) => {
    const mycaUserId = API.mycaUser?.id;
    // const mycaUserId = 123491; //俺のMycaId

    //ログインしてない場合指定できるフィールドが制限される
    if (!mycaUserId && !query.code) throw new ApiError('invalidParameter');

    const whereInput: Array<Prisma.Ec_OrderWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'code':
          whereInput.push({
            code: value as Ec_Order['code'],
          });
          break;
      }
    }

    const order = await API.db.ec_Order.findFirst({
      where: {
        AND: whereInput,
        myca_user_id: mycaUserId, //ログインしている場合、自分のオーダーしか取得できない
        status: EcOrderCartStoreStatus.DRAFT,
      },
      include: {
        cart_stores: {
          include: {
            products: true,
          },
        },
      },
    });

    //productの合計数を取得
    const result: ApiResponse<typeof getEcDraftCartApi> = {
      order: null,
    };

    if (order) {
      result.order = {
        id: order.id,
        code: order.code,
        totalItemCount: order.cart_stores.reduce(
          (acc, curr) =>
            acc +
            curr.products.reduce(
              (acc, curr) => acc + curr.original_item_count,
              0,
            ),
          0,
        ),
      };
    }

    return result;
  },
);
