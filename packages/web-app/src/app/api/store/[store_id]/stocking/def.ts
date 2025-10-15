import {
  apiMethod,
  apiRole,
  Required,
  ResponseMsgKind,
} from '@/api/backendApi/main';
import { Store, Supplier } from '@prisma/client';

/**
 * @deprecated Use deleteStockingSupplierApi from api-generator instead
 */
//仕入れ先削除API
export const deleteStockingSupplierDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/stocking/supplier/[supplier_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      supplier_id: Required<Supplier['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: ResponseMsgKind.deleted,
  },
};
