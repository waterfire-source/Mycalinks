import { mycaUserType } from '@/api/backendApi/auth/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import {
  BackendExternalMycaAppService,
  MycaAppUser,
  TaskManager,
} from 'backend-core';
import { customDayjs } from 'common';
import crypto from 'crypto';

/**
 * API関連のMycaアプリサービス
 */
export class BackendApiMycaAppService extends BackendApiService {
  core: BackendExternalMycaAppService;

  /**
   * アクセストークン
   */
  accessToken: string | null = null;

  constructor(API: BackendAPI<any>) {
    super(API);
    this.core = new BackendExternalMycaAppService();
    this.accessToken = this.API?.req?.headers.get('MycaToken') || null;
  }

  /**
   * MycaAppユーザーのトークンを検証
   */
  public async verifyMycaAppUser(): Promise<mycaUserType | false> {
    if (!this.API) return false;

    const appUserId = this.validateAppToken();
    if (!appUserId) return false;

    const user = String(appUserId);
    const accessToken = this.accessToken!;

    //あとはこのアクセストークンを検証するだけ
    const signature = Buffer.from(accessToken.split('.')[2], 'base64');
    const tokenBody = accessToken.split('.')[1];

    try {
      const publicKeyPem = process.env.MYCA_APP_JWT_PUBLIC_KEY || '';
      const verified = crypto.verify(
        'RSA-SHA256',
        Buffer.from(tokenBody),
        publicKeyPem,
        signature,
      );

      if (!verified) throw new Error();

      const mycaUser = {
        id: appUserId,
        role: 'myca_user' as const,
        email: '', //多分使わんからいいや
      };

      this.API.mycaUser = mycaUser;

      return this.API.mycaUser;
    } catch {
      throw new ApiError({
        status: 401,
        messageText: '認証に失敗しました',
      });
    }
  }

  /**
   * トークンをパース
   */
  private validateAppToken = () => {
    if (!this.accessToken) return false;

    const splitted = this.accessToken.split('.');

    if (splitted.length != 3) return false;

    const decoded = atob(splitted[1]);
    let jsonData: {
      exp: number;
      id: number;
    } | null = null;

    try {
      jsonData = JSON.parse(decoded);
    } catch {
      return false;
    }

    //有効期限を確認
    if (!jsonData?.exp) return false;

    const thisExp = customDayjs(jsonData.exp);

    if (customDayjs().isAfter(thisExp)) return false;

    //ユーザーIDを格納

    return Number(jsonData.id);
  };

  /**
   * 特定のユーザーにプッシュ通知を送る
   */
  public sendPushNotification = async ({
    title,
    body,
    mycaUserId,
  }: {
    title: string;
    body: string;
    mycaUserId: MycaAppUser['id'];
  }) => {
    const mycaUserInfo = await this.core.user.getInfo({
      user: mycaUserId,
    });
    if (mycaUserInfo?.device_id) {
      //プッシュ通知を送る
      const taskManager = new TaskManager({
        targetWorker: 'notification',
        kind: 'sendPushNotification',
      });

      await taskManager.publish({
        body: [
          {
            deviceId: mycaUserInfo.device_id,
            title,
            body,
          },
        ],
        service: this,
        fromSystem: true,
        specificGroupId: `push-notification-${mycaUserId}`,
      });
    }
  };
}
