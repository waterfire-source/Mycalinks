import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Store_Shipment } from '@prisma/client';
import { BackendCoreStoreShipmentService } from 'backend-core';

/**
 * API側で使うStoreShipmentサービス
 */
export class BackendApiStoreShipmentService extends BackendApiService {
  declare core: BackendCoreStoreShipmentService;

  constructor(
    API: BackendAPI<any>,
    specificStoreShipmentId?: Store_Shipment['id'],
  ) {
    super(API);
    this.addCore(new BackendCoreStoreShipmentService());
    this.setIds({
      storeShipmentId: specificStoreShipmentId,
    });
  }
}
