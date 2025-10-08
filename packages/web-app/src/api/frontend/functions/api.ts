import { CustomError } from '@/api/implement';
import { BackendFunctionsAPI } from '@/app/api/store/[store_id]/functions/api';
import { Store } from '@prisma/client';

export interface FunctionsAPI {
  uploadImage: {
    request: {
      store_id: Store['id'];
      body: {
        file: File;
        kind: 'item' | 'product' | 'transaction' | 'store';
      };
    };
    response: BackendFunctionsAPI[0]['response'][200] | CustomError;
  };
}
