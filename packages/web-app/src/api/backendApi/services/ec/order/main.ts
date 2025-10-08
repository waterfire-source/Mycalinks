import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Ec_Order } from '@prisma/client';
import { BackendCoreEcOrderService } from 'backend-core';

/**
 * ECの注文サービス
 */
export class BackendApiEcOrderService extends BackendApiService {
  constructor(API: BackendAPI<any>, orderId?: Ec_Order['id']) {
    super(API);
    this.addCore(new BackendCoreEcOrderService(orderId));
  }

  declare public targetObject?: Ec_Order;

  declare core: BackendCoreEcOrderService;
}
