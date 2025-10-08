// 委託主を作成・更新する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiConsignmentService } from '@/api/backendApi/services/consignment/main';
import { Consignment_Client, Prisma } from '@prisma/client';
import {
  createOrUpdateConsignmentClientApi,
  getConsignmentClientApi,
} from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateConsignmentClientApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let {
      id,
      full_name,
      zip_code,
      prefecture,
      city,
      address2,
      building,
      phone_number,
      fax_number,
      email,
      commission_cash_price,
      commission_card_price,
      commission_payment_method,
      payment_cycle,
      description,
      enabled,
      display_name_on_receipt,
      bank_info_json,
      display_name,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    if (id) {
      const currentInfo = await API.db.consignment_Client.findUnique({
        where: {
          id,
          store_id,
          deleted: false,
        },
      });

      if (!currentInfo) throw new ApiError('notExist');

      API.checkField([
        'full_name',
        'zip_code',
        'prefecture',
        'city',
        'address2',
        'building',
        'phone_number',
        'fax_number',
        'email',
        'commission_payment_method',
        'payment_cycle',
        'description',
        'enabled',
        'display_name_on_receipt',
        'bank_info_json',
        'id',
        'commission_card_price',
        'commission_cash_price',
        'display_name',
      ]);
    } else {
      //新規作成の時に必要な情報
      API.checkField(
        [
          'full_name',
          'commission_card_price',
          'commission_cash_price',
          'commission_payment_method',
        ],
        true,
      );
    }

    const createItemRes = await API.db.consignment_Client.upsert({
      where: {
        id: id ?? 0,
      },
      create: {
        full_name: full_name!,
        store_id,
        zip_code,
        prefecture,
        city,
        address2,
        building,
        phone_number,
        fax_number,
        email,
        commission_cash_price: commission_cash_price!,
        commission_card_price: commission_card_price!,
        commission_payment_method: commission_payment_method!,
        payment_cycle,
        description,
        enabled,
        display_name_on_receipt,
        bank_info_json,
        display_name,
      },
      update: {
        full_name,
        zip_code,
        prefecture,
        city,
        address2,
        building,
        phone_number,
        fax_number,
        email,
        commission_payment_method,
        commission_card_price,
        commission_cash_price,
        payment_cycle,
        description,
        enabled,
        display_name_on_receipt,
        bank_info_json,
        display_name,
      },
    });

    return createItemRes;
  },
);

// 委託主取得

export const GET = BackendAPI.create(
  getConsignmentClientApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Consignment_ClientWhereInput> = [];

    //POSユーザーじゃないと弾く
    if (!API.user?.id || !API.resources.corporation?.id) {
      throw new ApiError('permission');
    }

    //同法人内であれば取得できる
    whereInput.push({
      store: {
        accounts: {
          every: {
            account: {
              linked_corporation_id: API.resources.corporation.id,
            },
          },
        },
      },
    });

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'enabled':
          whereInput.push({
            [key]: value as Consignment_Client['enabled'],
          });
          break;
        case 'productName':
          whereInput.push({
            products: {
              some: {
                display_name: { contains: value as string },
              },
            },
          });
          break;
        case 'consignment_client_full_name':
          whereInput.push({
            full_name: {
              contains: value as string,
            },
          });
          break;
      }
    });

    const [selectRes, totalCount] = await Promise.all([
      API.db.consignment_Client.findMany({
        where: {
          AND: whereInput,
          deleted: false,
          store_id: params.store_id,
        },
        ...API.limitQuery,
      }),
      query.includesSummary
        ? API.db.consignment_Client.count({
            where: {
              AND: whereInput,
              deleted: false,
              store_id: params.store_id,
            },
          })
        : 0,
    ]);

    const consignmentService = new BackendApiConsignmentService(API);

    const consignmentClients = await Promise.all(
      selectRes.map(async (client) => {
        const [productStats, transactionStats] = await Promise.all([
          consignmentService.core.getProductStats({
            consignmentClientId: client.id,
          }),
          consignmentService.core.getTransactionStats({
            product: {
              consignment_client_id: client.id,
            },
          }),
        ]);

        return {
          ...client,
          summary: {
            totalSalePrice: transactionStats.totalSalePrice,
            totalSaleItemCount: transactionStats.totalSaleItemCount,
            totalStockNumber: productStats.totalStockNumber,
            totalCommissionPrice: transactionStats.totalCommissionPrice,
          },
        };
      }),
    );

    return {
      consignmentClients,
      summary: {
        totalCount,
      },
    };
  },
);
