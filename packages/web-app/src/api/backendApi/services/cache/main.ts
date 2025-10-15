//配送関係

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { getRedis } from 'backend-core';

/**
 * APIキャッシュのサービス
 */
export class BackendApiCacheService extends BackendApiService {
  private expires: number;
  private key: string;
  private config = {
    cacheInit: 'pos-manual-cache-',
  };

  constructor(API: BackendAPI<any>, expires?: number, key?: string) {
    super(API);
    this.expires = expires ?? 60;

    const cacheKey = this.config.cacheInit + (key ?? this.paramKey);
    this.key = cacheKey;
  }

  private get paramKey() {
    return `params:${JSON.stringify(this.API.params)}-queries:${JSON.stringify(
      this.API.query,
    )}`;
  }

  public getCache = async <T>() => {
    //キーが指定されてなかったらパスパラメータとクエリパラメータで生成する

    //キャッシュがあるか確認
    const cachedData = await getRedis().cache.get(this.key);

    if (cachedData) {
      //データがあった場合、パースして返す
      const parsed = JSON.parse(cachedData);
      return parsed as T;
    }
  };

  public setCache = (data: unknown) => {
    //キャッシュを非同期で保存する

    const cacheData = JSON.stringify(data);
    getRedis().cache.set(this.key, cacheData, 'EX', this.expires); //デフォルトでは60秒間有効
  };
}
