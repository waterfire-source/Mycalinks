//下書き状態の出荷の確定
//つまり出荷先に入荷が作成され、在庫変動が行われる
// 出荷を確定する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiStoreShipmentService } from '@/api/backendApi/services/store-shipment/main';
import {
  Product,
  ProductStockHistorySourceKind,
  StoreShipmentStatus,
  TaxMode,
} from '@prisma/client';
import { applyStoreShipmentApi } from 'api-generator';
import { BackendService } from 'backend-core';

export const POST = BackendAPI.create(
  applyStoreShipmentApi,
  async (API, { params }) => {
    const { store_id, store_shipment_id } = params;

    const storeShipmentService = new BackendApiStoreShipmentService(
      API,
      store_shipment_id,
    );

    //存在確認と、マッピング定義の取得
    const thisStoreShipmentInfo = await API.db.store_Shipment.findUnique({
      where: {
        id: store_shipment_id,
        store_id,
        status: StoreShipmentStatus.NOT_YET,
      },
      include: {
        products: true,
      },
    });

    if (!thisStoreShipmentInfo) throw new ApiError('notExist');

    const mappingDef = await storeShipmentService.core.getMappingDef(
      thisStoreShipmentInfo.to_store_id,
    );

    //マッピング先を確立させていく
    const toProducts: Array<{
      from_product_id: Product['id'];
      to_product_id: Product['id'];
      item_count: number;
    }> = [];

    //出荷する時に使う仕入れ値リスト
    const wholesalePriceList: Array<{
      from_product_id: Product['id'];
      to_product_id: Product['id'];
      wholesale_unit_price: number;
      item_count: number;
    }> = [];

    for (const product of thisStoreShipmentInfo.products) {
      //マッピング先を取得 or 作成
      const fromProduct = new BackendApiProductService(API, product.product_id);
      const toProduct = await fromProduct.core.getMappingProduct({
        toStoreId: thisStoreShipmentInfo.to_store_id,
        mappingDef,
      });

      if (!toProduct)
        throw new ApiError({
          status: 404,
          messageText: `在庫ID: ${product.product_id} のマッピング先が見つかりませんでした`,
        });

      console.log(`マッピング先見つかりました: ${toProduct.id}`);

      toProducts.push({
        from_product_id: product.product_id,
        to_product_id: toProduct.id,
        item_count: product.item_count,
      });
    }

    const txResult = await API.transaction(
      async (tx) => {
        //在庫変動させつつ、出荷先の店舗に入荷を作る
        for (const product of toProducts) {
          const fromProduct = new BackendApiProductService(
            API,
            product.from_product_id,
          );

          const changeResult = await fromProduct.core.decreaseStock({
            source_kind: ProductStockHistorySourceKind.store_shipment,
            source_id: store_shipment_id,
            decreaseCount: product.item_count,
            description: `店舗間出荷${store_shipment_id} によって ${product.from_product_id}が${product.item_count}減少しました`,
          });

          const records = changeResult.recordInfo!.useRecords;

          wholesalePriceList.push(
            ...records.map((e) => ({
              from_product_id: product.from_product_id,
              to_product_id: product.to_product_id,
              wholesale_unit_price: e.unit_price,
              item_count: e.item_count,
            })),
          );
        }

        //入荷を作っていく
        const includesTax = API.resources.store!.tax_mode === TaxMode.INCLUDE;
        const total_wholesale_price = wholesalePriceList.reduce(
          (acc, e) => acc + e.wholesale_unit_price * e.item_count,
          0,
        );

        //仕入れ先として、この店舗を追加する
        const supplier = await tx.supplier.upsert({
          where: {
            store_id_display_name: {
              store_id: thisStoreShipmentInfo.to_store_id,
              display_name:
                API.resources.store!.display_name ?? `店舗:${store_id}`,
            },
          },
          create: {
            store_id: thisStoreShipmentInfo.to_store_id,
            display_name:
              API.resources.store!.display_name ?? `店舗:${store_id}`,
            zip_code: API.resources.store!.zip_code,
            address2: API.resources.store!.full_address,
            phone_number: API.resources.store!.phone_number,
            email: API.resources.actionAccount!.email,
            staff_name: API.resources.actionAccount!.display_name,
          },
          update: {
            display_name:
              API.resources.store!.display_name ?? `店舗:${store_id}`,
            zip_code: API.resources.store!.zip_code,
            address2: API.resources.store!.full_address,
            phone_number: API.resources.store!.phone_number,
            email: API.resources.actionAccount!.email,
            staff_name: API.resources.actionAccount!.display_name,
          },
        });

        const createStockingRes = await tx.stocking.create({
          data: {
            store_id: thisStoreShipmentInfo.to_store_id,
            planned_date: thisStoreShipmentInfo.shipment_date,
            supplier_id: supplier.id,
            staff_account_id: BackendService.coreConfig.systemAccountId,
            stocking_products: {
              create: wholesalePriceList.map((e) => ({
                product_id: e.to_product_id,
                planned_item_count: e.item_count,
                ...(includesTax
                  ? { unit_price: e.wholesale_unit_price }
                  : { unit_price_without_tax: e.wholesale_unit_price }),
              })),
            },
          },
          include: {
            stocking_products: true,
          },
        });

        //出荷の方も更新する
        const updateRes = await tx.store_Shipment.update({
          where: {
            id: thisStoreShipmentInfo.id,
          },
          data: {
            status: StoreShipmentStatus.SHIPPED,
            total_wholesale_price,
            to_stocking_id: createStockingRes.id,
          },
          include: {
            products: true,
          },
        });

        return {
          storeShipment: updateRes,
          stocking: createStockingRes,
        };
      },
      {
        maxWait: 5 * 1000, // default: 2000
        timeout: 6 * 60 * 1000, // タイムアウトは6分（決済が5分のため）
      },
    );

    return txResult;
  },
);
