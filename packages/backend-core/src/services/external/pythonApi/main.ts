import { BackendCoreError } from '@/error/main';
import { Item, Purchase_Table, Store } from '@prisma/client';

//Python APIを叩く
export class BackendExternalPythonApiService {
  // public static config = {
  //   apiEndpoint: process.env.PYTHON_API_ENDPOINT,
  //   bot
  // }

  constructor() {}

  private runApi = async (
    method: 'POST' | 'GET',
    path: string,
    data: Record<string, unknown> = {},
  ) => {
    const options: RequestInit = {
      headers: {
        Authorization: `Bearer ${process.env.BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method,
    };

    if (data && method != 'GET') {
      options.body = JSON.stringify(data);
    }

    const result = await fetch(`${process.env.PYTHON_API_ENDPOINT}${path}`, {
      ...options,
      cache: 'no-store',
    });

    if (!result.ok) {
      console.error(result);
      console.error(data);
      throw new BackendCoreError({
        internalMessage: '買取表画像の作成に失敗しました',
        externalMessage: '買取表画像の作成に失敗しました',
      });
    }

    const resJson = await result.json();

    return resJson;
  };

  //買取表画像を生成する関数
  public generatePurchaseTableImage = async (params: {
    store_id: Store['id'];
    store_name: Store['display_name'];
    title: Purchase_Table['title'];
    format: Purchase_Table['format'];
    color: Purchase_Table['color'];
    background_text_color: Purchase_Table['background_text_color'];
    cardname_and_price_text_color: Purchase_Table['cardname_and_price_text_color'];
    custom_template_image_url: Purchase_Table['custom_template_image_url'];
    comment: Purchase_Table['comment'];
    items: Array<PurchaseTableItemInput>;
  }) => {
    const res = (await this.runApi(
      'POST',
      'generate-purchase-table',
      params,
    )) as {
      images: Array<{
        order_number: number; //順番
        image_url: string; //S3上での画像URL
      }>;
      // error?: string; //エラーがあった場合
    };

    // if (res.error) {
    //   throw new ApiError({
    //     status: 500,
    //     messageText: res.error,
    //   });
    // }

    return res;
  };
}

export type PurchaseTableItemInput = {
  cardname: string; //カード名
  rarity: string; //レアリティ
  buy_price: number; //表示価格
  expansion: string; //エキスパンション
  cardnumber: string; //カード番号
  any_model_number: boolean; //型番は問わないかどうか（trueだったら問わない）
  full_image_url: string; //カード画像URL 空文字列のケースもある
  cardgenre: string; //ジャンル名 ここが空文字列の場合、独自ジャンル
  type: string; //タイプ
  id: Item['id']; //POS上のItemID
  special_condition?: 'psa10'; //特殊状態
};
