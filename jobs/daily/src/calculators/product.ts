import { BackendCoreProductEtlService, BackendJob } from 'backend-core';

/**
 * 在庫関連の計算
 */
export const productCalculator = async (job: BackendJob, targetDay: Date) => {
  const productService = new BackendCoreProductEtlService();
  job.give(productService);

  await productService.dailyCalculate(targetDay);
};

/**
 * 外部ECサービスとの不整合を埋める
 */
