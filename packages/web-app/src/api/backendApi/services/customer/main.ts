import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Customer } from '@prisma/client';
import { BackendCoreCustomerService } from 'backend-core';

/**
 * API側で使うCustomerサービス
 */
export class BackendApiCustomerService extends BackendApiService {
  declare core: BackendCoreCustomerService;

  constructor(API: BackendAPI<any>, specificCustomerId?: Customer['id']) {
    super(API);
    this.addCore(new BackendCoreCustomerService());
    this.setIds({
      customerId: specificCustomerId,
    });
  }
}
