import { useCallback, useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { TransactionKind, TransactionStatus } from '@prisma/client';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { getTransactionApi } from '@api-defs/transaction/def';
import z from 'zod';

// APIの型定義
export type GetTransactionResponse = z.infer<typeof getTransactionApi.response>;
type GetTransactionRequest =
  MycaPosApiClient['transaction']['getTransaction']['arguments'];
export const useSellTransactions = () => {
  const [transactions, setTransactions] = useState<
    GetTransactionResponse['transactions'] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // アラートのコンテキスト
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  // まだ取得しかopenAPI化していないので、取得だけmycaPosApiClientを使用する
  const mycaPosApiClient = useMemo(() => new MycaPosApiClient(), []);
  // 一時保留した販売の一覧を取得
  const fetchDraftSellTransactions = useCallback(
    async (request: GetTransactionRequest) => {
      const res = await mycaPosApiClient.transaction.getTransaction({
        ...request,
        transactionKind: TransactionKind.sell, // 販売のみ
        status: TransactionStatus.draft, // 一時保留のみ
      });
      // TODO: ここの型の不一致を解消する
      setTransactions(res.transactions);
    },
    [mycaPosApiClient.transaction],
  );

  // 一次保留した販売の取引履歴を作成
  const createDraftSellTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoading(true);
    try {
      const res = await clientAPI.transaction.create({
        ...request,
        transaction_kind: TransactionKind.sell, // 保険で指定しておく
        payment_method: null, // 保留の会計のためnull
        recieved_price: null, // 現金会計のお預かり
        change_price: null, // 現金会計お釣り
        asDraft: true, // 一時保存の設定
        disableGivePoint: request.disableGivePoint, //ポイント付与を無効にする
      });

      if (res instanceof CustomError) {
        console.error('販売の一時保留に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }

      setAlertState({
        message:
          request.payment_method === 'paypay'
            ? '会計端末を操作してください。'
            : 'お会計を保留しました。',
        severity: 'success',
      });

      return res.id;
    } catch {
      setAlertState({
        message: `予期せぬエラーが発生しました。`,
        severity: 'error',
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // 一時保留した販売をキャンセルする
  const cancelDraftSellTransaction = async (
    request: TransactionAPI['cancelSellDraft']['request'],
  ) => {
    setIsLoading(true);

    try {
      const res = await clientAPI.transaction.cancelSellDraft({
        store_id: request.store_id,
        transaction_id: request.transaction_id,
      });
      if (res instanceof CustomError) {
        console.error('保留した販売の削除に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setTransactions(
        (prev) => prev?.filter((p) => p.id !== request.transaction_id),
      );
      setAlertState({
        message: '保留した販売をキャンセルしました。',
        severity: 'success',
      });
    } catch {
      setAlertState({
        message: `予期せぬエラーが発生しました。`,
        severity: 'error',
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const createSellTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoading(true);
    try {
      const res = await clientAPI.transaction.create(request);
      if (res instanceof CustomError) {
        console.error('販売取引作成に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setAlertState({
        message: '取引作成成功',
        severity: 'success',
      });
      return res.id;
    } catch {
      setAlertState({
        message: `予期せぬエラーが発生しました。`,
        severity: 'error',
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // ゲストによる注文（一時保留）
  const createDraftSellTransactionByGuest = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoading(true);
    try {
      const res = await clientAPI.transaction.create({
        ...request,
        transaction_kind: TransactionKind.sell,
        payment_method: null,
        recieved_price: null,
        change_price: null,
        asDraft: true,
      });
      if (res instanceof CustomError) {
        handleError(res);
        return;
      }

      // 受付番号を返却
      return res;
    } catch (e) {
      handleError(e);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    isLoading,
    fetchDraftSellTransactions,
    createSellTransaction,
    createDraftSellTransaction,
    cancelDraftSellTransaction,
    createDraftSellTransactionByGuest,
  };
};
