import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Contract } from '@prisma/client';
import { BackendCoreContractService } from 'backend-core';

/**
 * API側で使う契約サービス
 */
export class BackendApiContractService extends BackendApiService {
  declare core: BackendCoreContractService;

  constructor(API: BackendAPI<any>, specificContractId?: Contract['id']) {
    super(API);
    this.addCore(new BackendCoreContractService());
    this.setIds({
      contractId: specificContractId,
    });
  }
}
