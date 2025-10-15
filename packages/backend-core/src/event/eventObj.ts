//サーバーイベントの型を定義する

import { AllKindsType } from '@/task/main';
import {
  Pack_Open_History,
  Transaction as PrismaTransaction,
  Item as PrismaItem,
  Original_Pack_Product,
  Inventory as PrismaInventory,
  Inventory_Products,
  Store,
  Pack_Open_Products,
  Account,
  Task,
  Inventory_Genre,
  Inventory_Category,
  Device,
} from '@prisma/client';

export namespace ApiEventObj {
  //ストアのステータスが変わった時のイベント 廃止予定
  export type StoreStatus = {
    id: Store['id'];
    status_message: Store['status_message'];
    status_message_updated_at: Store['status_message_updated_at'];
  };

  export type Transaction = PrismaTransaction;

  //パック開封が作成・更新された時のイベント
  export type PackOpenHistory = Pack_Open_History & {
    to_products: Array<
      Pack_Open_Products & {
        //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
        staff_account: {
          display_name: Account['display_name']; //担当者名
          // kind: Account['kind']; //このアカウントの種類
        };
      }
    >;
  };

  //棚卸しが更新された時のイベント
  export type Inventory = PrismaInventory & {
    products: Array<
      Inventory_Products & {
        //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
        staff_account: {
          display_name: Account['display_name']; //担当者名
          // kind: Account['kind']; //このアカウントの種類
        };
      }
    >;
    item_genres: Array<Inventory_Genre>;
    item_categories: Array<Inventory_Category>;
  };

  //商品マスタの情報が更新された時のイベント
  //現在はオリパの定義が更新された時のみPUBLISHされる
  export type Item = PrismaItem & {
    original_pack_products?: Array<
      Original_Pack_Product & {
        //オリパ定義 この中の在庫の情報の取得については product取得APIを使いたい
        staff_account: {
          display_name: Account['display_name']; //担当者名
          // kind: Account['kind']; //このアカウントの種類
        };
      }
      //今後、バンドルなどでもこのイベントを使う場合、バンドルのフィールドまでemitしたい
    >;
  };

  //非同期系タスクの進捗度イベント
  export type TaskProgress = {
    process_id: Task['process_id']; //リクエストID（リクエストごとに一意）
    target_worker: Task['target_worker']; //タスクの処理の対象ワーカー
    kind: AllKindsType; //タスクの種類
    status: Task['status']; //タスクのステータス QUEUEDはリクエストを送信した時、PROCESSINGは処理が始まった時、FINISHEDは処理が終わった時
    process_description: Task['process_description']; //タスクの処理の説明
    status_description: Task['status_description']; //タスクのステータスの説明
    requested_at: Task['requested_at']; //リクエスト時間
    started_at: Task['started_at']; //開始時間（最初の処理が始まった時間）
    finished_at: Task['finished_at']; //終了時間（最後の処理が終わった時間）
    total_queued_task_count: Task['total_queued_task_count']; //キューに入れたタスクの数（合計対象処理数）
    total_processed_task_count: Task['total_processed_task_count']; //処理したタスクの数（合計処理完了数）
    corporation_id: Task['corporation_id']; //関連づけられた法人ID
    store_id: Task['store_id']; //関連づけられた店舗ID
  };

  //レシートプリンターにコマンドを送信した時のイベント
  export type ReceiptPrinterCommand = {
    device_id: Device['id'];
    store_id: Device['store_id'];
    command: string;
  };
}

//[TODO] updateなのかdeleteなのか、イベントの種類もちゃんと定義した方が良さそう
export type ApiEventType =
  | {
      //廃止
      type: 'storeStatus';
      obj: ApiEventObj.StoreStatus;
    }
  | {
      type: 'taskProgress'; //非同期系タスクの進捗度イベント
      obj: ApiEventObj.TaskProgress;
    }
  | {
      type: 'receiptPrinterCommand'; //レシートプリンターにコマンドを送信した時
      obj: ApiEventObj.ReceiptPrinterCommand;
    }
  | {
      type: 'transaction'; //取引の情報が変わった時（まだ使ってない）
      obj: ApiEventObj.Transaction;
    }
  | {
      type: 'packOpenHistory'; //パック開封の情報が変わった時
      obj: ApiEventObj.PackOpenHistory;
    }
  | {
      type: 'item'; //商品マスタの情報が変わった時（バンドル、オリパ作成用）
      obj: ApiEventObj.Item;
    }
  | {
      type: 'inventory'; //棚卸の情報が変わった時
      obj: ApiEventObj.Inventory;
    };
