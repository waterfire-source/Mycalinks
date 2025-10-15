import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';

//アプリのアイテムをPOSに反映させる用
export type createAllStoreItemDef = {
  path: '/api/store/all/item/';
  method: 'POST';
  request: {
    privileges: {
      role: ['bot']; //botじゃないと実行できない
      policies: []; //実行に必要なポリシー
    };

    body: {
      mycaItemIds: Array<mycaItem['id']>;
    };
  };
  response: {
    201: {
      ok: string;
    };
  };
};
