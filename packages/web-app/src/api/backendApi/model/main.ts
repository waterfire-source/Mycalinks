import { BackendAPI } from '@/api/backendApi/main';
import { Store } from '@prisma/client';
//モデルの親クラス
/**
 * @deprecated
 */
export class BackendModel {
  public API: BackendAPI<any>;
  public storeId?: Store['id'];
  public get db() {
    return (this.tx ?? this.API.db) as BackendAPI['db'];
  }

  constructor(API: BackendAPI<any>, specificStoreId?: Store['id']) {
    this.API = API;
    this.storeId =
      Number(specificStoreId) || Number(this.API.params?.store_id) || undefined;
  }

  public get tx() {
    return this.API.tx;
  }

  public set tx(tx: unknown) {
    //@ts-expect-error becuase of because of
    this.API._tx = tx;
  }
}
