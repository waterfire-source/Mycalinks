import { BackendAPI } from '@/api/backendApi/main';
import { resetCustomerPointDef } from '@/app/api/store/all/customer/def';

//APIの説明
export const POST = BackendAPI.defineApi(
  resetCustomerPointDef, //定義書
  async (API) => {
    //本処理

    return; //レスポンス
  },
);
