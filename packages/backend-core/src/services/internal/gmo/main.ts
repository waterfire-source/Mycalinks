//GMO関連

import { BackendService } from '@/services/internal/main';
import { BackendExternalGmoService } from '@/services/external';

export class BackendCoreGmoService extends BackendService {
  public config = {};
  public client: BackendExternalGmoService;

  constructor(mode: 'contract' | 'ec' = 'ec') {
    super();

    this.client = new BackendExternalGmoService(mode);
  }
}
