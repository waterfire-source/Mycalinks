import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma, Set_Deal, SetDealStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSetDealService } from '@/api/backendApi/services/setDeal/main';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

//セット販売定義を作るAPI
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      id, //既存のセット販売ID

      // staff_account_id,
      display_name,
      discount_amount,
      expire_at,
      start_at,
      products,
      image_url,
    } = API.body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //productsの中にitem_countが0のものがある場合はエラー
    if (products.some((each: any) => each.item_count <= 0)) {
      throw new ApiError({
        status: 400,
        messageText: 'セット販売定義の数量は0以下にできません',
      });
    }

    let setDealInfo: Set_Deal | null = null;

    setDealInfo = await API.transaction(async (tx) => {
      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        const currentSetDealInfo = await tx.set_Deal.findUnique({
          where: {
            store_id: parseInt(store_id),
            id,
            status: {
              not: SetDealStatus.DELETED,
            },
          },
        });

        if (!currentSetDealInfo) throw new ApiError('notExist');

        //productsが入っているなら、一度既存のものを削除
        if (products) {
          await tx.set_Deal_Product.deleteMany({
            where: {
              set_deal_id: id,
            },
          });
        }
      } else {
        //指定されていない場合、ちゃんと情報が足りてるか確認
        API.checkField(
          ['display_name', 'discount_amount', 'products', 'start_at'],
          true,
        );
      }

      const accountModel = new BackendApiAccountService(API);

      //作成する
      const updateResult = await tx.set_Deal.upsert({
        where: {
          id: parseInt(id) || 0,
        },
        create: {
          store: {
            connect: {
              id: parseInt(store_id),
            },
          },
          display_name,
          discount_amount,
          staff_account: await accountModel.getStaffQuery(),
          expire_at: expire_at ? new Date(expire_at) : null,
          start_at: new Date(start_at),
          image_url,
          products: {
            //商品の定義
            create: (products || []).map((each: any) => ({
              product: {
                connect: {
                  id: each.product_id,
                  store_id: parseInt(store_id),
                },
              },
              item_count: each.item_count,
            })),
          },
        },
        update: {
          display_name,
          discount_amount,
          staff_account: await accountModel.getStaffQuery(),
          expire_at: expire_at ? new Date(expire_at) : null,
          start_at: start_at ? new Date(start_at) : undefined,
          image_url,
          products: {
            //商品の定義
            create: (products || []).map((each: any) => ({
              product: {
                connect: {
                  id: each.product_id,
                  store_id: parseInt(store_id),
                },
              },
              item_count: each.item_count,
            })),
          },
        },
      });

      return updateResult;
    });

    //ステータスを更新する
    const setDealService = new BackendApiSetDealService(API);
    await setDealService.core.updateStatus({ storeId: Number(store_id) });

    return API.status(id ? 200 : 201).response({ data: setDealInfo });
  },
);
//セット販売を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const whereQuery: Prisma.Set_DealWhereInput = {};

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery.id = parseInt(value || '0');
          break;
        case 'status':
          whereQuery.status = {
            in: value.split(','),
          };
          break;
      }
    });

    //取得する
    const set_deals = await API.db.set_Deal.findMany({
      where: {
        ...whereQuery,
        store_id: parseInt(store_id),
        // status: {
        //   not: SetDealStatus.DELETED,
        // }, //論理削除されててもOK
      },
      include: {
        products: true,
      },
    });

    return API.status(200).response({ data: { set_deals } });
  },
);
