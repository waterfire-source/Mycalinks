import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Condition } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';
import { mycaPosCommonConstants } from '@/constants/mycapos';
const {
  conditions: { cardConditions },
} = mycaPosCommonConstants;

// 現在このエンドポイントは使用されていない
// TODO：categoryから引くようにする

export const useConditions = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [conditions, setConditions] = useState<Condition[] | undefined>(
    undefined,
  );
  // const [cardCondition, setCardCondition] = useState<Condition | undefined>(
  //   undefined,
  // );

  // パックのカードの情報を取得
  const fetchConditions = useCallback(
    async (storeID: number) => {
      const response = await clientAPI.store.getConditions({
        storeID: storeID,
      });

      if (response instanceof CustomError) {
        console.error('コンディション情報の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      setConditions(response);
    },
    [clientAPI.item, setAlertState],
  );

  // "カード"がdisplay_nameに含まれる条件を検索する関数]
  //カード特有のcondition
  const cardCondition = useMemo(() => {
    if (!conditions) return;

    const cardConditionData = conditions.find(
      (condition: Condition) =>
        condition.display_name &&
        condition.display_name.includes(cardConditions),
    );

    return (
      cardConditionData || {
        id: -1, // ダミーIDを設定
        store_id: 0, // ダミーIDを設定
        display_name: '登録データなし',
      }
    );
  }, [conditions]);

  return { conditions, cardCondition, fetchConditions };
};
