import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteSpecialtyApi } from 'api-generator';
import { customDayjs } from 'common';

export const DELETE = BackendAPI.create(
  deleteSpecialtyApi,
  async (API, { params }) => {
    const { store_id, specialty_id } = params;

    //[TODO] すでに結びついている在庫があった時どうするのか考える

    //あるか確認
    const currentInfo = await API.db.specialty.findUnique({
      where: {
        id: specialty_id,
        store_id,
        deleted: false,
      },
    });

    if (!currentInfo) {
      throw new ApiError('notExist');
    }

    const deleteRes = await API.db.specialty.update({
      where: { id: specialty_id },
      data: {
        deleted: true,
        display_name: `${currentInfo.display_name}_削除済み_${customDayjs()
          .tz()
          .format('YYYYMMDD')}`,
      },
    });
  },
);
