import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Store } from '@prisma/client';
import { BackendCoreStoreService } from 'backend-core';

/**
 * API側で使うRegisterサービス
 */
export class BackendApiStoreService extends BackendApiService {
  declare core: BackendCoreStoreService;

  constructor(API: BackendAPI<any>, specificStoreId?: Store['id']) {
    super(API);
    this.addCore(new BackendCoreStoreService());
    this.setIds({
      storeId: specificStoreId,
    });
  }
}
