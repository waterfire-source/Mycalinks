import { ConditionOptionHandle } from '@prisma/client';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';

/**
 * 商品状態のキーからラベルを取得する
 * @param conditionKey - 商品状態のキー（ConditionOptionHandle）
 * @returns 商品状態のラベル
 */
export const getConditionLabel = (
  conditionKey: ConditionOptionHandle | null | undefined,
): string => {
  if (!conditionKey) return '';

  // カードとボックスの状態を結合して検索
  const allConditions = [...cardCondition, ...boxCondition];
  return (
    allConditions.find((condition) => condition.value === conditionKey)
      ?.label ?? ''
  );
};
