import {
  Store,
  Sale,
  Sale_Product,
  Sale_Department,
  Product,
  Item_Genre,
  Item_Category,
} from '@prisma/client';

export type BackendSaleAPI = [
  //セール登録&編集API
  {
    path: '/api/store/{store_id}/sale/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: {
        id: Sale['id']; //IDを指定することで情報を編集できる（REST APIとして微妙だが、わかりやすいため採用）
        //更新をする際は、必要なフィールドのみ指定する形で大丈夫

        display_name: Sale['display_name']; //セールの名前
        transaction_kind: Sale['transaction_kind']; //セールの取引の種類 sell or buy
        start_datetime: Sale['start_datetime']; //セールの開始日時を10分単位で
        discount_amount: Sale['discount_amount']; //セールの割引量定義 20%引きだったら「80%」 20円引きだったら「-20」 20円増だったら「20」
        end__datetime: Sale['end__datetime']; //セールの終了日時を10分単位で
        end__total_item_count: Sale['end__total_item_count']; //総アイテム上限数
        end__unit_item_count: Sale['end__unit_item_count']; //個別アイテム上限数
        repeat_cron_rule: Sale['repeat_cron_rule']; //セールの繰り返し設定（CRON形式）  例：0 0 15 * * *　→ 毎日15時00分00秒にセールを開始
        // repeat_cron_rule_end: Sale['repeat_cron_rule_end']; //セールの繰り返しの終了時間ルール（CRON形式） 例：0 20 17 * * *　→ 毎日17時20分00秒にセールを停止
        sale_end_datetime: Sale['sale_end_datetime']; //セールの繰り返し設定を行っていた場合、繰り返しの終了日時を10分単位で
        products: Array<{
          //セールに結びつける商品リスト
          product_id: Sale_Product['product_id'];
          rule: Sale_Product['rule']; //この商品を「含有」にするのか「除外」にするのか include or exclude
        }>;
        departments: Array<{
          //セールに結びつける部門リスト
          item_category_id: Sale_Department['item_category_id']; //商品種別 nullはワイルドカード
          item_genre_id: Sale_Department['item_genre_id']; //ジャンル nullはワイルドカード
          rule: Sale_Department['rule']; //この部門を「含有」にするのか「除外」にするのか include or exclude
        }>;

        //更新用
        on_pause: Sale['on_pause']; //セールを中止にするか、中止を取り消すか
      };
    };
    response: {
      201: { id: Sale['id'] }; //作成されたセールの情報
      200: { id: Sale['id'] }; //更新されたセールの情報
      400: {
        error: string; //情報が不足している場合など
      };
      401: {
        error: string; //権限がない場合など
      };
    };
  },
  //セール削除API
  {
    path: '/api/store/{store_id}/sale/{sale_id}/';
    method: 'DELETE';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        sale_id: Sale['id'];
      };
    };
    response: {
      200: { ok: string }; //セールが正しく削除できた時
      404: {
        error: string; //セールが存在しない時など
      };
    };
  },
  //セール取得API
  {
    path: '/api/store/{store_id}/sale/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id: Sale['id']; //ID指定で取得
        status: Sale['status']; //ステータス FINISHED | NOT_HELD | ON_HELD
        on_pause: Sale['on_pause']; //中止中かどうか
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        sales: Array<
          Sale & {
            products: Array<{
              rule: Sale_Product['rule']; //include or exclude
              product_id: Sale_Product['product_id']; //商品ID
              product_name: Product['display_name']; //商品名
              product__displayNameWithMeta: string;
              product__item__rarity: string;
              product__item__card_number: string;
              product__item__expansion: string;
            }>;
            departments: Array<{
              rule: Sale_Department['rule']; //include or exclude
              item_genre__id: Item_Genre['id']; //ジャンルID
              item_genre__display_name: Item_Genre['display_name'];
              item_category__id: Item_Category['id']; //商品種別ID
              item_category__display_name: Item_Category['display_name'];
            }>;
          }
        >;
      };
    };
  },
];
