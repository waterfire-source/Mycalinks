import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Reservation } from '@prisma/client';
import { BackendCoreReservationService } from 'backend-core';

/**
 * API側で使う予約サービス
 */
export class BackendApiReservationService extends BackendApiService {
  declare core: BackendCoreReservationService;

  constructor(API: BackendAPI<any>, specificReservationId?: Reservation['id']) {
    super(API);
    this.addCore(new BackendCoreReservationService());
    this.setIds({
      reservationId: specificReservationId,
    });
  }
}
