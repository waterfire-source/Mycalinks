//配送関係

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { CustomCrypto } from '@/utils/crypto';
import { BackendCoreGmoService } from 'backend-core';
/**
 * API関連のGMOサービス
 */
export class BackendApiGmoService extends BackendApiService {
  declare core: BackendCoreGmoService;

  constructor(API: BackendAPI<any>, mode: 'contract' | 'ec' = 'ec') {
    super(API);
    this.addCore(new BackendCoreGmoService(mode));
  }

  /**
   * コールバックURLの情報を取得
   */
  public getCallbackInfo = <T extends Record<string, unknown>>() => {
    const { p } = this.API.query;

    if (!p)
      throw new ApiError({
        status: 400,
        messageText: 'Bad Request',
      });

    const data = CustomCrypto.base64Decode(p);
    return data as T;
  };

  /**
   * webhookの検証 一旦IP制限で
   */
  public verifyWebhook = <T extends Record<string, unknown>>(): {
    body: T;
    type: 'ec' | 'contract';
  } => {
    const allowedIps = this.core.client.config.webhookUrl.fromServerIp;
    const ip = this.API.reqIp;

    console.log('from', ip);

    if (!allowedIps.includes(ip)) {
      throw new ApiError('permission');
    }

    if (this.API.query.type !== 'ec' && this.API.query.type !== 'contract') {
      throw new ApiError('permission');
    }

    return {
      body: this.API.body as T,
      type: this.API.query.type as 'ec' | 'contract',
    };
  };
}

// export namespace BackendApiGmoService {
//   export type WebhookBody = {};
// }
