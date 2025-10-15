import { Account, Corporation, Register, Store } from '@prisma/client';
import 'next-auth';

export enum PosRunMode {
  sales = 'sales', //営業モード
  admin = 'admin', //管理モード
}

export type SessionUser = {
  id: Account['id'];
  // role: string; //ロールは廃止された
  email: Account['email'];
  display_name: Account['display_name'];
  mode: PosRunMode;
  corporation_id: Corporation['id']; //必ず入る
  store_id?: Store['id']; //営業モードの時だけ
  register_id?: Register['id'] | null; //営業モードの時だけ レジとして起動しない場合はnull
  isGod?: boolean; //神モードかどうか
};
declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}

declare module 'next-auth/client' {
  export interface Session {
    user: SessionUser;
  }
}
