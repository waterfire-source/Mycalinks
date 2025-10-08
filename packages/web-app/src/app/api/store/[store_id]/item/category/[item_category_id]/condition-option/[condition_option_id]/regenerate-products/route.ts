// 特定の状態の在庫を作る（不具合などにより追加できてなかった時用）

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { regenerateConditionOptionProductsApi } from 'api-generator';

export const POST = BackendAPI.create(
  regenerateConditionOptionProductsApi,
  async (API, { params }) => {
    const { store_id, item_category_id, condition_option_id } = params;

    //存在確認
    const thisConditionOptionInfo =
      await API.db.item_Category_Condition_Option.findUnique({
        where: {
          item_category: {
            id: item_category_id,
            store_id,
          },
          id: condition_option_id,
        },
      });

    if (!thisConditionOptionInfo) throw new ApiError('notExist');

    const ds = new BackendApiDepartmentService(API);
    await ds.core.addConditionOption(thisConditionOptionInfo.id);
  },
);
