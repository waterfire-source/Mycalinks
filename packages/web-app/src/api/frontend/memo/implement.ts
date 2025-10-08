import { MemoAPI } from '@/api/frontend/memo/api';
import { customFetch, METHOD } from '@/api/implement';
import { createOrUpdateMemoDef } from '@/app/api/store/[store_id]/memo/def';

export const memoImplement = () => {
  return {
    getAll: async (
      request: MemoAPI['getAll']['request'],
    ): Promise<MemoAPI['getAll']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/memo`,
      })();
    },

    createMemo: async (
      request: MemoAPI['createMemo']['request'],
    ): Promise<MemoAPI['createMemo']['response']> => {
      const body: typeof createOrUpdateMemoDef.request.body = {
        id: undefined,
        content: request.content,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/memo`,
        body,
      })();
    },

    updateMemo: async (
      request: MemoAPI['updateMemo']['request'],
    ): Promise<MemoAPI['updateMemo']['response']> => {
      const body: typeof createOrUpdateMemoDef.request.body = {
        id: request.id,
        content: request.content,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeID}/memo`,
        body,
      })();
    },

    deleteMemo: async (
      request: MemoAPI['deleteMemo']['request'],
    ): Promise<MemoAPI['deleteMemo']['response']> => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/memo/${request.memoId}`,
      })();
    },
  };
};
