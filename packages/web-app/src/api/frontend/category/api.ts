import { CustomError } from '@/api/implement';
import {
  createOrUpdateItemCategoryDef,
  deleteItemCategoryDef,
  getItemCategoryDef,
} from '@/app/api/store/[store_id]/item/def';

export interface CategoryAPI {
  getCategoryAll: {
    request: {
      storeID: number;
    };
    response: typeof getItemCategoryDef.response | CustomError;
  };
  createCategory: {
    request: {
      storeID: number;
      displayName: string;
      hidden?: boolean;
    };
    response: typeof createOrUpdateItemCategoryDef.response | CustomError;
  };
  updateCategory: {
    request: {
      storeID: number;
      id?: number;
      displayName?: string;
      hidden?: boolean;
      orderNumber?: number;
    };
    response: typeof createOrUpdateItemCategoryDef.response | CustomError;
  };
  deleteCategory: {
    request: {
      storeID: number;
      categoryID: number;
    };
    response: typeof deleteItemCategoryDef.response | CustomError;
  };
}

// APIのレスポンスの型定義、エラーを抜いている
export interface CategoryAPIRes {
  getCategoryAll: Exclude<typeof getItemCategoryDef.response, CustomError>;
  createOrUpdateCategory: Exclude<
    typeof createOrUpdateItemCategoryDef.response,
    CustomError
  >;
  deleteCategory: Exclude<typeof deleteItemCategoryDef.response, CustomError>;
}
