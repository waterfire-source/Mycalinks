import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, Specialty, SpecialtyKind } from '@prisma/client';
import { createOrUpdateSpecialtyApi, getSpecialtyApi } from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateSpecialtyApi,
  async (API, { params, body }) => {
    const { store_id } = params;
    const { id, display_name, kind, order_number, handle } = body;

    let currentInfo: Specialty | null = null;

    if (id) {
      currentInfo = await API.db.specialty.findUnique({
        where: {
          id,
          store_id,
          deleted: false,
        },
      });

      if (!currentInfo) {
        throw new ApiError('notExist');
      }
    } else {
      //新規作成時は名前が必須
      if (!display_name) {
        throw new ApiError('invalidParameter');
      }
    }

    const upsertRes = await API.db.specialty.upsert({
      where: {
        id: currentInfo?.id ?? 0,
        store_id,
      },
      update: {
        display_name,
        order_number,
        handle,
      },
      create: {
        store_id,
        display_name: display_name!,
        kind,
        order_number: order_number ?? 1,
        handle,
      },
    });

    return upsertRes;
  },
);

export const GET = BackendAPI.create(
  getSpecialtyApi,
  async (API, { params }) => {
    const { store_id } = params;

    const whereInput: Array<Prisma.SpecialtyWhereInput> = [];

    await API.processQueryParams(async (prop, value) => {
      switch (prop) {
        case 'kind':
          whereInput.push({ kind: value as SpecialtyKind });
          break;
        case 'id':
          whereInput.push({ id: value as Specialty['id'] });
          break;
      }
    });

    const selectRes = await API.db.specialty.findMany({
      where: {
        AND: whereInput,
        store_id,
        deleted: false,
      },
      orderBy: {
        order_number: 'asc',
      },
    });

    return { specialties: selectRes };
  },
);
