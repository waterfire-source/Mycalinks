import { BackendService } from '@/services/internal/main';

//バックエンドの委託サービスクラス

import {
  Consignment_Client,
  Prisma,
  TransactionKind,
  TransactionStatus,
} from '@prisma/client';

export class BackendCoreConsignmentService extends BackendService {
  constructor() {
    super();
    // this.setIds({
    //   saleId,
    // });
  }

  // public targetObject:
  //   | (Reservation & {
  //       receptions?: Reservation_Reception_Product[];
  //     })
  //   | null = null;

  // public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
  //   if (this.targetObject) return Promise.resolve(this.targetObject);

  //   return (async () => {
  //     if (!this.ids.reservationId || !this.ids.storeId)
  //       throw new BackendCoreError({
  //         internalMessage: '存在しない予約です',
  //       });

  //     const reservation = await this.db.reservation.findUnique({
  //       where: {
  //         id: this.ids.reservationId,
  //       },
  //       include: {
  //         receptions: true,
  //       },
  //     });

  //     if (!reservation)
  //       throw new BackendCoreError({
  //         internalMessage: '存在しない予約です',
  //       });

  //     return reservation;
  //   })();
  // }

  /**
   * 特定の委託主や委託在庫の売り上げ、手数料を取得する
   */
  @BackendService.WithIds(['storeId'])
  public async getTransactionStats(
    whereInput: Prisma.Transaction_CartWhereInput,
  ) {
    //カートとかを全部取得する
    const carts = await this.db.transaction_Cart.findMany({
      where: {
        AND: whereInput,
        transaction: {
          store_id: this.ids.storeId!,
          transaction_kind: TransactionKind.sell,
          status: TransactionStatus.completed,
        },
      },
      select: {
        id: true,
        item_count: true,
        consignment_sale_unit_price: true,
        consignment_commission_unit_price: true,
        transaction: {
          select: {
            is_return: true,
          },
        },
      },
    });

    //販売数と売り上げと手数料を取得する
    let result = {
      totalSalePrice: 0,
      totalSaleItemCount: 0,
      totalCommissionPrice: 0,
    };

    result = carts.reduce((acc, cart) => {
      const factor = cart.transaction.is_return ? -1 : 1;

      acc.totalSalePrice += factor * cart.consignment_sale_unit_price;
      acc.totalSaleItemCount += factor * cart.item_count;
      acc.totalCommissionPrice +=
        factor * cart.consignment_commission_unit_price;

      return acc;
    }, result);

    return result;
  }

  /**
   * 在庫の残点数とか
   */
  @BackendService.WithIds(['storeId'])
  public async getProductStats({
    consignmentClientId,
  }: {
    consignmentClientId: Consignment_Client['id'];
  }) {
    const result = await this.db.product.aggregate({
      where: {
        store_id: this.ids.storeId!,
        consignment_client_id: consignmentClientId,
      },
      _sum: {
        stock_number: true,
      },
    });

    return {
      totalStockNumber: result._sum.stock_number ?? 0,
    };
  }
}
