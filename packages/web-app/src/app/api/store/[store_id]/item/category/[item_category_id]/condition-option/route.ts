import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { createOrUpdateConditionOptionApi } from 'api-generator';
import {
  Item_Category_Condition_Option,
  ItemCategoryHandle,
} from '@prisma/client';

//コンディション選択肢作成・更新API
export const POST = BackendAPI.create(
  createOrUpdateConditionOptionApi,
  async (API, { params, body }) => {
    const {
      id,
      display_name,
      handle,
      description,
      rate_variants,
      order_number,
    } = body;

    const departmentModel = new BackendApiDepartmentService(API);
    await departmentModel.core.getAllItemCategories();

    const txRes = await API.transaction(async (tx) => {
      let currentConditionOptionInfo: Item_Category_Condition_Option | null =
        null;

      //このコンディションを見つける
      const thisConditionInfo = departmentModel.core.allItemCategories?.find(
        (e) => e.id == params.item_category_id,
      );

      if (!thisConditionInfo)
        throw new ApiError({
          status: 404,
          messageText: '指定されたカテゴリが見つかりませんでした',
        });

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentConditionOptionInfo =
          await tx.item_Category_Condition_Option.findUnique({
            where: {
              id,
              item_category: {
                id: thisConditionInfo.id,
              },
            },
          });

        if (!currentConditionOptionInfo) throw new ApiError('notExist');

        //rate_variantsを指定されている場合、一回削除する
        if (rate_variants && Array.isArray(rate_variants)) {
          await tx.condition_Option_Rate.deleteMany({
            where: {
              option_id: currentConditionOptionInfo.id,
            },
          });
        }

        //handleを指定されている場合、これがカードコンディションか判断する
        if (
          handle != undefined &&
          thisConditionInfo.handle != ItemCategoryHandle.CARD
        ) {
          throw new ApiError({
            status: 400,
            messageText:
              'handleの中を変えられるのはカードコンディションだけです',
          });
        }
      } else {
        //新規作成は、カードコンディションじゃないといけない
        if (thisConditionInfo.handle != ItemCategoryHandle.CARD)
          throw new ApiError({
            status: 400,
            messageText:
              '状態選択肢を追加できるのはカードコンディションのみです',
          });
      }

      //作成する
      const updateRes = await tx.item_Category_Condition_Option.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          item_category_id: params.item_category_id,
          display_name: display_name || '',
          order_number,
          description,
          ...(rate_variants && {
            rate_variants: {
              create: rate_variants,
            },
          }),
        },
        update: {
          display_name,
          description,
          handle,
          order_number,
          ...(rate_variants && {
            rate_variants: {
              create: rate_variants,
            },
          }),
        },
        include: {
          rate_variants: true,
        },
      });

      return updateRes;
    });

    //新規作成だったら、このオプションの新しい商品達を非同期で作っていく
    if (!id && txRes.id) {
      //こっち系の非同期処理はSQS使いつつ、重ため処理だったら処理をうまいこと分散させるようにしたい
      await departmentModel.core.addConditionOption(txRes.id);
    }
    //レートを変えてたら、価格の再計算を行う
    else if (rate_variants?.length) {
      await departmentModel.core.recalculateCategoryPrice(
        txRes.item_category_id,
      );
    }

    return txRes;
  },
);
