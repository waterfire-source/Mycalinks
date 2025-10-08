import { apiMethod, apiRole, Optional, Required } from '@/api/backendApi/main';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import {
  Account,
  Register,
  Register_Cash_History,
  Register_Settlement,
  Register_Settlement_Drawer,
  Register_Settlement_Sales,
  RegisterSettlementKind,
  RegisterStatus,
  Store,
  TransactionPaymentMethod,
  TransactionSalesKind,
} from '@prisma/client';

//レジ精算を行うAPI
/**
 * @deprecated Use registerSettlementApi from api-generator instead
 */
export const registerSettlementDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/register/[register_id]/settlement/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number), //対象のレジID（全部一気に閉める場合でも必要※レジからじゃないと精算しちゃだめなため）
    },
    body: {
      actual_cash_price: Required<Register_Settlement['actual_cash_price']>(), //実際の現金量
      kind: Required<Register_Settlement['kind']>(), //精算のモード 開店or閉店or中間点検 開店や閉店だったら同時にレジ自体のクローズが行われる（レジ金を全体で管理している場合、全て一気にクローズされる）
      drawerContents: [
        //ドロワの中身（金種）
        {
          denomination: Required<Register_Settlement_Drawer['denomination']>(), //金種
          item_count: Required<Register_Settlement_Drawer['item_count']>(), //その個数
        },
      ],
      //過不足は内部で自動的に計算される
    },
  },
  process: `
  レジ精算処理
  `,
  response: <
    Register_Settlement //作成されたリソースの情報
  >{},
  error: {} as const,
};

//レジの作成・更新を行うAPI
/**
 * @deprecated Use createRegisterApi from api-generator instead
 */
export const createRegisterDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/register',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Register['id']>(), //更新したいレジのID

      display_name: Optional<Register['display_name']>(), //新規作成時は必要
      cash_reset_price: Optional<Register['cash_reset_price']>(), //レジ金リセットの価格

      sell_payment_method: Optional<Register['sell_payment_method']>(), //販売の支払い方法
      buy_payment_method: Optional<Register['buy_payment_method']>(), //買取の支払い方法
      // account_id: Optional<Register['account_id']>(), //このレジに紐づけるアカウントのID 変更した時は設定なども引き継がれる
      status: Optional<Register['status']>(), //ここでレジ自体の開閉も一応調整可能（レジ点検を行った際は、レジ精算と同時に自動で内部でステータスが書き換わる）　全体で一気にレジ金を管理する設定になっている場合、他のレジも一気にOPEN/CLOSEに変わるようになっている ※新規作成時は指定不可
      auto_print_receipt_enabled:
        Optional<Register['auto_print_receipt_enabled']>(), //レシートの自動印刷がONになっているかどうか
    },
  },
  process: `
  レジ作成処理
  `,
  response: <
    Register //作成されたレジの情報
  >{},
  error: {
    invalidAccountId: {
      status: 400,
      messageText:
        '紐づけるアカウントのIDはログイン中のIDを指定する必要があります',
    },
  } as const,
};

//レジの削除
/**
 * @deprecated Use deleteRegisterApi from api-generator instead
 */
export const deleteRegisterDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/register/[register_id]/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number),
    },
  },
  process: `
  レジ削除処理
  `,
  response: {
    ok: 'レジの削除に成功しました',
  },
  error: {} as const,
};

//レジ精算リスト取得API（レジは特定しない）
export const listRegisterSettlementDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/register/settlement',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      kind: Optional<Register_Settlement['kind']>(RegisterSettlementKind), //レジ精算の種類
      register_id: Optional<Register_Settlement['register_id']>(Number), //レジID
      today: Optional<boolean>(Boolean), //本日のものかどうか（開店中のみ可能）
      take: Optional<number>(Number), //ページネーション用（取得件数）
      skip: Optional<number>(Number), //ページネーション用（スキップ件数）
    },
  },
  process: `
  
  `,
  response: <
    {
      //フィールドの詳細はaccount.prismaに書いてある
      settlements: Array<
        Register_Settlement & {
          register_settlement_drawers: Array<Register_Settlement_Drawer>; //ドロワーの内訳
          sales: Array<Register_Settlement_Sales>; //売り上げの情報（支払い方法別）
        }
      >;
      totalCount: number; //総件数（ページネーション用）
    }
  >{},
  error: {} as const,
};

//レジ精算詳細情報取得API 精算レシート印刷用
export const getRegisterSettlementDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/register/[register_id]/settlement/[settlement_id]/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number),
      settlement_id: Required<Register_Settlement['id']>(Number), //レジ精算ID
    },
  },
  process: `
  
  `,
  response: <
    {
      settlementInfo: Register_Settlement & {
        register_settlement_drawers: Array<Register_Settlement_Drawer>;
      };
      receiptCommand: string; //レジ精算レシートを印刷するためのEPOSコマンド
      closeReceiptCommand: string | null; //閉店精算レシートを印刷するためのEPOSコマンド
    }
  >{},
  error: {} as const,
};

//レジ内現金変動API
export const changeRegisterCashDef = {
  method: apiMethod.PUT,
  path: 'store/[store_id]/register/[register_id]/cash/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number), //レジ金を個別で管理しない場合でも、自分のレジIDをここに入れる
    },
    body: {
      changeAmount: Optional<Register_Cash_History['change_price']>(
        Number,
        (v) => v != 0 || '変動値には0以外の値を指定してください',
      ), //変動させる現金量 +だったら入金 -だったら出金
      toAmount: Optional<number>( //〜円にしたい時の指定
        Number,
        (v) => v >= 0 || '指定金額は0円以上にしてください',
      ),
      //上二つはいずれか指定する必要がある

      reason: Optional<Register_Cash_History['description']>(), //理由
      kind: Required<ChangeRegisterKind>(ChangeRegisterKind), //変動の種類 必ず必要
    },
  },
  process: `
  
  `,
  response: <
    Register //レジの情報
  >{},
  error: {} as const,
};

//レジ現金変動履歴取得API
export const getRegisterCashHistoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/register/cash-history/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      source_kind: Optional<string>(), //変動の理由を指定することができる カンマ区切りで複数指定可能 Register_Cash_History['source_kind']由来
      startAt: Optional<Register_Cash_History['datetime']>(Date), //取得期間の開始日時
      endAt: Optional<Register_Cash_History['datetime']>(Date), //取得期間の終了日時
      register_id: Optional<Register_Cash_History['register_id']>(Number), //レジのID

      skip: Optional<number>(Number), //ページネーション用
      take: Optional<number>(Number), //ページネーション用
    },
  },
  process: `
  
  `,
  response: <
    {
      history: Array<{
        id: Register_Cash_History['id']; //変動レコードのID
        staff_account_id: Register_Cash_History['staff_account_id']; //担当者のアカウントID
        staff_display_name: Account['display_name']; //担当者の名前
        source_kind: Register_Cash_History['source_kind']; //現金変動の種類
        change_price: Register_Cash_History['change_price']; //変動額
        description: Register_Cash_History['description']; //変動の説明など
        result_cash_price: Register_Cash_History['result_cash_price']; //変動した結果、ストア内の現金はいくらになったのか レジ金を一括管理している時、ここの値=レジ内現金
        result_register_cash_price: Register_Cash_History['result_register_cash_price']; //ストアでレジ金を個別管理している時、この変動でこのレジ内の現金が何円になったのかここに入る
        datetime: Register_Cash_History['datetime']; //変動日時
        register_id: Register_Cash_History['register_id']; //レジID
      }>;
    }
  >{},
  error: {} as const,
};

//レジの当日まとめ情報取得API
//レジ金を一括管理する設定にしている場合、全てのレジのデータが返される
export const getRegisterTodaySummaryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/register/[register_id]/today-summary',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number),
    },
  },
  process: `
  
  `,
  response: <
    {
      cashFlowData: {
        openedDateTime: Date; //本日の開店時間
        initCashPrice: Register_Settlement['actual_cash_price']; //営業開始時の現金
        idealCashPrice: number; //理論上の現金
        transaction_sell: number; //本日の現金販売売上
        transaction_buy: number; //本日の現金買取合計
        transaction_sell_return: number; //本日の現金販売返金合計
        transaction_buy_return: number; //本日の現金買取返金合計
        reservation_deposit: number; //本日の予約前金合計
        reservation_deposit_return: number; //本日の予約前金返金合計
        import: number; //本日の入金合計
        export: number; //本日の出金合計
        sales: number; //本日のリセット調整額合計（+ - あり）
        adjust: number; //本日の調整（過不足修正用）合計（+ - あり）
        manageSeparately: boolean; //レジごとのデータか一括か（店の設定に依存）
      };
      totalSales: number; // 総売上
      transactionSalesData: Array<{
        //取引種類、支払い方法ごとのデータ
        kind: TransactionSalesKind; //returnがついているものは返金
        payment_method: TransactionPaymentMethod; //支払い方法
        total_price: number; //合計額
      }>;
    }
  >{},
  error: {} as const,
};

//レジ取得API
export const getRegisterDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/register/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      inUse: Optional<boolean>(Boolean), //使用中のものだけ取得する時true 使用中じゃないものだけ取得する時false
      me: Optional<boolean>(Boolean), //ログイン中の端末に結びついているレジだけ取得するかどうか
      status: Optional<Register['status']>(RegisterStatus), //開いているか閉まっているか
    },
  },
  process: `
  
  `,
  response: <
    {
      registers: Array<Register>; //他にも必要な情報がありそうだったらフィールドを追加する
    }
  >{},
  error: {} as const,
};

//Squareターミナルの端末コード発行
export const createSquareTerminalDeviceCode = {
  method: apiMethod.POST,
  path: 'store/[store_id]/register/[register_id]/square/create-device-code',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      register_id: Required<Register['id']>(Number),
    },
  },
  process: `
  `,
  response: <Register>{},
  error: {} as const,
};
