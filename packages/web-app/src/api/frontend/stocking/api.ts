import { StockingStatus, Supplier } from '@prisma/client';

import { CustomError } from '@/api/implement';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { deleteStockingSupplierDef } from '@/app/api/store/[store_id]/stocking/def';
export interface StockingAPI {
  // 入荷登録
  createStocking: {
    request: {
      store_id: number;
    } & BackendStockingAPI[3]['request']['body'];
    response: BackendStockingAPI[3]['response']['201'] | CustomError;
  };
  // 入荷更新
  update: {
    request: {
      storeID: number;
      stockingID: number;
      plannedDate?: string;
      supplierID?: number;
      stockingProducts: Array<{
        id: number;
        plannedItemCount: number;
        unitPrice: number | null; //単価(仕入れ値)
        unitPriceWithoutTax: number | null;
      }>;
    };
    response: BackendStockingAPI[3]['response']['200'] | CustomError;
  };
  // 入荷適用
  applyStocking: {
    request: {
      storeID: number;
      stockingID: number;
      actualDate: Date;
      stockingProducts: Array<{
        id: number;
        actualItemCount: number;
      }>;
    };
    response: BackendStockingAPI[4]['response']['200'] | CustomError;
  };
  // 入荷キャンセル
  cancelStocking: {
    request: {
      store_id: number;
      stocking_id: number;
    };
    response: BackendStockingAPI[6]['response']['200'] | CustomError;
  };
  // 入荷一覧取得
  listStocking: {
    request: {
      store_id: number;
      status?: StockingStatus; // 指定しなければ全て取得
      productName?: string; // 商品名、指定しなければ全て取得
      staffAccountId?: number;
      skip?: number;
      take?: number;
    };
    response: BackendStockingAPI[5]['response']['200'] | CustomError;
  };
  createStockingSupplier: {
    request: {
      store_id: number;
      body: {
        display_name: Supplier['display_name']; //仕入れ先名
        zip_code: Supplier['zip_code'];
        prefecture: Supplier['prefecture'];
        city: Supplier['city'];
        address2: Supplier['address2'];
        building: Supplier['building'];
        phone_number: Supplier['phone_number'];
        fax_number: Supplier['fax_number'];
        email: Supplier['email'];
        staff_name: Supplier['staff_name'];
        order_number: Supplier['order_number'];
        enabled: Supplier['enabled'];
        description: Supplier['description'];
        order_method: Supplier['order_method'];
      };
    };
    response: BackendStockingAPI[1]['response'] | CustomError;
  };

  updateStockingSupplier: {
    request: {
      store_id: number;
      body: {
        id: number; //IDを指定することで更新モードになる
        display_name: Supplier['display_name']; //仕入れ先名
        zip_code: Supplier['zip_code'];
        prefecture: Supplier['prefecture'];
        city: Supplier['city'];
        address2: Supplier['address2'];
        building: Supplier['building'];
        phone_number: Supplier['phone_number'];
        fax_number: Supplier['fax_number'];
        email: Supplier['email'];
        staff_name: Supplier['staff_name'];
        order_number: Supplier['order_number'];
        enabled: Supplier['enabled'];
        description: Supplier['description'];
        order_method: Supplier['order_method'];
      };
    };
    response: BackendStockingAPI[1]['response'] | CustomError;
  };

  //仕入れ先取得API
  listStockingSupplier: {
    request: {
      store_id: number;
      display_name?: string; //名前などで検索できる
      enabled?: boolean; //有効かどうか
    };
    response: BackendStockingAPI[2]['response'][200] | CustomError;
  };

  //仕入れ先削除
  deleteStockingSupplier: {
    request: {
      storeID: number;
      supplierID: number;
    };
    response: typeof deleteStockingSupplierDef.response | CustomError;
  };

  //CSVで仕入れ
  uploadCsv: {
    request: {
      storeID: number;
      body: {
        file: File;
      };
    };
    response: BackendStockingAPI[0]['response'][200];
  };
}
