// メッセージセンター取得

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { ApiResponse, getEcMessageCenterApi } from 'api-generator';

export const GET = BackendAPI.create(getEcMessageCenterApi, async (API) => {
  const whereInput: Array<Prisma.Ec_Message_CenterWhereInput> = [];

  whereInput.push({
    myca_user_id: API.mycaUser!.id,
  });

  let includesContent = false;

  // クエリパラメータを見ていく
  await API.processQueryParams((key, value) => {
    switch (key) {
      case 'id':
        whereInput.push({
          id: value as number,
        });
        includesContent = true;
        break;
    }
  });

  const selectRes = (await API.db.ec_Message_Center.findMany({
    where: {
      AND: whereInput,
    },
    include: {
      order_store: {
        select: {
          code: true,
          store: {
            select: {
              display_name: true,
            },
          },
        },
      },
    },
    omit: {
      content: !includesContent,
    },
    orderBy: {
      id: 'desc',
    },
    ...API.limitQuery,
  })) as ApiResponse<typeof getEcMessageCenterApi>['messageCenters'];

  return {
    messageCenters: selectRes,
  };
});
