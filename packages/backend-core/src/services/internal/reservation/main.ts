import { BackendService } from '@/services/internal/main';

//バックエンドの予約サービスクラス

import {
  Customer,
  Reservation,
  Reservation_Reception_Product,
  ReservationReceptionProductStatus,
} from '@prisma/client';
import { BackendCoreError } from '@/error/main';

export class BackendCoreReservationService extends BackendService {
  constructor() {
    super();
    // this.setIds({
    //   saleId,
    // });
  }

  public targetObject:
    | (Reservation & {
        receptions?: Reservation_Reception_Product[];
      })
    | null = null;

  public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
    if (this.targetObject) return Promise.resolve(this.targetObject);

    return (async () => {
      if (!this.ids.reservationId || !this.ids.storeId)
        throw new BackendCoreError({
          internalMessage: '存在しない予約です',
        });

      const reservation = await this.db.reservation.findUnique({
        where: {
          id: this.ids.reservationId,
        },
        include: {
          receptions: true,
        },
      });

      if (!reservation)
        throw new BackendCoreError({
          internalMessage: '存在しない予約です',
        });

      return reservation;
    })();
  }

  /**
   * あと何個注文を入れれるのかのマージンを取得
   */
  @BackendService.WithIds(['reservationId'])
  public async getAvailableMargin({
    customerId,
    itemCount, //欲しい数
  }: {
    customerId?: Customer['id'];
    itemCount?: number;
  }) {
    const reservationInfo = await this.existingObj;
    if (!reservationInfo.receptions)
      throw new BackendCoreError({
        internalMessage: '予約の受付情報がありません',
      });

    //有効な受付を取得
    const currentReceptions = reservationInfo.receptions.filter(
      (e) =>
        e.status == ReservationReceptionProductStatus.DEPOSITED ||
        e.status == ReservationReceptionProductStatus.RECEIVED,
    );

    //この中から総数と、この顧客における総数を取得
    const totalCount = currentReceptions.reduce(
      (acc, e) => acc + e.item_count,
      0,
    );
    const thisCustomerTotalCount = currentReceptions
      .filter((e) => e.customer_id === customerId)
      .reduce((acc, e) => acc + e.item_count, 0);

    //総数を超えないか調べる
    const wholeMargin = reservationInfo.limit_count - totalCount;

    //itemCountがある場合、必要に応じてエラー
    if (itemCount && itemCount > wholeMargin)
      throw new BackendCoreError({
        internalMessage: '予約の上限数を超えています',
        externalMessage: '予約の上限数を超えています',
      });

    //この顧客における総数を超えないか調べる
    const thisCustomerMargin =
      reservationInfo.limit_count_per_user - thisCustomerTotalCount;

    //itemCountがある場合、必要に応じてエラー
    if (itemCount && itemCount > thisCustomerMargin)
      throw new BackendCoreError({
        internalMessage: '顧客あたりの予約の上限数を超えています',
        externalMessage: '顧客あたりの予約の上限数を超えています',
      });

    //マージンを返す
    return {
      wholeMargin,
      thisCustomerMargin,
    };
  }
}
