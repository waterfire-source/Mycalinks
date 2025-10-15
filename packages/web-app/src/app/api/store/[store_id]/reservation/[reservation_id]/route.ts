// 予約の更新・削除

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { ReservationStatus } from '@prisma/client';
import { deleteReservationApi, updateReservationApi } from 'api-generator';

export const PUT = BackendAPI.create(
  updateReservationApi,
  async (API, { params, body }) => {
    //この予約の情報を取得する
    const thisReservationInfo = await API.db.reservation.findUnique({
      where: {
        id: params.reservation_id,
        store_id: params.store_id,
        status: {
          not: ReservationStatus.FINISHED,
        },
      },
    });

    if (!thisReservationInfo) {
      throw new ApiError({
        status: 404,
        messageText: '予約が見つかりません',
      });
    }

    //status以外については開始前のみ更新できる
    if (thisReservationInfo.status != ReservationStatus.NOT_STARTED) {
      API.checkField(['status']);
    }

    //更新する
    const updateRes = await API.db.reservation.update({
      where: {
        id: params.reservation_id,
      },
      data: body,
    });

    return updateRes;
  },
);
// 予約の削除

export const DELETE = BackendAPI.create(
  deleteReservationApi,
  async (API, { params }) => {
    const thisReservationInfo = await API.db.reservation.findUnique({
      where: {
        id: params.reservation_id,
        store_id: params.store_id,
        status: ReservationStatus.NOT_STARTED,
      },
    });

    if (!thisReservationInfo) {
      throw new ApiError({
        status: 404,
        messageText: '予約が見つかりません',
      });
    }

    await API.db.reservation.delete({
      where: {
        id: params.reservation_id,
      },
    });
  },
);
