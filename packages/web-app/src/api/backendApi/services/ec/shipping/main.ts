import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Shipping_Method } from '@prisma/client';
import { BackendCoreEcShippingService } from 'backend-core';

/**
 * ECの配送方法サービス
 */
export class BackendApiEcShippingService extends BackendApiService {
  constructor(API: BackendAPI<any>, shippingMethodId?: Shipping_Method['id']) {
    super(API);
    this.addCore(new BackendCoreEcShippingService(shippingMethodId));
  }

  declare core: BackendCoreEcShippingService;
}
