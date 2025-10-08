import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { Item_Category } from '@prisma/client';
import {
  createOrUpdateItemCategoryApi,
  getItemCategoryApi,
} from 'api-generator';

//商品種別取得
export const GET = BackendAPI.create(
  getItemCategoryApi,
  async (API, { params, query }) => {
    const itemCategories = await API.db.item_Category.findMany({
      where: {
        store_id: params.store_id,
        deleted: false,
      },
      include: {
        condition_options: {
          include: {
            ...(query.includesCount
              ? {
                  _count: {
                    select: {
                      products: true,
                    },
                  },
                }
              : null),
            rate_variants: true,
          },
          orderBy: {
            order_number: 'asc',
          },
        },
        groups: true,
      },
      orderBy: {
        order_number: 'asc',
      },
    });

    //論理削除されているcondition_optionsを除外する
    itemCategories.forEach((category) => {
      category.condition_options = category.condition_options.filter(
        (option) => !option.deleted,
      );

      category.condition_options.forEach((option) => {
        if (!option._count) {
          //@ts-expect-error becuase of because of
          option._count = {
            products: 0,
          };
        }
      });
    });

    return {
      itemCategories,
    };
  },
);

//商品種別作成・更新API
export const POST = BackendAPI.create(
  createOrUpdateItemCategoryApi,
  async (API, { params, body }) => {
    const { id, display_name, hidden, order_number } = body;

    return await API.transaction(async (tx) => {
      let currentCategoryInfo: Item_Category | null = null;

      let result: Item_Category;

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentCategoryInfo = await tx.item_Category.findUnique({
          where: {
            store_id: params.store_id,
            id,
          },
        });

        if (!currentCategoryInfo) throw new ApiError('notExist');

        //ここで更新する
        result = await tx.item_Category.update({
          where: {
            id: id ?? 0,
          },
          data: {
            display_name,
            hidden,
            order_number,
          },
        });
      } else {
        //新規作成だったら名前が必要
        API.checkField(['display_name'], true);

        //ここで作成する
        const departmentModel = new BackendApiDepartmentService(
          API,
          params.store_id,
        );
        const { condition_options, ...createRes } =
          await departmentModel.core.createCategory({
            display_name: display_name!,
          });

        result = createRes;
      }

      return result;
    });
  },
);
