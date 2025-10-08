import { BackendCoreError } from '@/error/main';
import {
  OchanokoOrderDetail,
  OchanokoProductDetail,
} from '@/services/external/ochanoko/type';

//おちゃのこ
export class BackendExternalOchanokoService {
  //動的な設定値
  public config = {
    // accessToken:
    //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMGY4Y2Y5NDhiNTk0MGNhZWI4MTVmNDBlMmE1Nzk0NmEwNDZkYWZiMGEyNjYyMDkzNWU0NzVmYjk4NzNlZjE0N2VmM2I2ZmViNzRhNTU0YWMiLCJpYXQiOjE3Mzg5MTI2NzUuNzM1MzA4LCJuYmYiOjE3Mzg5MTI2NzUuNzM1MzA5LCJleHAiOjMzMTY3NDk0NzUuNzM0NTE4LCJzdWIiOiIxMDAxMTciLCJzY29wZXMiOlsicmVhZF9vcmRlcnMiLCJyZWFkX3Byb2R1Y3RzIiwid3JpdGVfcHJvZHVjdHMiXX0.I8joe9l2s0GOHVvueN9br-AMpWMVNT8KeVzf8WA8XQrRrrAozFl08zDUerUe16PAq8RXGtqBM4-BU681FIq3OxyorpbcZEMK4Pz2TKLFKAi_rQOE6KZMCmost9VldEcLp2FXotJ-a9Lb1i5GEzoZXBnr1Fo5HzeqjUOBMugwZiqrrbuldipdziLc90XBbFHrfDJm9bn6onxnP_7csQMHG47AZCejnMcCHh7xiEgOvMu-kJoNgyJLLlO65Afa_Fw6hO8_aK_E7PmrBYIUvxJeKuvzvA7xOcbbX00JNmG_zFuv_zVTBW79dGgGeLhgFq7KZxJW4UZvQshv9sF6g0i0v_WA-rkn2gL6D-N52Ka-k1MkIEL-bGcK_Q8exkflL8_-rLIX9C723TDpHaQDGEHMY4ADPMaTcRTqM1XYoV-pSQ1_9r2Vqkss716cJNs-7jRRna9C4WDQQGBa61_NKQ7bsUqK4ASlrThkvFY8Dl2ejZP1mstWTtVpnpCfdvyByn23tlnwFfLHjTbzEUXush2gGip8xUNdPaGJwXtZRdmxwz290Q39uPUO5k5JkFTyJiFlNx8NRrDW-M30LTr7cSOTwo0Eb7SCalEgkd5PAoOOm_QHQtJZWmTVpaH0D2G8tZm23Ma1PSYlYPm0gs5fkgIU5sJOjykZ_srDZM3A0qQzug8',
    accessToken: '', //動的に設定する場合
    email: '',
  };

  //POSシステムで決まっているスタティックな設定値
  public static config = {
    endpoint: process.env.OCHANOKO_API_ENDPOINT,
    // enabled: true,
  };

  constructor() {}

  /**
   * おちゃのこAPIを呼び出すためのプライベートメソッド
   * [TODO] レート制限引っかかった時の指数バックオフ再試行入れたい
   */
  private runApi = async (
    method: string,
    url: string,
    data?: Record<string, unknown>,
  ) => {
    if (!this.config.accessToken)
      throw new BackendCoreError({
        internalMessage:
          'おちゃのこネットのアクセストークンが取得できませんでした',
        externalMessage: 'おちゃのこネットを利用できません',
      });

    const options: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      method,
    };

    if (data && method != 'GET') {
      options.body = JSON.stringify(data);
    }

    let result: any = await fetch(
      `${BackendExternalOchanokoService.config.endpoint}${url}`,
      {
        ...options,
        cache: 'no-store',
      },
    );

    if (!result.ok) {
      const errorBody = await result.text();
      throw new BackendCoreError({
        internalMessage: `おちゃのこAPI呼び出しエラー: ${result.status} ${errorBody}`,
        externalMessage: 'おちゃのこネットとの通信でエラーが発生しました',
      });
    }

    result = await result.json();

    return result;
  };

  /**
   * 商品情報取得
   * 商品IDを指定して商品情報を取得する場合はproductIdを指定
   */
  public getProductInfo = async (
    productId: OchanokoProductDetail['id'],
  ): Promise<OchanokoProductDetail> => {
    const url = `/v1/products/${productId}`;

    const result = await this.runApi('GET', url);

    return result.data;
  };

  /**
   * 検証用
   */
  public async getProducts(
    query: Record<string, string>,
  ): Promise<OchanokoProductDetail[]> {
    const url = `/v1/products?limit=1000`;

    const result = await this.runApi('GET', url);

    return result.data;
  }

  /**
   * 注文情報取得
   * 注文IDを指定して情報を取得する場合はorderIdを指定
   * 一覧を取得する場合はqueryに条件を指定（例：{limit: '100', date_from: '2023-01-01'}）
   */
  public getOrders = async (
    orderId: OchanokoOrderDetail['id'],
  ): Promise<OchanokoOrderDetail> => {
    const url = `/v1/orders/${orderId}`;

    const result = await this.runApi('GET', url);

    return result.data;
  };

  /**
   * 商品の在庫数を更新する
   * @param id 商品ID
   * @param stock 新しい在庫数
   */
  public updateStockNumber = async (
    data: Array<{
      id: OchanokoProductDetail['id'];
      stock: OchanokoProductDetail['stock'];
    }>,
  ) => {
    //1000超えてたらエラー
    if (data.length > 1000) {
      throw new BackendCoreError({
        internalMessage: '1000以上のデータは更新できません',
      });
    }

    const result = await this.runApi('PUT', `/v1/products`, { data });

    return result.data;
  };

  /**
   * 商品の価格を更新する
   * @param id 商品ID
   * @param price 新しい価格
   */
  public updatePrice = async (
    data: Array<{
      id: OchanokoProductDetail['id'];
      price: OchanokoProductDetail['price'];
    }>,
  ) => {
    if (data.length > 1000) {
      throw new BackendCoreError({
        internalMessage: '1000以上のデータは更新できません',
      });
    }

    const result = await this.runApi('PUT', `/v1/products`, { data });

    return result.data;
  };
}
