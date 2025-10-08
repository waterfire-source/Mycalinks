import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Inventory_Shelf } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//棚卸の棚を登録・更新することができるAPI

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
      id, //任意の棚ID
      display_name, //棚の名前
      order_number, //並び順
    } = API.body;

    //display_nameは必要
    API.checkField(['display_name'], true);

    let shelfInfo: Inventory_Shelf | null = null;

    shelfInfo = await API.transaction(async (tx) => {
      let currentShelfInfo: Inventory_Shelf | null = null;

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentShelfInfo = await tx.inventory_Shelf.findUnique({
          where: {
            store_id: parseInt(store_id),
            id,
            is_deleted: false,
          },
        });

        if (!currentShelfInfo) throw new ApiError('notExist');
      }

      //作成する
      const updateResult = await tx.inventory_Shelf.upsert({
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
          order_number,
        },
        update: {
          display_name,
          order_number,
        },
      });

      return updateResult;
    });

    return API.status(id ? 200 : 201).response({
      data: { id: shelfInfo.id },
    });
  },
);

//条件を指定して、棚卸の情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const whereQuery: any = {};

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery[prop] = parseInt(value || '0');
          break;
      }
    });

    let shelfs: any = [];

    const { store_id } = API.params;

    const selectResult = await API.db.inventory_Shelf.findMany({
      where: {
        ...whereQuery,
        store_id: parseInt(store_id || ''),
        is_deleted: false, //論理削除されていないものだけ
      },
      orderBy: [
        {
          order_number: 'asc',
        },
        {
          id: 'desc',
        },
      ],
    });

    shelfs = selectResult;

    return API.status(200).response({
      data: {
        shelfs,
      },
    });
  },
);
