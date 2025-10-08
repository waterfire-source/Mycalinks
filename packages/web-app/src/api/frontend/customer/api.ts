import { Customer, Store } from '@prisma/client';

import { CustomError } from '@/api/implement';
import { MycaAppUser } from '@/types/BackendAPI';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import {
  changeCustomerPointDef,
  updateCustomerDef,
} from '@/app/api/store/[store_id]/customer/def';
export interface CustomerAPI {
  // mycaに登録されているがmycaPOSで作成されていない場合は、Customerを作成して顧客情報を返す
  getByMycaID: {
    request: {
      store_id: Store['id'];
      mycaBarCode?: string;
      myca_user_id?: MycaAppUser['id'];
    };
    response: BackendCustomerAPI[0]['response']['200'] | CustomError;
  };
  //非会員：顧客情報を仮登録する
  createGuestCustomer: {
    request: {
      store_id: Store['id'];
      full_name: Customer['full_name'];
      full_name_ruby: Customer['full_name_ruby'];
      birthday: Customer['birthday'];
      zip_code: Customer['zip_code'];
      prefecture: Customer['prefecture'];
      city: Customer['city'];
      address2: Customer['address2'];
      building?: Customer['building'];
      phone_number: Customer['phone_number'];
      career: Customer['career'];
      gender: Customer['gender'];
    };
    response: BackendCustomerAPI[0]['response']['200'] | CustomError;
  };
  // 顧客情報をカスタマーIDから取得
  getByCustomerID: {
    request: {
      store_id: Store['id'];
      customer_id: Customer['id'];
      includesTransactionStats?: true;
    };
    response:
      | BackendCustomerAPI[1]['response']['200'][0] // １つのカスタマーを取得するAPIなので１つめの要素を返す
      | CustomError;
  };
  // 全顧客情報を取得するAPI
  getAllCustomer: {
    request: {
      store_id: Store['id'];
      includesTransactionStats?: true;
      fullName?: Customer['full_name'];
      memo?: Customer['memo'];
    };
    response: BackendCustomerAPI[1]['response']['200'] | CustomError;
  };
  // 顧客ポイント変更
  changeCustomerPoint: {
    request: {
      store_id: Store['id'];
      customer_id: Customer['id'];
      point: number;
    };
    response: typeof changeCustomerPointDef.response | CustomError;
  };

  //顧客情報更新　主にメモ機能
  updateCustomer: {
    request: {
      store_id: Store['id'];
      customer_id: Customer['id'];
      memo: Customer['memo'];
    };
    response: typeof updateCustomerDef.response | CustomError;
  };
}
