import { MycaAppUser } from '@/types/BackendAPI';
import { Store, Customer, Item_Genre } from '@prisma/client';

export type BackendCustomerAPI = [
  //顧客登録API、ついでに取得できる
  {
    path: '/api/store/{store_id}/customer/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id']; //会員を登録する対象のストア
      };
      body: {
        myca_user_id?: MycaAppUser['id']; //Mycaアプリからフェッチして自動で登録してくれる

        mycaBarCode?: string; //Mycaアプリで発行したバーコードの文字列（署名付き）　ゆくゆくはこちらのみの対応にする
        //こちらのパラメータにPOS会員のバーコードを入れることで、POS会員の情報も取得可能

        //以下、新規POS会員登録用
        //myca_user_idやmycaBarcodeなどを指定していなかった場合、自動的に新規登録を行う
        birthday?: Customer['birthday'];
        zip_code?: Customer['zip_code'];
        prefecture?: Customer['prefecture'];
        city?: Customer['city'];
        address2?: Customer['address2'];
        building?: Customer['building'];
        full_name?: Customer['full_name'];
        full_name_ruby?: Customer['full_name_ruby'];
        phone_number?: Customer['phone_number'];
        gender?: Customer['gender'];
        career?: Customer['career'];
        is_active?: Customer['is_active']; //アクティブ会員として登録するかどうか 指定しなかったら非アクティブとなる
        term_accepted_at?: Customer['term_accepted_at']; //買取の規約に同意した日時
      };
    };
    response: {
      200: {
        barcode?: string;
        //201は新しく顧客が作成された時
        id: Customer['id'];
        email: Customer['email'];
        myca_user_id: Customer['myca_user_id'];
        birthday: Customer['birthday'];
        registration_date: Customer['registration_date'];
        owned_point: Customer['owned_point'];
        point_exp: Customer['point_exp'];
        lastUsedDate: Date | null; //最終利用日（最後のTransaction）
        address: Customer['address'];
        zip_code: Customer['zip_code'];
        prefecture: Customer['prefecture'];
        address2: Customer['address2'];
        city: Customer['city'];
        building: Customer['building'];
        phone_number: Customer['phone_number'];
        gender: Customer['gender'];
        career: Customer['career'];
        full_name: Customer['full_name'];
        full_name_ruby: Customer['full_name_ruby'];
        zip_code: Customer['zip_code'];
        is_active: Customer['is_active']; //アクティブ会員かどうか
      };
      201: {
        //201は新しく顧客が作成された時
        id: Customer['id'];
        email: Customer['email'];
        myca_user_id: Customer['myca_user_id'];
        birthday: Customer['birthday'];
        registration_date: Customer['registration_date'];
        owned_point: Customer['owned_point'];
        point_exp: Customer['point_exp'];
        lastUsedDate: Date | null; //最終利用日（最後のTransaction）
        address: Customer['address'];
        zip_code: Customer['zip_code'];
        prefecture: Customer['prefecture'];
        address2: Customer['address2'];
        city: Customer['city'];
        building: Customer['building'];
        phone_number: Customer['phone_number'];
        gender: Customer['gender'];
        career: Customer['career'];
        full_name: Customer['full_name'];
        barcode?: string; //POS会員を初めて登録した時は、バーコードの文字列も返される
        is_active: Customer['is_active']; //アクティブ会員かどうか
      };
    };
  },

  //顧客情報を取得できる
  {
    path: '/api/store/{store_id}/customer/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Customer['id']; //顧客のID カンマ区切りにすることで複数条件も対応
        full_name?: Customer['full_name']; //顧客名、ふりがなでの部分一致検索
        memo?: Customer['memo']; //メモでの部分一致検索
        includesTransactionStats?: true; //取引の統計情報を同時に取得するかどうか
      };
      params: {
        store_id: Store['id']; //会員を登録する対象のストア
      };
      body: object;
    };
    response: {
      200: Array<{
        //複数返ってくる
        id: Customer['id'];
        email: Customer['email'];
        myca_user_id: Customer['myca_user_id'];
        birthday: Customer['birthday'];
        registration_date: Customer['registration_date'];
        owned_point: Customer['owned_point'];
        point_exp: Customer['point_exp'];
        lastUsedDate: Date | null; //最終利用日（最後のTransaction）
        transactionStats: {
          groupByItemGenreTransactionKind: Array<{
            //取引の種類、部門とその回数を返す
            transaction_kind: Transaction['transaction_kind'];
            genre_display_name: Item_Genre['display_name'];
            total_count: number;
          }>;
          numberOfVisits: number; //来店回数
        };
        address: Customer['address'];
        zip_code: Customer['zip_code'];
        prefecture: Customer['prefecture'];
        address2: Customer['address2'];
        city: Customer['city'];
        building: Customer['building'];
        phone_number: Customer['phone_number'];
        gender: Customer['gender'];
        career: Customer['career'];
        full_name: Customer['full_name'];
        full_name_ruby: Customer['full_name_ruby'];
        zip_code: Customer['zip_code'];
        is_active: Customer['is_active']; //アクティブ会員かどうか
        memo: Customer['memo']; //メモ
        barcode: string; //バーコード
      }>;
    };
  },
];

//特定の顧客に付与できるポイントを取得する
export type getAddablePointDef = {
  path: '/api/store/{store_id}/customer/{customer_id}/addable-point/';
  method: 'GET';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };
    query: {
      totalPrice: number; //お会計価格
      transactionKind: TransactionKind; //取引の種類
      paymentMethod: TransactionPaymentMethod; //支払い方法
    };
    params: {
      store_id: Store['id'];
      customer_id: Customer['id'];
    };
  };
  response: {
    200: {
      pointAmount: number; //付与できるポイント
      totalPointAmount: number; //付与したら何ポイントになるのか
    };
  };
};
