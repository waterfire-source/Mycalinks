// 顧客の予約受付情報を取得する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiReservationService } from '@/api/backendApi/services/reservation/main';
import {
  Customer,
  Prisma,
  ReservationReceptionProductStatus,
  ReservationStatus,
} from '@prisma/client';
import {
  ApiResponse,
  createCustomerReservationReceptionApi,
  getCustomerReservationReceptionApi,
} from 'api-generator';

export const GET = BackendAPI.create(
  getCustomerReservationReceptionApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.CustomerWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'customer_id':
          whereInput.push({
            id: value as Customer['id'],
          });
          break;

        case 'customer_name': {
          whereInput.push({
            OR: [
              {
                full_name: {
                  contains: value as string,
                },
              },
              {
                full_name_ruby: {
                  contains: value as string,
                },
              },
            ],
          });
          break;
        }
      }
    });

    const selectRes = await API.db.customer.findMany({
      where: {
        AND: whereInput,
        store_id: params.store_id,
        reservation_reception_products: {
          some: {
            status: ReservationReceptionProductStatus.DEPOSITED,
            reservation_id: query.reservation_id, //予約IDで絞る時
            reservation_reception_id: query.reservation_reception_id, //受付のIDで絞る時
          },
        },
      },
      include: {
        reservation_reception_products: {
          include: {
            reservation: {
              include: {
                product: {
                  include: {
                    specialty: {
                      select: {
                        display_name: true,
                      },
                    },
                    condition_option: {
                      select: {
                        display_name: true,
                      },
                    },
                    item: true,
                  },
                },
              },
            },
            deposit_transaction_cart: {
              select: {
                transaction_id: true,
              },
            },
          },
        },
      },
      ...API.limitQuery,
    });

    selectRes.forEach((customer) => {
      customer.reservation_reception_products =
        customer.reservation_reception_products.filter((e) => {
          const isDeposited =
            e.status === ReservationReceptionProductStatus.DEPOSITED;
          if (query.reservation_id && query.reservation_reception_id) {
            return (
              isDeposited &&
              e.reservation_id === query.reservation_id &&
              e.reservation_reception_id === query.reservation_reception_id
            );
          }

          if (query.reservation_id) {
            return isDeposited && e.reservation_id === query.reservation_id;
          }

          if (query.reservation_reception_id) {
            return (
              isDeposited &&
              e.reservation_reception_id === query.reservation_reception_id
            );
          }

          return isDeposited;
        });

      customer.reservation_reception_products.forEach((e) => {
        const productService = new BackendApiProductService(API);

        //@ts-expect-error because of api-generator
        e.reservation.product.displayNameWithMeta =
          productService.core.getProductNameWithMeta(e.reservation.product);
      });
    });

    return {
      //@ts-expect-error because of api-generator
      customers: selectRes as ApiResponse<
        typeof getCustomerReservationReceptionApi
      >['customers'],
    };
  },
);
// 顧客の予約を作成する

export const POST = BackendAPI.create(
  createCustomerReservationReceptionApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let { customer_id, reservations } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //この顧客の情報を取得
    const customerInfo = await API.db.customer.findUnique({
      where: {
        id: customer_id,
        store_id,
      },
    });

    if (!customerInfo) throw new ApiError('notExist');

    //指定されている予約の情報を取得する
    const allReservations = await API.db.reservation.findMany({
      where: {
        id: {
          in: reservations.map((e) => e.reservation_id),
        },
        store_id,
        status: ReservationStatus.OPEN,
      },
      include: {
        receptions: true,
      },
    });

    //一つ一つ確認する
    for (const reservation of reservations) {
      //この予約があるか確認
      const thisReservationInfo = allReservations.find(
        (e) => e.id === reservation.reservation_id,
      );

      if (!thisReservationInfo) throw new ApiError('notExist');

      //この予約が取れそうか確認
      const reservationService = new BackendApiReservationService(
        API,
        thisReservationInfo.id,
      );
      await reservationService.core.getAvailableMargin({
        customerId: customer_id,
        itemCount: reservation.item_count,
      });
    }

    //予約を作成する
    const createRes = await API.db.reservation_Reception.create({
      data: {
        customer_id,
        staff_account_id,
        products: {
          create: reservations.map((e) => ({
            ...e,
            customer_id,
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return createRes;
  },
);
