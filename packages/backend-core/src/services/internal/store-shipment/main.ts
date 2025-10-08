import { BackendCoreError } from '@/error/main';
import { BackendService } from '@/services/internal/main';
import { BackendCoreProductService } from '@/services/internal/product/main';
import {
  Consignment_Client_Mapping,
  Item_Category_Condition_Option_Mapping,
  Item_Category_Mapping,
  Item_Genre_Mapping,
  Item_Mapping,
  ProductStockHistorySourceKind,
  Specialty_Mapping,
  StockingStatus,
  Store,
  Store_Shipment,
  Store_Shipment_Product,
  StoreShipmentStatus,
} from '@prisma/client';

/**
 * 店舗間在庫移動（出荷）
 */
export class BackendCoreStoreShipmentService extends BackendService {
  constructor(storeShipmentId?: Store_Shipment['id']) {
    super();
    this.setIds({
      storeShipmentId,
    });
  }

  public targetObject:
    | (Store_Shipment & {
        products: Array<Store_Shipment_Product>;
      })
    | null = null;

  public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
    if (this.targetObject) return Promise.resolve(this.targetObject);

    if (!this.ids.storeShipmentId)
      throw new BackendCoreError({
        internalMessage: '出荷IDが指定されていません',
      });

    return (async () => {
      const obj = await this.primaryDb.store_Shipment.findUnique({
        where: { store_id: this.ids.storeId, id: this.ids.storeShipmentId },
        include: {
          products: true,
        },
      });

      if (!obj)
        throw new BackendCoreError({
          internalMessage: '出荷が見つかりません',
        });

      this.targetObject = obj;

      return this.targetObject;
    })();
  }

  /**
   * 出荷のロールバック
   */
  @BackendService.WithIds(['storeId', 'storeShipmentId'])
  public async rollback() {
    const thisStoreShipmentInfo = await this.existingObj;

    if (thisStoreShipmentInfo.status !== StoreShipmentStatus.SHIPPED)
      throw new BackendCoreError({
        internalMessage: `このステータスの出荷は取り消すことができません`,
        externalMessage: `このステータスの出荷は取り消すことができません`,
      });

    //別ストアからの実行だったらresourceClassを作る
    const fromStoreId = thisStoreShipmentInfo.store_id;

    const fromOtherStore =
      fromStoreId !== this.ids.storeId ||
      fromStoreId !== this.resources.store!.id;

    let fromStoreResourceClass: BackendService = this;
    if (fromOtherStore) {
      const storeInfo = await this.db.store.findUnique({
        where: {
          id: fromStoreId,
        },
        include: {
          ec_setting: true,
          accounts: true,
        },
      });

      if (!storeInfo) {
        throw new BackendCoreError({
          internalMessage: '出荷元の店舗が見つかりません',
        });
      }

      fromStoreResourceClass = new BackendService();
      fromStoreResourceClass.generateService({
        ids: {
          storeId: fromStoreId,
        },
        resources: {
          store: storeInfo,
        },
      });
    }

    const txRes = await fromStoreResourceClass.transaction(async (tx) => {
      //出荷元の店舗の在庫を戻す
      for (const product of thisStoreShipmentInfo.products) {
        const productService = new BackendCoreProductService(
          product.product_id,
          fromStoreId,
        );
        fromStoreResourceClass.give(productService);

        await productService.increaseStock({
          increaseCount: product.item_count,
          source_kind: ProductStockHistorySourceKind.store_shipment_rollback,
          source_id: thisStoreShipmentInfo.id,
          description: `出荷の取り消しによる在庫戻し productId: ${product.product_id}`,
        });
      }

      //ステータスを変える
      const updateStoreShipmentRes = await tx.store_Shipment.update({
        where: {
          id: thisStoreShipmentInfo.id,
        },
        data: {
          status: StoreShipmentStatus.ROLLBACK,
        },
      });

      const updateStockingRes = await tx.stocking.update({
        where: {
          id: thisStoreShipmentInfo.to_stocking_id!,
        },
        data: {
          status: StockingStatus.CANCELED,
        },
      });

      return {
        storeShipment: updateStoreShipmentRes,
        stocking: updateStockingRes,
      };
    });

    return txRes;
  }

  @BackendService.WithIds(['storeId'])
  public async getMappingDef(
    toStoreId: Store['id'],
    excludeItem?: boolean,
  ): Promise<MappingDef> {
    const mappingDef = await this.db.store_Relation.findUnique({
      where: {
        from_store_id_to_store_id: {
          from_store_id: this.ids.storeId!,
          to_store_id: toStoreId,
        },
      },
      include: {
        ...(excludeItem ? {} : { item_mappings: true }),
        category_mappings: true,
        specialty_mappings: true,
        consignment_client_mappings: true,
        condition_option_mappings: true,
        genre_mappings: true,
      },
    });

    if (!mappingDef) {
      throw new BackendCoreError({
        internalMessage: 'マッピング定義が見つかりません',
        externalMessage: 'マッピング定義が見つかりません',
      });
    }

    return {
      item: mappingDef.item_mappings,
      category: mappingDef.category_mappings,
      specialty: mappingDef.specialty_mappings,
      consignment_client: mappingDef.consignment_client_mappings,
      condition_option: mappingDef.condition_option_mappings,
      genre: mappingDef.genre_mappings,
    };
  }
}

export type MappingDef = {
  category: Array<Item_Category_Mapping>;
  condition_option: Array<Item_Category_Condition_Option_Mapping>;
  genre: Array<Item_Genre_Mapping>;
  specialty: Array<Specialty_Mapping>;
  consignment_client: Array<Consignment_Client_Mapping>;
  item: Array<Item_Mapping>;
};
