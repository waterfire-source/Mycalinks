//請求先の作成、取得
// 請求先の作成・更新

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import {
  createOrUpdateBillingClientApi,
  getBillingClientApi,
} from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateBillingClientApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const {
      id,
      display_name,
      zip_code,
      prefecture,
      city,
      address2,
      building,
      phone_number,
      fax_number,
      email,
      staff_name,
      payment_method,
      description,
      order_number,
      enabled,
      deleted,
    } = body;

    if (id) {
      const alreadyInfo = await API.db.billing_Client.findUnique({
        where: {
          id,
          store_id,
          deleted: false,
        },
      });

      if (!alreadyInfo) throw new ApiError('notExist');
    } else {
      //新規作成の時に必要な情報
      API.checkField(['display_name'], true);
    }

    const txRes = await API.transaction(async (tx) => {
      const createRes = await tx.billing_Client.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          display_name: display_name!,
          zip_code,
          prefecture,
          city,
          address2,
          building,
          phone_number,
          fax_number,
          email,
          staff_name,
          payment_method,
          description,
          order_number,
          enabled,
          store_id,
        },
        update: {
          display_name: display_name!,
          zip_code,
          prefecture,
          city,
          address2,
          building,
          phone_number,
          fax_number,
          email,
          staff_name,
          payment_method,
          description,
          order_number,
          enabled,
          deleted,
        },
      });

      return createRes;
    });

    return txRes;
  },
);
// 請求先を取得

export const GET = BackendAPI.create(
  getBillingClientApi,
  async (API, { params }) => {
    const whereInput: Array<Prisma.Billing_ClientWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'enabled':
          whereInput.push({
            [key]: value as boolean,
          });
      }
    });

    const selectRes = await API.db.billing_Client.findMany({
      where: {
        AND: whereInput,
        store_id: params.store_id,
        deleted: false,
      },
    });

    return {
      billingClients: selectRes,
    };
  },
);
