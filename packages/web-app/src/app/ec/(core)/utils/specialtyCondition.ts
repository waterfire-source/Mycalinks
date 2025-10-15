import { SpecialtyHandle } from '@prisma/client';
import { mallSpecialtyConditions } from '@/app/ec/(core)/constants/specialtyCondition';

/**
 * スペシャルティのキーからラベルを取得する
 * @param specialtyKey - スペシャルティのキー（SpecialtyHandle）
 * @returns スペシャルティのラベル
 */
export const getSpecialtyLabel = (
  specialtyKey: SpecialtyHandle | null | undefined,
): string => {
  if (!specialtyKey) return '';

  return (
    mallSpecialtyConditions.find(
      (specialty) => specialty.value === specialtyKey,
    )?.label ?? ''
  );
};
