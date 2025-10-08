import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';

export const usePurchaseTerm = (storeID: number) => {
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const { fetchPurchaseTerm } = useGetPurchaseTerm();
  const { updatePurchaseTerm } = useUpdatePurchaseTerm();
  const defaultTerm =
    '（身分証明書について）\n・18歳以上の方は、運転免許証、保険証などの身分証をお持ち下さい。\n・18歳未満の方(高校生を含む)は、保護者様の「保護者名前の記入」、「認印」が必要です。 それに加え、写真付き学生証など本人であることが確認できる身分証明書をお持ち下さい。 又、お見積り完了後同意書をご記入いただいた保護者様へ電話確認をさせて頂きます。\n・小学生以下の方は、保護者の同伴がない限り、買取はできません。保護者の方が同伴する場合は、保護者様の身分証明書が必要です。\n\n(トレカの買取について)\n・トレカをお売りの場合、スリーブを外してお持ち下さい。\n・買取可能なノーマルカードは100枚毎にまとめてお持ち下さい。\n・申込後の買取は当日中の営業時間のみ可能です。お預かりできませんのでご注意下さい。 当日中にお戻り頂けない場合は、当社規定により処分させて頂く場合がございます。\n・模倣品、偽造品、海賊品、盗難紛失品などで不正入手した商品は買取をお断り致します。 買取後に不正入手が発覚した場合、損害賠償請求を行うことがあります。\n・買取成立後の取り消し、返品、キャンセルは一切お受けできません。';
  const [term, setTerm] = useState<string | undefined>(undefined);
  // 所属するstoreの買取規約を取得
  const fetchTerms = useCallback(async () => {
    const res = await fetchPurchaseTerm(storeID);
    if (res) {
      setTerm(res);
    }
  }, [fetchPurchaseTerm, storeID]);
  const updateTerm = async () => {
    setIsUpdateLoading(true);
    await updatePurchaseTerm(storeID, term ?? '');
    setIsUpdateLoading(false);
  };
  return {
    defaultTerm,
    term,
    setTerm,
    fetchTerms,
    updateTerm,
    isUpdateLoading,
  };
};
export const useGetPurchaseTerm = () => {
  const storeAPI = useMemo(() => createClientAPI().store, []);
  const { setAlertState } = useAlert();
  const fetchPurchaseTerm = useCallback(
    async (storeID: number) => {
      const res = await storeAPI.getTerm({
        storeID,
      });
      if (res instanceof CustomError) {
        setAlertState({ message: res.message, severity: 'error' });
        return;
      }
      return res.buy_term;
    },
    [setAlertState, storeAPI],
  );
  return {
    fetchPurchaseTerm,
  };
};

export const useUpdatePurchaseTerm = () => {
  const storeAPI = useMemo(() => createClientAPI().store, []);
  const { setAlertState } = useAlert();
  const updatePurchaseTerm = useCallback(
    async (storeID: number, term: string) => {
      const res = await storeAPI.updateTerm({
        storeID,
        buy_term: term,
      });
      if (res instanceof CustomError) {
        setAlertState({ message: res.message, severity: 'error' });
        return;
      }
      return res;
    },
    [setAlertState, storeAPI],
  );
  return {
    updatePurchaseTerm,
  };
};
