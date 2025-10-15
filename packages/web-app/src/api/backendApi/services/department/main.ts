import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Store } from '@prisma/client';
import { BackendCoreDepartmentService } from 'backend-core';

/**
 * API側で使う部門関係のサービス
 */
export class BackendApiDepartmentService extends BackendApiService {
  declare core: BackendCoreDepartmentService;

  constructor(API: BackendAPI<any>, storeId?: Store['id']) {
    super(API);
    this.addCore(new BackendCoreDepartmentService());
    this.setIds({
      storeId,
    });
  }
}
