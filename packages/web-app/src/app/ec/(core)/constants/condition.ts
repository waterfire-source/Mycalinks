import { ConditionOptionHandle } from '@prisma/client';

// カード状態
export const cardCondition = [
  {
    label: '状態A',
    value: ConditionOptionHandle.O2_A,
  },
  {
    label: '状態B',
    value: ConditionOptionHandle.O4_B,
  },
  {
    label: '状態C',
    value: ConditionOptionHandle.O5_C,
  },
  {
    label: '状態D',
    value: ConditionOptionHandle.O6_D,
  },
  {
    label: 'プレイ用',
    value: ConditionOptionHandle.O3_FOR_PLAY,
  },
];

// ボックス状態
export const boxCondition = [
  {
    label: '新品',
    value: ConditionOptionHandle.O1_BRAND_NEW,
  },
  {
    label: '未使用',
    value: ConditionOptionHandle.O2_LIKE_NEW,
  },
  {
    label: '中古',
    value: ConditionOptionHandle.O3_USED,
  },
];
