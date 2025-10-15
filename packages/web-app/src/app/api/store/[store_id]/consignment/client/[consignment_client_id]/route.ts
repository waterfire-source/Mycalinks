// 委託主削除

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteConsignmentClientApi } from 'api-generator';
import { customDayjs } from 'common';

export const DELETE = BackendAPI.create(
  deleteConsignmentClientApi,
  async (API, { params }) => {
    const currentInfo = await API.db.consignment_Client.findUnique({
      where: {
        store_id: params.store_id,
        id: params.consignment_client_id,
        deleted: false,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    await API.db.consignment_Client.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        deleted: true,
        full_name: `${currentInfo.full_name}_削除済み_${customDayjs()
          .tz()
          .format('YYYYMMDD')}`,
      },
    });
  },
);
