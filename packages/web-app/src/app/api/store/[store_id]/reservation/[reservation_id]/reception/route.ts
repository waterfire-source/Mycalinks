// 予約の受付を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { ReservationReceptionProductStatus } from '@prisma/client';
import { getReservationReceptionApi } from 'api-generator';

export const GET = BackendAPI.create(
  getReservationReceptionApi,
  async (API, { params, query }) => {
    const selectRes = await API.db.reservation_Reception_Product.findMany({
      where: {
        reservation_id: params.reservation_id,
        reservation: {
          store_id: params.store_id,
        },
        status: {
          //まだ前金を払っていないものや取り消しされたものは表示しない
          notIn: [
            ReservationReceptionProductStatus.CREATED,
            ReservationReceptionProductStatus.CANCELLED,
          ],
        },
      },
      include: {
        ...(query.includesCustomerInfo
          ? {
              customer: true,
            }
          : null),
      },
    });

    return {
      receptions: selectRes,
    };
  },
);
