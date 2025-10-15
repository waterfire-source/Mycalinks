import { createClientAPI, CustomError } from '@/api/implement';
import { useEffect, useMemo, useState } from 'react';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export interface NotifyInfo {
  purchaseReception: {
    id: number;
    receptionNumber: number;
    assessed: boolean;
    termAcceptedAt: Date | null;
    storeId: number;
    canCreateSignature: boolean;
    storeName: string;
  };
}

// 30秒に一回取引情報を更新するhooks
export const useGlobalNotify = (selectedStoreId?: number) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { handleError } = useErrorAlert();

  //通知の内容をオブジェクト形式で保持する
  const [notifyInfo, setNotifyInfo] = useState<NotifyInfo>({
    purchaseReception: {
      //買取受付関連の通知
      id: 0, //取引のID
      receptionNumber: 0, //受付番号
      assessed: false, //査定中か査定済みか
      termAcceptedAt: null, //同意した日時
      storeId: 0, //ストアID
      canCreateSignature: false, //署名を作成できるかどうか
      storeName: '', //店舗名
    },
  });
  // 全店舗の取引データを保持
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  //情報をセットする
  const registerNotifyInfo = <K extends keyof NotifyInfo>(
    domain: K,
    info?: Partial<NotifyInfo[K]>,
  ) => {
    setNotifyInfo((prev) => ({
      ...prev,
      [domain]: info ?? ({} as NotifyInfo[K]),
    }));
  };

  //取引一覧の最新情報を取得する
  const fetchTransactionInfo = async () => {
    try {
      const transactions = await clientAPI.mycalinksTransaction.getAll({
        status: 'draft',
        transactionKind: 'buy',
      });
      if (transactions instanceof CustomError) {
        console.error(' 取引情報の取得に失敗しました:', transactions.message);
        return;
      }

      // 全ての下書き取引を保存
      const validTransactions = transactions.filter(
        (t) =>
          t.status === 'draft' &&
          t.transaction_kind === 'buy' &&
          t.reception_number &&
          !t.signature_image_url, //署名をまだしていないもの限定
      );
      setAllTransactions(validTransactions);

      // 店舗IDが指定されている場合はその店舗の取引情報を設定
      if (selectedStoreId) {
        const targetTransaction = validTransactions.find(
          (t) => t.store_id === selectedStoreId,
        );

        if (targetTransaction) {
          registerNotifyInfo('purchaseReception', {
            id: targetTransaction.id,
            receptionNumber: targetTransaction.reception_number ?? 0,
            assessed: targetTransaction.buy__is_assessed,
            termAcceptedAt: targetTransaction.term_accepted_at,
            storeId: targetTransaction.store_id,
            canCreateSignature: targetTransaction.can_create_signature,
            storeName: targetTransaction.store__display_name || '',
          });
        } else {
          // 指定された店舗IDの取引が見つからない場合はリセット
          registerNotifyInfo('purchaseReception');
        }
      } else {
        // 店舗IDが指定されていない場合（店舗選択前）はリセット
        registerNotifyInfo('purchaseReception');
      }
    } catch (error) {
      handleError(error);
    }
  };

  //30秒に一回くらい確認する
  useEffect(() => {
    setTimeout(() => {
      fetchTransactionInfo();
    }, 2000);
    const interval = setInterval(() => {
      console.log('30秒ごとにインターバルで呼ばれてる');
      fetchTransactionInfo();
    }, 30 * 1000); // 30秒ごと
    return () => clearInterval(interval);
  }, [selectedStoreId]); // selectedStoreIdが変更された時も再実行

  return {
    notifyInfo,
    setNotifyInfo,
    registerNotifyInfo,
    fetchTransactionInfo,
    allTransactions,
  };
};
