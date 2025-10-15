import { MycaAppUser } from '@/types/BackendAPI';
import {
  Condition_Option,
  Item,
  Product,
  Store,
  Transaction,
  Transaction_Cart,
  Transaction_Customer_Cart,
} from '@prisma/client';

export type BackendAllTransactionAPI = [
  //すべての店の取引取得API（今の所、Mycaユーザー用）
  {
    path: '/api/store/all/transaction/';
    method: 'GET';
    request: {
      privileges: {
        role: ['myca_user']; //mycaアプリのトークンを使わないと実行できない
        policies: []; //実行に必要なポリシー
      };
      query: {
        status?: Transaction['status'];
        transaction_kind?: Transaction['transaction_kind'];
        store_id?: Transaction['store_id']; //店舗IDで絞り込み
      };
    };
    response: {
      200: Array<{
        created_at: Transaction['created_at'];
        customer_id: Transaction['customer_id'];
        discount_price: Transaction['discount_price'];
        id: Transaction['id'];
        payment_method: Transaction['payment_method'];
        original_transaction_id: Transaction['original_transaction_id'];
        register_account_id: Transaction['register_account_id'];
        staff_account_id: Transaction['staff_account_id'];
        status: Transaction['status'];
        buy__is_assessed: Transaction['buy__is_assessed'];
        store__display_name: Store['display_name'];
        store__image_url: Store['image_url'];
        store_id: Transaction['store_id'];
        subtotal_price: Transaction['subtotal_price'];
        tax: Transaction['tax'];
        total_price: Transaction['total_price'];
        point_amount: Transaction['point_amount'];
        total_point_amount: Transaction['total_point_amount'];
        transaction_kind: Transaction['transaction_kind'];
        updated_at: Transaction['updated_at'];
        term_accepted_at: Transaction['term_accepted_at'];
        reception_number: Transaction['reception_number'];
        signature_image_url: Transaction['signature_image_url'];
        can_create_signature: Transaction['can_create_signature']; //署名ができる状態かどうか
      }>;
    };
  },

  //すべての店の取引詳細情報取得API（今の所、Mycaユーザー用）
  {
    path: '/api/store/all/transaction/{transaction_id}/';
    method: 'GET';
    request: {
      privileges: {
        role: ['myca_user']; //mycaアプリのトークンを使わないと実行できない
        policies: []; //実行に必要なポリシー
      };
      query: {
        myca_user: MycaAppUser['id'];
        status: Transaction['status'];
        transaction_kind: Transaction['transaction_kind'];
      };
      params: {
        transaction_id: Transaction['id'];
      };
    };
    response: {
      200: {
        id: Transaction['id'];
        register_account_id: Transaction['register_account_id'];
        staff_account_id: Transaction['staff_account_id'];
        store_id: Transaction['store_id'];
        store__display_name: Store['display_name'];
        customer_id: Transaction['customer_id'];
        transaction_kind: Transaction['transaction_kind'];
        total_price: Transaction['total_price'];
        subtotal_price: Transaction['subtotal_price'];
        tax: Transaction['tax'];
        discount_price: Transaction['discount_price'];
        payment_method: Transaction['payment_method'];
        status: Transaction['status'];
        buy__is_assessed: Transaction['buy__is_assessed'];
        original_transaction_id: Transaction['original_transaction_id'];
        created_at: Transaction['created_at'];
        updated_at: Transaction['updated_at'];
        finished_at: Transaction['finished_at'];
        point_amount: Transaction['point_amount'];
        total_point_amount: Transaction['total_point_amount'];
        reception_number: Transaction['reception_number'];
        transaction_carts: Array<{
          product__condition_option__display_name: string;
          item_count: Transaction_Cart['item_count'];
          unit_price: Transaction_Cart['unit_price'];
          discount_price: Transaction_Cart['discount_price'];
          total_discount_price: Transaction_Cart['total_discount_price'];
          sale_discount_price: Transaction_Cart['sale_discount_price'];
          total_unit_price: Transaction_Cart['total_unit_price'];
          product__id: Product['id'];
          product__display_name: Product['display_name'];
          product__image_url: Product['image_url'];
          product__conditions: Array<{
            condition_option__display_name: Condition_Option['display_name'];
          }>;
          product__specialty__display_name: Specialty['display_name'];
          item_cardnumber: Item['cardnumber'];
          item_expansion: Item['expansion'];
          item_rarity: Item['rarity'];
        }>;
        transaction_customer_carts: Array<{
          item_count: Transaction_Customer_Cart['item_count'];
          unit_price: Transaction_Customer_Cart['unit_price'];
          discount_price: Transaction_Customer_Cart['discount_price'];
          product__id: Product['id'];
          product__display_name: Product['display_name'];
          product__image_url: Product['image_url'];
          product__conditions: Array<{
            condition_option__display_name: Condition_Option['display_name'];
          }>;
          item_cardnumber: Item['cardnumber'];
          item_expansion: Item['expansion'];
        }>;
      };
    };
  },

  //顧客カート内容変更API
  {
    path: '/api/store/all/transaction/{transaction_id}/customer-cart/';
    method: 'PUT';
    request: {
      privileges: {
        role: ['myca_user']; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        transaction_id: Transaction['id'];
      };
      body: {
        myca_user: MycaAppUser['id'];
        carts: Array<Transaction_Customer_Cart>;
      };
    };
    response: {
      200: {
        ok: string;
      };
      400: {
        //情報が足りない時など
      };
      401: {
        //フィールド指定が不正な時や権限がない時
      };
    };
  },

  //署名、同意記録API
  {
    path: '/api/store/all/transaction/{transaction_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: ['myca_user']; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        transaction_id: Transaction['id'];
      };
      body: {
        myca_user: MycaAppUser['id'];
        signature_image_url: Transaction['signature_image_url'];
        term_accepted_at: Transaction['term_accepted_at']; //同意した日時
      };
    };
    response: {
      200: {
        ok: string;
      };
      400: {
        //情報が足りない時など
      };
      401: {
        //フィールド指定が不正な時や権限がない時
      };
    };
  },
];
