//予約受付を取得するやつ
//Mycaユーザー必須
// Mycaユーザー自身の予約受付情報を取得

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { Prisma, ReservationReceptionProductStatus } from '@prisma/client';
import { getReservationReceptionByMycaUserApi } from 'api-generator';

export const GET = BackendAPI.create(
  getReservationReceptionByMycaUserApi,
  async (API) => {
    const whereInput: Array<Prisma.Reservation_Reception_ProductWhereInput> =
      [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'store_id':
          whereInput.push({
            reservation: {
              [key]: value as number,
            },
          });
          break;
      }
    });

    const selectRes = await API.db.reservation_Reception_Product.findMany({
      where: {
        AND: whereInput,
        status: ReservationReceptionProductStatus.DEPOSITED, //前金を払って、まだ受け取りをしてないやつのみ
        customer: {
          myca_user_id: API.mycaUser!.id,
        },
      },
      select: {
        id: true,
        item_count: true,
        reservation: {
          select: {
            store_id: true,
            product: {
              select: {
                id: true,
                image_url: true,
                item: {
                  select: {
                    release_date: true,
                    rarity: true,
                    expansion: true,
                    cardnumber: true,
                  },
                },
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                management_number: true,
                display_name: true,
              },
            },
            deposit_price: true,
            remaining_price: true,
            description: true,
          },
        },
      },
      ...API.limitQuery,
    });

    //商品名
    selectRes.forEach((rp) => {
      const productService = new BackendApiProductService(API);
      //@ts-expect-error because of api-generator
      rp.reservation.product.displayNameWithMeta =
        productService.core.getProductNameWithMeta(rp.reservation.product);
    });

    return {
      reservationReceptionProducts: selectRes,
    };
  },
);
