import { $Enums } from '@prisma/client';

export interface ConditionOptionAPI {
  createConditionOption: {
    request: {
      storeId: number;
      itemCategoryId: number; // 指定できるの時は'カード'のみ
      displayName: string;
      description?: string;
      handle?: $Enums.ConditionOptionHandle;
      orderNumber?: number;
      rateVariants: [
        {
          autoSellPriceAdjustment: string; // 販売価格調整
          autoBuyPriceAdjustment: string; // 買取価格調整
          groupId?: number; // グループID
          genreId?: number; // ジャンルID
        },
      ];
    };
    response: {
      id: number;
    };
  };
  updateConditionOption: {
    request: {
      id?: number;
      storeId: number;
      itemCategoryId: number;
      displayName?: string;
      handle?: $Enums.ConditionOptionHandle | null;
      description?: string;
      orderNumber?: number;
      rateVariants?: [
        {
          autoSellPriceAdjustment: string; // 販売価格調整
          autoBuyPriceAdjustment: string; // 買取価格調整
          groupId?: number; // グループID
          genreId?: number; // ジャンルID
        },
      ];
    };
    response: {
      id: number;
    };
  };
  deleteConditionOption: {
    request: {
      id: number;
      storeId: number;
      itemCategoryId: number;
    };
    response: {
      ok: string;
    };
  };
  listConditionOptions: {
    request: {
      storeId: number;
    };
    response: {
      id: number;
    };
  };
}
