import { CustomError } from '@/api/implement';
import {
  createOrUpdateMemoDef,
  getMemoDef,
} from '@/app/api/store/[store_id]/memo/def';

export interface MemoAPI {
  getAll: {
    request: {
      storeID: number;
    };
    response: typeof getMemoDef.response | CustomError;
  };
  //メモ登録
  createMemo: {
    request: {
      storeID: number;
      content: string;
    };
    response: typeof createOrUpdateMemoDef.response | CustomError;
  };
  //メモ更新
  updateMemo: {
    request: {
      storeID: number;
      id: number;
      content: string;
    };
    response: typeof createOrUpdateMemoDef.response | CustomError;
  };
  //メモ削除
  deleteMemo: {
    request: {
      storeID: number;
      memoId: number;
    };
    response: typeof getMemoDef.response | CustomError;
  };
}
