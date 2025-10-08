//Mycalinksコネクタ接続用の基底クラス
//各デバイス間共通処理や設定などを保持

export abstract class MycalinksConnector {
  public setting = {
    apiHost: 'http://localhost',
    // apiHost: 'https://598adeebeb5f.ngrok-free.app',
    port: '8080',
  };

  private async fetch(
    method: 'POST' | 'GET',
    url: string,
    body?: Record<string, unknown>,
  ) {
    return await fetch(`${this.setting.apiHost}:${this.setting.port}${url}`, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        // 'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * リクエストの送信
   * SSEに関しては別で用意する必要がありそう
   */
  protected async sendRequest(
    method: 'POST' | 'GET',
    url: string,
    body?: Record<string, unknown>,
  ) {
    try {
      const response = await this.fetch(method, url, body);

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return (await response.json()) as Record<string, unknown>;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
      throw new Error(`Mycalinksコネクタとの通信に失敗しました`);
    }
  }

  /**
   * そもそもMycalinksコネクタが起動しているかどうか確認
   */
  protected async checkIsConnectorRunning() {
    try {
      await this.fetch('GET', '/');

      return true;
    } catch (e) {
      return false;
    }
  }

  constructor(private readonly port: string) {
    this.setting.port = port;
    // this.setting.port = '443';
  }
}
