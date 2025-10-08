import { BackendService } from '@/services/internal/main';
import { System_Log, SystemLogResourceKind } from '@prisma/client';

import { customDayjs } from 'common';

export class BackendCoreLogService extends BackendService {
  public domain: System_Log['domain'];
  public resource_id?: System_Log['resource_id'];
  public resource_kind?: System_Log['resource_kind'];
  public title?: System_Log['title'];
  public log_text?: System_Log['log_text'];

  constructor(domain: System_Log['domain'], title?: System_Log['title']) {
    super();
    this.domain = domain;
    this.title = title;
  }

  public setLogResource = (
    resourceInfo: Record<SystemLogResourceKind, System_Log['resource_id']>,
  ) => {
    this.resource_id = resourceInfo[this.domain];
    this.resource_kind = this.domain;
  };

  private get timestamp() {
    return customDayjs().tz().format('YYYY-MM-DD HH:mm:ss');
  }

  public add = (text: string) => {
    this.log_text += `\n${this.timestamp}: ${text}`;
  };

  public addJson = (json: Record<string, unknown>) => {
    this.log_text += `\n${this.timestamp}: ${JSON.stringify(json, null, 2)}`;
  };

  public save = async () => {
    try {
      const log = await this.db.system_Log.create({
        data: {
          domain: this.domain,
          resource_id: this.resource_id,
          resource_kind: this.resource_kind,
          title: this.title,
          log_text: this.log_text,
        },
      });

      //       console.log(
      //         `
      // 保存されたログ
      //       `,
      //         log,
      //       );

      return log;
    } catch (e) {
      console.log(`ログ保存に失敗`, e);
      return null;
    }
  };
}
