import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { System_Log } from '@prisma/client';
import { BackendCoreLogService } from 'backend-core';

/**
 * API側で使う商品マスタ系のサービス
 */
export class BackendApiLogService extends BackendApiService {
  declare core: BackendCoreLogService;

  constructor(
    API: BackendAPI<any>,
    domain: System_Log['domain'],
    title?: System_Log['title'],
  ) {
    super(API);
    this.addCore(new BackendCoreLogService(domain, title));

    this.core.add(`
${API.reqInfoText}
    `);

    //プロセスストレージにログオブジェクトを保存
    if (this.storage) {
      this.storage.logService = this.core;
    }
  }
}
