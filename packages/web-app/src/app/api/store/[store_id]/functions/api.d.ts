export type BackendFunctionsAPI = [
  //リソースに関係ない系の処理
  {
    path: '/api/store/{store_id}/functions/upload-image/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: FormData<{
        file: File<{
          name:
            | '*.jpg'
            | '*.jpeg'
            | '*.png'
            | '*.svg'
            | '*.webp'
            | '*.gif'
            | '*.lbx';
          type:
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp'
            | 'image/svg+xml';
        }> | null; //画像ファイル
        kind:
          | 'item'
          | 'product'
          | 'transaction'
          | 'store'
          | 'purchase-table'
          | 'advertisement'
          | 'label-printer'; //アップロードする画像のサービスの種類
      }>;
    };
    response: {
      200: {
        imageUrl: string; //アップロードが完了した画像のURL
      };
    };
  },
];
