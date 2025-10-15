import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { BackendCoreSaleService } from 'backend-core';

/**
 * API側で使うSaleサービス
 */
export class BackendApiSaleService extends BackendApiService {
  declare core: BackendCoreSaleService;

  constructor(API: BackendAPI<any>) {
    super(API);
    this.addCore(new BackendCoreSaleService());
    // this.setIds({
    //   registerId: specificRegisterId,
    // });
  }
}
