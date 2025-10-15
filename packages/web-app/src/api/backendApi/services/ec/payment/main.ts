import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Ec_Order } from '@prisma/client';
import { BackendCoreEcPaymentService } from 'backend-core';

/**
 * ECの決済サービス
 */
export class BackendApiEcPaymentService extends BackendApiService {
  constructor(API: BackendAPI<any>, ecOrderId?: Ec_Order['id']) {
    super(API);
    this.addCore(new BackendCoreEcPaymentService(ecOrderId));
  }

  declare core: BackendCoreEcPaymentService;
}
