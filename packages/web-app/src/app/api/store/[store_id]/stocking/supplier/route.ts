import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//条件を指定して、仕入れの情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };
    const API = await BackendAPI.setUp(req, params, apiDef);

    const whereQuery: any = [];

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'enabled':
          whereQuery.push({
            enabled: value == 'true' ? true : false,
          });
          break;

        case 'id':
          whereQuery.push({
            [prop]: parseInt(value || '0'),
          });

          break;

        case 'display_name': //商品マスタと商品それぞれのdisplay_nameで検索
          whereQuery.push({
            OR: [
              {
                display_name: {
                  contains: value,
                },
              },
              {
                staff_name: {
                  contains: value,
                },
              },
              {
                description: {
                  contains: value,
                },
              },
              {
                building: {
                  contains: value,
                },
              },
            ],
          });

          break;
      }
    });

    let result: any = [];

    const { store_id } = API.params;

    const { skip, take } = API.query;

    const selectResult = await API.db.supplier.findMany({
      where: {
        AND: [
          {
            store_id: parseInt(store_id || '0'),
            deleted: false,
          },
          ...whereQuery,
        ],
      },
      orderBy: [
        {
          order_number: 'asc',
        },
        {
          id: 'desc',
        },
      ],
      skip: parseInt(skip || '0') || undefined,
      take: take == '-1' ? undefined : take ? parseInt(take) : 500, //何も指定がない場合は500個制限
    });

    result = selectResult;

    return API.status(200).response({ data: result });
  },
);
//仕入れ先を登録するAPI IDを指定することで更新することもできる
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: ['list_stocking_supplier'], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      id,
      display_name,
      zip_code,
      prefecture,
      city,
      address2,
      building,
      phone_number,
      fax_number,
      email,
      staff_name,
      order_number,
      order_method,
      enabled,
      description,
    } = API.body;

    // その店舗に同じ名前がないかの確認(更新時は自身のIDを除外)
    const duplicate = await API.db.supplier.findUnique({
      where: {
        store_id_display_name: {
          store_id: parseInt(store_id),
          display_name,
        },
        deleted: false,
        NOT: {
          id: parseInt(id || '0'),
        },
      },
    });

    if (duplicate) {
      throw new ApiError({
        status: 400,
        messageText: '同じ名前の仕入れ先が登録されています',
      });
    }

    //IDを指定されていたら更新し、されてなかったら作成する
    //一応所有権を確認する
    if (id) {
      const isExist = await API.db.supplier.findUnique({
        where: {
          id,
          store_id: parseInt(store_id),
          deleted: false,
        },
      });

      if (!isExist) throw new ApiError('notExist');
    }

    //作成か更新
    const createSupplierResult = await API.db.supplier.upsert({
      where: {
        id: parseInt(id || '0'),
      },
      create: {
        store_id: parseInt(store_id),
        display_name,
        zip_code,
        prefecture,
        city,
        address2,
        building,
        phone_number,
        fax_number,
        order_method,
        email,
        staff_name,
        order_number,
        enabled,
        description,
      },
      update: {
        display_name,
        zip_code,
        prefecture,
        city,
        address2,
        building,
        phone_number,
        fax_number,
        order_method,
        email,
        staff_name,
        order_number,
        enabled,
        description,
      },
    });

    return API.status(id ? 200 : 201).response({ data: createSupplierResult });
  },
);
