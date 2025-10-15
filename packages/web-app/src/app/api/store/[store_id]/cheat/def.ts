import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { Store } from '@prisma/client';

//EC全出品
export const stockingAllProductsDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/cheat/stocking-all-products',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: 'すべての商品がECに出品できました',
  },
};
