export type BackendRegisterAPI = [
  //レジ内現金変動API
  {
    // path: '/api/store/{store_id}/register/cash/';
    // method: 'PUT';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //   };
    //   body: {
    //     changeAmount: Register_Cash_History['change_price'];
    //     reason?: Register_Cash_History['description'];
    //     staff_account_id: Account['id'];
    //   };
    // };
    // response: {
    //   200: Store;
    //   400: {
    //     //情報が足りない時など
    //   };
    // };
  },
  //開店からのレジ情報取得
  {
    // path: '/api/store/{store_id}/register/';
    // method: 'GET';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //   };
    //
    // };
    // response: {
    //   200: {
    //     openedDateTime: Date; //本日の開店時間
    //     initCashPrice: Register_Settlement['actual_cash_price']; //営業開始時の現金
    //     lastSettlementInfo: {
    //       //前営業日のレジ締めの結果
    //       id: Register_Settlement['id'];
    //       transaction_sell_total: Register_Settlement['transaction_sell_total']; //現金販売売上
    //       transaction_buy_total: Register_Settlement['transaction_buy_total']; //現金買取合計
    //       transaction_sell_return_total: Register_Settlement['transaction_sell_return_total']; //現金販売返金合計
    //       transaction_buy_return_total: Register_Settlement['transaction_buy_return_total']; //現金買取返金合計
    //       import_total: Register_Settlement['import_total'];
    //       export_total: Register_Settlement['export_total'];
    //       ideal_cash_price: Register_Settlement['ideal_cash_price'];
    //       difference_price: Register_Settlement['difference_price'];
    //       actual_cash_price: Register_Settlement['actual_cash_price'];
    //       created_at: Register_Settlement['created_at'];
    //       staff_account_id: Register_Settlement['staff_account_id'];
    //       register_settlement_drawers: Array<{
    //         denomination: Register_Settlement_Drawer['denomination'];
    //         item_count: Register_Settlement_Drawer['item_count'];
    //       }>;
    //     };
    //     idealCashPrice: number; //理論上の現金
    //     transaction_sell: number; //本日の現金販売売上
    //     transaction_buy: number; //本日の現金買取合計
    //     transaction_sell_return: number; //本日の現金販売返金合計
    //     transaction_buy_return: number; //本日の現金買取返金合計
    //     import: number; //本日の入金合計
    //     export: number; //本日の出金合計
    //   };
    // };
  },
  //レジ精算API
  {
    // path: '/api/store/{store_id}/register/';
    // method: 'POST';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //   };
    //   body: {
    //     staff_account_id: Register_Settlement['staff_account_id'];
    //     actual_cash_price: Register_Settlement['actual_cash_price'];
    //     drawerContents: Array<{
    //       //ドロワの中身
    //       denomination: Register_Settlement_Drawer['denomination']; //金種
    //       item_count: Register_Settlement_Drawer['item_count']; //個数、枚数
    //     }>;
    //   };
    // };
    // response: {
    //   200: Register_Settlement;
    //   400: {
    //     error: string; //調整後も実際の額と異なっていた場合など
    //   };
    // };
  },
  //レジ金の履歴を取得する
  {
    // path: '/api/store/{store_id}/register/cash/';
    // method: 'GET';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //   query: {
    //     source_kind?: Register_Cash_History['source_kind']; //変動の理由を指定することができる カンマ区切りで複数指定可能
    //     startAt?: Register_Cash_History['datetime']; //取得期間の開始日時
    //     endAt?: Register_Cash_History['datetime']; //取得期間の終了日時
    //   };
    //   params: {
    //     store_id: Store['id'];
    //   };
    //
    // };
    // response: {
    //   200: {
    //     history: Array<{
    //       id: Register_Cash_History['id']; //変動レコードのID
    //       staff_account_id: Register_Cash_History['staff_account_id']; //担当者のアカウントID
    //       staff_display_name: Account['display_name']; //担当者の名前
    //       source_kind: Register_Cash_History['source_kind']; //現金変動の種類
    //       change_price: Register_Cash_History['change_price']; //変動額
    //       description: Register_Cash_History['description']; //変動の説明など
    //       result_cash_price: Register_Cash_History['result_cash_price']; //変動した結果、レジ内現金はいくらになったのか
    //       datetime: Register_Cash_History['datetime']; //変動日時
    //     }>;
    //   };
    //   400: {
    //     error: string; //調整後も実際の額と異なっていた場合など
    //   };
    // };
  },
  //レジ精算の詳細などを取得
  {
    // path: '/api/store/{store_id}/register/settlement/{settlement_id}/';
    // method: 'GET';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //     settlement_id: Register_Settlement['id'];
    //   };
    //
    // };
    // response: {
    //   200: {
    //     settlementInfo: Register_Settlement & {
    //       register_settlement_drawers: Array<Register_Settlement_Drawer>;
    //     };
    //     moneyInfo: unknown; //複雑かつ使わない気がするため一旦割愛
    //     receiptCommand: string;
    //   };
    //   400: {
    //     error: string; //調整後も実際の額と異なっていた場合など
    //   };
    // };
  },
];
