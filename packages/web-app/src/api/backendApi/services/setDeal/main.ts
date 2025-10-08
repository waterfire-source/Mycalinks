import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendCoreSetDealService } from 'backend-core';

/**
 * API側で使うSetDealサービス
 */
export class BackendApiSetDealService extends BackendApiService {
  declare core: BackendCoreSetDealService;

  constructor(API: BackendAPI<any>) {
    super(API);
    this.addCore(new BackendCoreSetDealService());
    // this.setIds({
    //   registerId: specificRegisterId,
    // });
  }
}
