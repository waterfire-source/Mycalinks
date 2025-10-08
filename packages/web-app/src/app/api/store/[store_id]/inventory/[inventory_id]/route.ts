import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { InventoryStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';

//棚卸を削除（キャンセル）することができるAPI

export const DELETE = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, inventory_id } = API.params;

    //存在しているか確認
    const currentInventoryInfo = await API.db.inventory.findUnique({
      where: {
        store_id: parseInt(store_id),
        id: parseInt(inventory_id),
      },
    });

    if (!currentInventoryInfo) throw new ApiError('notExist');

    //ステータスが下書き中かどうかを確認する
    if (currentInventoryInfo.status != InventoryStatus.DRAFT)
      throw new ApiError({
        status: 400,
        messageText: 'すでに完了した棚卸は削除できません',
      });

    //削除する
    await API.db.inventory.delete({
      where: {
        id: currentInventoryInfo.id,
      },
    });

    return API.status(200).response({
      msgContent: '削除に成功しました',
    });
  },
);
