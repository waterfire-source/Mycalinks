import { useCallback, useMemo, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { TransactionKind, TransactionStatus } from '@prisma/client';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { TransactionAPI } from '@/api/frontend/transaction/api';

//未査定の取引データ関連のhooks
export const usePurchaseTransaction = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [assessedTransactions, setAssessedTransactions] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'][0][]
  >([]);
  const [unassessedTransactions, setUnassessedTransactions] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'][0][]
  >([]);
  const [completedTransactions, setCompletedTransactions] = useState<
    BackendTransactionAPI[5]['response']['200']['transactions'][0][]
  >([]);
  const [isLoadingAssessed, setIsLoadingAssessed] = useState<boolean>(false);
  const [isLoadingUnassessed, setIsLoadingUnassessed] =
    useState<boolean>(false);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState<boolean>(false);
  const [isLoadingTransaction, setIsLoadingTransaction] =
    useState<boolean>(false);

  // 査定済みの買取査定データを取得
  const fetchAssessedTransactions = useCallback(
    async (storeID: number, createdAtStart?: Date, createdAtEnd?: Date) => {
      setIsLoadingAssessed(true);
      try {
        const res = await clientAPI.transaction.listTransactions({
          store_id: storeID,
          transaction_kind: 'buy', // 買取取引のみを取得
          buy__is_assessed: true, // 査定済みのもののみを取得
          status: TransactionStatus.draft,
          createdAtStart: createdAtStart ?? undefined,
          createdAtEnd: createdAtEnd ?? undefined,
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }

        setAssessedTransactions(res.transactions);
      } catch (error) {
        console.error('査定済みの買取査定の取得に失敗しました。');
        setAlertState({
          message: '査定済みの買取査定の取得に失敗しました。',
          severity: 'error',
        });
      } finally {
        setIsLoadingAssessed(false);
      }
    },
    [clientAPI.transaction, setAlertState],
  );

  // 未査定の買取査定データを取得
  const fetchUnassessedTransactions = useCallback(
    async (storeID: number, createdAtStart?: Date, createdAtEnd?: Date) => {
      setIsLoadingUnassessed(true);
      try {
        const res = await clientAPI.transaction.listTransactions({
          store_id: storeID,
          transaction_kind: 'buy', // 買取取引のみを取得
          buy__is_assessed: false, // 未査定のもののみを取得
          status: TransactionStatus.draft,
          createdAtStart: createdAtStart ?? undefined,
          createdAtEnd: createdAtEnd ?? undefined,
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }

        setUnassessedTransactions(res.transactions);
      } catch (error) {
        console.error('未査定の買取査定の取得に失敗しました。');
        setAlertState({
          message: '未査定の買取査定の取得に失敗しました。',
          severity: 'error',
        });
      } finally {
        setIsLoadingUnassessed(false);
      }
    },
    [clientAPI.transaction, setAlertState],
  );

  // 会計済みの買取査定データを取得
  const fetchCompletedTransactions = useCallback(
    async (storeID: number, createdAtStart?: Date, createdAtEnd?: Date) => {
      setIsLoadingCompleted(true);
      try {
        const res = await clientAPI.transaction.listTransactions({
          store_id: storeID,
          transaction_kind: 'buy', // 買取取引のみを取得
          buy__is_assessed: true,
          status: TransactionStatus.completed,
          createdAtStart: createdAtStart ?? undefined,
          createdAtEnd: createdAtEnd ?? undefined,
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }

        setCompletedTransactions(res.transactions);
      } catch (error) {
        console.error('会計済みの買取査定の取得に失敗しました。');
        setAlertState({
          message: '会計済みの買取査定の取得に失敗しました。',
          severity: 'error',
        });
      } finally {
        setIsLoadingCompleted(false);
      }
    },
    [clientAPI.transaction, setAlertState],
  );

  const { ePosDev } = useEposDevice();

  // 査定後にその内容でtransactionレコードを更新させて、 buy__is_assessedをfalseにさせる関数。
  const createDraftUnappreciatedPurchaseTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoadingTransaction(true);
    try {
      const transactionData = {
        ...request,
        transaction_kind: TransactionKind.buy,
        payment_method: null,
        recieved_price: null,
        change_price: null,
        asDraft: true,
        buy__is_assessed: false,
      };

      if (request.customer_id)
        transactionData.staff_account_id = request.customer_id;
      if (request.store_id) transactionData.store_id = request.store_id;
      if (request.staff_account_id)
        transactionData.staff_account_id = request.staff_account_id;
      if (request.id_kind) transactionData.id_kind = request.id_kind;
      if (request.id_number) transactionData.id_number = request.id_number;
      if (request.parental_consent_image_url)
        transactionData.parental_consent_image_url =
          request.parental_consent_image_url;
      if (request.description)
        transactionData.description = request.description;
      if (request.parental_contact)
        transactionData.parental_contact = request.parental_contact;

      const res = await clientAPI.transaction.create(transactionData);

      if (res instanceof CustomError) {
        console.error('保存に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        throw res;
      }
      if (request.carts.length === 0) {
        setAlertState({
          message: '取引データの作成が完了しました。',
          severity: 'success',
        });

        if (ePosDev && res.purchaseReceptionNumberReceiptCommand) {
          await ePosDev.printWithCommand(
            res.purchaseReceptionNumberReceiptCommand,
            request.store_id,
          );

          //スタッフ用もあったらそれも印刷
          if (res.purchaseReceptionNumberForStaffReceiptCommand) {
            await ePosDev.printWithCommand(
              res.purchaseReceptionNumberForStaffReceiptCommand,
              request.store_id,
            );
          }
        }
      } else {
        setAlertState({
          message: '査定内容の一時保存が完了しました。',
          severity: 'success',
        });
      }

      return res;
    } catch (e) {
      setAlertState({
        message: `${
          e instanceof CustomError
            ? e.message
            : '予期せぬエラーが発生しました。'
        }`,
        severity: 'error',
      });
      throw e;
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  // 査定後にその内容でtransactionレコードを更新させて、 buy__is_assessedをfalseにさせる関数。
  const createDraftAppraisedPurchaseTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoadingTransaction(true);
    try {
      const res = await clientAPI.transaction.create({
        ...request,
        transaction_kind: TransactionKind.buy,
        payment_method: null,
        recieved_price: null,
        change_price: null,
        asDraft: true,
        buy__is_assessed: true,
      });
      if (res instanceof CustomError) {
        console.error('査定情報の保存に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setAlertState({
        message: '査定が完了しました。',
        severity: 'success',
      });
      return res;
    } catch {
      setAlertState({
        message: `予期せぬエラーが発生しました。`,
        severity: 'error',
      });
      return;
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  // 買取をキャンセルする関数
  const cancelDraftUnappreciatedPurchaseTransaction = async ({
    store_id,
    transaction_id,
  }: {
    store_id?: number;
    transaction_id?: number;
  }) => {
    if (!store_id || !transaction_id) {
      console.error(
        '買取のキャンセルに失敗しました。store_id または transaction_id が未定義です。',
      );
      setAlertState({
        message: '買取のキャンセルに失敗しました。必要な情報が不足しています。',
        severity: 'error',
      });
      return;
    }

    const res = await clientAPI.transaction.cancelPurchaseDraft({
      store_id,
      transaction_id,
    });

    if (res instanceof CustomError) {
      console.error('買取のキャンセルに失敗しました。');
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return res;
    } else {
      setAlertState({
        message: '買取のキャンセルが完了しました。',
        severity: 'success',
      });
    }

    return res;
  };

  const createPurchaseTransaction = async (
    request: TransactionAPI['create']['request'],
  ) => {
    setIsLoadingTransaction(true);

    try {
      const res = await clientAPI.transaction.create(request);
      if (res instanceof CustomError) {
        console.error('買取取引作成に失敗しました。');
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
      setIsLoadingTransaction(false);
    }
  };

  return {
    fetchAssessedTransactions,
    fetchUnassessedTransactions,
    fetchCompletedTransactions,
    createDraftUnappreciatedPurchaseTransaction,
    createDraftAppraisedPurchaseTransaction,
    cancelDraftUnappreciatedPurchaseTransaction,
    createPurchaseTransaction,
    assessedTransactions,
    unassessedTransactions,
    completedTransactions,
    isLoadingAssessed,
    isLoadingUnassessed,
    isLoadingCompleted,
    isLoadingTransaction,
  };
};
