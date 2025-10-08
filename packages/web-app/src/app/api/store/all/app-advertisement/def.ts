import {
  apiMethod,
  apiRole,
  Optional,
  ResponseMsgKind,
} from '@/api/backendApi/main';
import {
  App_Advertisement,
  App_Advertisement_Image,
  AppAdvertisementKind,
} from '@prisma/client';

//全ストアアプリ広告取得API
export const getAllStoreAppAdvertisementsDef = {
  method: apiMethod.GET,
  path: 'store/all/app-advertisement',
  privileges: {
    role: [apiRole.mycaUser], //Mycaユーザーのみ実行可能 ※開発時は検証のためにapiRole.everyoneなどを入れたりする
  },
  request: {
    query: {
      id: Optional<App_Advertisement['id']>(Number), //IDで絞り込みできる
      store_id: Optional<App_Advertisement['store_id']>(Number), //ストアID
      kind: Optional<App_Advertisement['kind']>(AppAdvertisementKind), //広告の種類
    },
  },
  process: `
  公開中でかつ論理削除されてなくて、一時停止中でもないもののみ取得可能にする
  返すフィールドは制限されている
  `,
  response: <
    {
      appAdvertisements: Array<{
        id: App_Advertisement['id'];
        store_id: App_Advertisement['store_id'];
        display_name: App_Advertisement['display_name'];
        kind: App_Advertisement['kind'];
        thumbnail_image_url: App_Advertisement['thumbnail_image_url'];
        data_type: App_Advertisement['data_type'];
        data_text: App_Advertisement['data_text'];
        data_images: Array<App_Advertisement_Image>; //データの画像
      }>;
    }
  >{},
};

//全ストアアプリ広告ステータス更新API
export const updateAllStoreAppAdvertisementsDef = {
  method: apiMethod.POST,
  path: 'store/all/app-advertisement/update-status',
  privileges: {
    role: [apiRole.bot], //BOTのみ実行可能
  },
  request: {
    //特に指定はなし
  },
  process: `
  ステータスがUNPUBLISHED, PUBLISHEDのもののみ取得し、UNPUBLISHED・PUBLISHED・FINISHEDにしないといけないかどうかを吟味していく on_pause=trueのものもstatusはしっかりと変える
  `,
  response: {
    ok: ResponseMsgKind.updated,
  },
};
