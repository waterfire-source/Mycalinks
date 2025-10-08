import { apiMethod, apiRole, Optional, Required } from '@/api/backendApi/main';
import { Memo, Store } from '@prisma/client';

//メモ
/**
 * @deprecated Use createOrUpdateMemoApi from api-generator instead
 */
export const createOrUpdateMemoDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/memo',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Memo['id']>(), //既存のメモID
      content: Required<Memo['content']>(), //メモ内容（改行も保存する）
    },
  },
  process: `
  `,
  response: <
    Memo //作成されたリソースの情報
  >{},
  error: {} as const,
};

//メモ削除
/**
 * @deprecated Use deleteMemoApi from api-generator instead
 */
export const deleteMemoDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/memo/[memo_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      memo_id: Required<Memo['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: 'メモが削除できました',
  },
  error: {} as const,
};

//メモ取得
/**
 * @deprecated Use getMemoApi from api-generator instead
 */
export const getMemoDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/memo',
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
  response: <
    {
      memos: Array<Memo>;
    }
  >{},
  error: {} as const,
};
