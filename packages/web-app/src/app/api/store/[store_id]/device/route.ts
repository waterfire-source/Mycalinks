// デバイス（親機）を登録

import { BackendAPI } from '@/api/backendApi/main';
import { DeviceType, Prisma } from '@prisma/client';
import { getDeviceApi, registerDeviceApi } from 'api-generator';

export const POST = BackendAPI.create(
  registerDeviceApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let { type } = body;

    const txResult = await API.transaction(async (tx) => {
      //既存のやつを削除しつつ、作成する
      await tx.device.deleteMany({
        where: {
          store_id,
          type,
        },
      });

      const createRes = await tx.device.create({
        data: {
          store_id,
          type,
        },
      });

      return createRes;
    });

    return txResult;
  },
);

// デバイスを取得

export const GET = BackendAPI.create(getDeviceApi, async (API, { params }) => {
  const whereInput: Array<Prisma.DeviceWhereInput> = [];

  // クエリパラメータを見ていく
  await API.processQueryParams((key, value) => {
    switch (key) {
      case 'type':
        whereInput.push({
          [key]: value as DeviceType,
        });
    }
  });

  const selectRes = await API.db.device.findMany({
    where: {
      AND: whereInput,
      store_id: params.store_id,
    },
  });

  return {
    devices: selectRes,
  };
});
