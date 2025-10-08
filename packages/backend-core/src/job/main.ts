//ワーカー向けのタスク管理をするためのクラス

import { BackendResources, BackendService } from '@/services/internal/main';

/**
 * jobのエラーの管理
 * リソースの管理など
 * jobの場合、1回のjobに1つのprocessIdではなく、複数のprocessIdが結びつく想定
 */
export class BackendJob extends BackendService {
  constructor(resources?: BackendResources) {
    super();
    this.generateService({
      resources,
    });
  }
}
