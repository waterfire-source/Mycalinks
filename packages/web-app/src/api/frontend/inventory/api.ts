import { Store, Inventory, Inventory_Shelf } from '@prisma/client';

import { CustomError } from '@/api/implement';
import { BackendInventoryAPI } from '@/app/api/store/[store_id]/inventory/api';
import { createOrUpdateInventoryApi } from 'api-generator';
export interface InventoryAPI {
  create: {
    request: {
      storeID: number;
      itemCategoryIds: number[];
      itemGenreIds: number[];
      title: string;

      products?: [
        {
          shelfId: number;
          productId: number;
          staffAccountId: number;
          itemCount: number;
        },
      ];
      additionalProducts?: [
        {
          shelfId: number;
          productId: number;
          staffAccountId: number;
          itemCount: number;
        },
      ];
    };
    response: typeof createOrUpdateInventoryApi.response | CustomError;
  };
  update: {
    request: {
      storeID: number;
      id?: number;

      products?: [
        {
          shelfId: number;
          productId: number;
          staffAccountId: number;
          itemCount: number;
        },
      ];
      additionalProducts?: [
        {
          shelfId: number;
          productId: number;
          staffAccountId: number;
          itemCount: number;
        },
      ];
    };
    response: typeof createOrUpdateInventoryApi.response | CustomError;
  };
  getInventories: {
    request: {
      storeID: Store['id'];
    } & BackendInventoryAPI[1]['request']['query'];
    response: BackendInventoryAPI[1]['response'][200] | CustomError;
  };
  deleteInventory: {
    request: {
      storeID: Store['id'];
      inventoryID: Inventory['id'];
    };
    response: BackendInventoryAPI[2]['response'][200] | CustomError;
  };
  applyInventory: {
    request: {
      storeID: Store['id'];
      inventoryID: Inventory['id'];
    } & BackendInventoryAPI[3]['request']['body'];
    response: BackendInventoryAPI[3]['response'][200] | CustomError;
  };
  createOrUpdateShelf: {
    request: {
      storeID: Store['id'];
    } & BackendInventoryAPI[4]['request']['body'];
    response:
      | BackendInventoryAPI[4]['response'][201]
      | BackendInventoryAPI[4]['response'][200]
      | CustomError;
  };
  getShelfs: {
    request: {
      storeID: Store['id'];
    } & BackendInventoryAPI[5]['request']['query'];
    response: BackendInventoryAPI[5]['response'][200] | CustomError;
  };
  deleteShelf: {
    request: {
      storeID: Store['id'];
      shelfID: Inventory_Shelf['id'];
    };
    response: BackendInventoryAPI[6]['response'][200] | CustomError;
  };
}

export interface InventoryAPIRes {
  create: Exclude<InventoryAPI['create']['response'], CustomError>;
  update: Exclude<InventoryAPI['update']['response'], CustomError>;
  getInventories: Exclude<
    InventoryAPI['getInventories']['response'],
    CustomError
  >;
  deleteInventory: Exclude<
    InventoryAPI['deleteInventory']['response'],
    CustomError
  >;
  applyInventory: Exclude<
    InventoryAPI['applyInventory']['response'],
    CustomError
  >;
  createOrUpdateShelf: Exclude<
    InventoryAPI['createOrUpdateShelf']['response'],
    CustomError
  >;
  getShelfs: Exclude<InventoryAPI['getShelfs']['response'], CustomError>;
  deleteShelf: Exclude<InventoryAPI['deleteShelf']['response'], CustomError>;
}
