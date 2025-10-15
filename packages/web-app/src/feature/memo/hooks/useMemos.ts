import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { Memo } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useMemos = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [memos, setMemos] = useState<Memo[]>([]);

  //メモの取得
  const fetchMemoList = useCallback(async () => {
    const res = await clientAPI.memo.getAll({
      storeID: store.id,
    });

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }
    setMemos(res.memos);
  }, [clientAPI.memo, setAlertState, store.id]);

  //メモの作成
  const createMemo = useCallback(
    async (content: string) => {
      const res = await clientAPI.memo.createMemo({
        storeID: store.id,
        content,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
    },
    [clientAPI.memo, setAlertState, store.id],
  );

  //メモの更新
  const updateMemo = useCallback(
    async (id: number, content: string) => {
      const res = await clientAPI.memo.updateMemo({
        storeID: store.id,
        id,
        content,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
    },
    [clientAPI.memo, setAlertState, store.id],
  );

  //メモの削除
  const deleteMemo = useCallback(
    async (id: number) => {
      const res = await clientAPI.memo.deleteMemo({
        storeID: store.id,
        memoId: id,
      });
      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
    },
    [clientAPI.memo, setAlertState, store.id],
  );

  return { memos, fetchMemoList, createMemo, updateMemo, deleteMemo };
};
