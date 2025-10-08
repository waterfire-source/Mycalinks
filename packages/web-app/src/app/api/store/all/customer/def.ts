import { apiMethod, apiRole } from '@/api/backendApi/main';

//顧客のポイントをバッチ処理によってリセットするAPI
export const resetCustomerPointDef = {
  method: apiMethod.POST,
  path: 'store/all/customer/reset-point/',
  privileges: {
    role: [apiRole.bot],
  },
  request: {},
  process: `
  全ての顧客のポイント有効期限を確認し、必要に応じてポイントを0にリセットする
  `,
  response: {
    ok: 'ポイントリセット完了',
  },
};
