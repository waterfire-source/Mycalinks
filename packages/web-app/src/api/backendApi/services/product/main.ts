import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Prisma, Product } from '@prisma/client';
import { BackendCoreProductService } from 'backend-core';
import { posCommonConstants } from 'common';

/**
 * API側で使うProductサービス
 */
export class BackendApiProductService extends BackendApiService {
  declare core: BackendCoreProductService;

  constructor(API: BackendAPI<any>, specificProductId?: Product['id']) {
    super(API);
    this.addCore(new BackendCoreProductService());
    this.setIds({
      productId: specificProductId,
    });
  }

  /**
   * 検索クエリ
   */
  public getDisplayNameSearchQuery(value: string) {
    if (!value) return {};

    return {
      OR: [
        !isNaN(Number(value)) && {
          id: Number(value || 0) - posCommonConstants.productCodePrefix,
        },
        {
          item: {
            search_keyword: {
              contains: value,
            },
          },
        },
        {
          display_name: {
            contains: value,
          },
        },
      ].filter(Boolean),
    } as Prisma.ProductWhereInput;
  }
}
