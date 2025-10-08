import { $Enums } from '@prisma/client';

// MALL掲載時の特殊状態一覧
export const mallSpecialtyConditions = [
  {
    label: 'PSA10',
    value: $Enums.SpecialtyHandle.S1_PSA10,
  },
  {
    label: '未開封',
    value: $Enums.SpecialtyHandle.S50_UNBOXED,
  },
  {
    label: '指定なし',
    value: undefined,
  },
] as const;
