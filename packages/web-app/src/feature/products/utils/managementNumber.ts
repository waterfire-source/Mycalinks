// 管理番号を未入力のプレフィックス
export const MANAGEMENT_NUMBER_PREFIX = 'auto-generated-';

// 管理番号を未入力(プレフィックスから始まる)の場合はtrueを返す
export const isManagementNumberEmpty = (managementNumber: string | null) => {
  if (!managementNumber) return true;
  return managementNumber.startsWith(MANAGEMENT_NUMBER_PREFIX);
};
