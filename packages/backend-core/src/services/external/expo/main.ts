import { BackendCoreError } from '@/error/main';

//プッシュ通知
export class BackendExternalExpoService {
  private config = {
    apiEndpoint: 'https://exp.host/--/api/v2/push/send',
  };

  /**
   * プッシュ通知を送信する
   * 再試行を行った後に、エラーはスローしない
   */
  @BackendCoreError.RetryOnFailure({
    maxRetries: 2,
    delay: 300,
    throwLastError: true,
  })
  async sendPushNotifications(
    params: Array<{
      deviceId: string;
      sound?: string;
      title: string;
      body: string;
    }>,
  ): Promise<
    Array<{
      status: 'ok' | 'error';
      id: string;
    }>
  > {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        params.map((e) => ({
          to: e.deviceId,
          sound: e.sound,
          title: e.title,
          body: e.body,
        })),
      ),
    });

    const responseJson = await response.json();

    if ('error' in responseJson.data)
      throw new BackendCoreError({
        externalMessage: 'プッシュ通知の送信に失敗しました',
        internalMessage: responseJson.data.error,
      });

    console.log('プッシュ通知', responseJson);

    return responseJson.data as Array<{
      status: 'ok';
      id: string;
    }>;
  }
}
