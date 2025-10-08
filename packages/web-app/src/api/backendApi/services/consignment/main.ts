import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendCoreConsignmentService } from 'backend-core';

/**
 * API側で使う委託サービス
 */
export class BackendApiConsignmentService extends BackendApiService {
  declare core: BackendCoreConsignmentService;

  constructor(API: BackendAPI<any>) {
    super(API);
    this.addCore(new BackendCoreConsignmentService());
  }
}
