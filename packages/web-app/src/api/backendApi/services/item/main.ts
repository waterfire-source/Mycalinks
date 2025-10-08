import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Item } from '@prisma/client';
import { BackendCoreItemService } from 'backend-core';

/**
 * API側で使う商品マスタ系のサービス
 */
export class BackendApiItemService extends BackendApiService {
  declare core: BackendCoreItemService;

  constructor(API: BackendAPI<any>, itemId?: Item['id']) {
    super(API);
    this.setIds({
      itemId,
    });
    this.addCore(new BackendCoreItemService());
  }
}
