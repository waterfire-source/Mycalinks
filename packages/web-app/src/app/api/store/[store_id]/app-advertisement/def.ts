import {
  apiMethod,
  apiRole,
  Optional,
  Required,
  ResponseMsgKind,
} from '@/api/backendApi/main';
import {
  App_Advertisement,
  App_Advertisement_Image,
  AppAdvertisementKind,
  Store,
} from '@prisma/client';

//アプリ広告作成・更新API
/**
 * @deprecated Use createOrUpdateAppAdvertisementApi from api-generator instead
 */
export const createOrUpdateAppAdvertisementDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/app-advertisement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number), //店舗ID
    },
    body: {
      id: Optional<App_Advertisement['id']>(), //既存の広告を更新する時のID

      // staff_account_id: Required<App_Advertisement['staff_account_id']>(), //担当者ID
      // スタッフIDはヘッダーで指定が必要

      display_name: Optional<App_Advertisement['display_name']>(), //タイトル 新規作成時に必要
      on_pause: Optional<App_Advertisement['on_pause']>(), //公開停止/再開
      asDraft: Optional<boolean>(), //下書きとして保存するか
      kind: Optional<App_Advertisement['kind']>(), //広告の種類 新規作成時に必要
      start_at: Optional<App_Advertisement['start_at']>(Date), //開始日時 新規作成時に必要 ※あとで10分刻みじゃないといけないバリデーションここに入れるかも
      end_at: Optional<App_Advertisement['end_at']>(Date), //終了日時 ※あとで10分刻みじゃないといけないバリデーションここに入れるかも
      thumbnail_image_url: Optional<App_Advertisement['thumbnail_image_url']>(), //サムネ画像URL
      data_type: Optional<App_Advertisement['data_type']>(), //データの種類 新規作成時に必要
      data_text: Optional<App_Advertisement['data_text']>(), //文字列データ
      data_images: [
        //データの画像
        {
          image_url: Required<App_Advertisement_Image['image_url']>(), //画像URL
        },
      ],
    },
  },
  process: `
  IDを指定されていた場合は、存在するのかどうかを調べつつ、更新処理を行う

  一時公開停止/再開はstatusがPUBLISHEDのもののみいじれる
  data_imagesを指定されていた場合、一度トランザクション内でApp_Advertisement_Imageを削除しつつ、登録し直す

  `,
  response: <
    App_Advertisement & {
      data_images: Array<App_Advertisement_Image>; //データの画像
    }
  >{},
  error: {
    notExist: {
      status: 400,
      messageText: '指定されたアプリ広告が見つかりません',
    },
    alreadyDeleted: {
      status: 400,
      messageText: '公開終了・停止中のアプリ広告は編集できません',
    },
    required: {
      status: 400,
      messageText: '必須項目が不足しています',
    },
    startAtEndAt: {
      status: 400,
      messageText: '開始日時は終了日時より前に設定してください',
    },
  } as const,
};

//アプリ広告取得API
export enum AppAdvertisementVirtualStatus {
  PUBLISHED = 'PUBLISHED', //公開中かつ公開停止中ではない
  UNPUBLISHED = 'UNPUBLISHED', //未公開
  DRAFT = 'DRAFT', //下書き
  FINISHED = 'FINISHED', //公開終了もしくは公開停止中
}

//アプリ広告取得API
export const getAppAdvertisementDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/app-advertisement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number), //店舗ID
    },
    query: {
      id: Optional<App_Advertisement['id']>(Number), //IDで絞り込みできる
      virtualStatus: Optional<AppAdvertisementVirtualStatus>(
        AppAdvertisementVirtualStatus,
      ), //ステータス バックエンドでは公開中のものを一時停止にしたときでもstatusは「PUBLISHED」のままだが、フロントエンドではそれも「FINISHED」として扱うため
      kind: Optional<App_Advertisement['kind']>(AppAdvertisementKind), //広告の種類
    },
  },
  process: `
  論理削除されているものは除く
  `,
  response: <
    {
      appAdvertisements: Array<
        App_Advertisement & {
          data_images: Array<App_Advertisement_Image>; //データの画像
        }
      >;
    }
  >{},
};

//アプリ広告論理削除API
export const deleteAppAdvertisementDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/app-advertisement/[app_advertisement_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number), //店舗ID
      app_advertisement_id: Required<App_Advertisement['id']>(Number), //広告ID
    },
  },
  process: `
  論理削除されているものは再び論理削除できない
  `,
  response: {
    ok: ResponseMsgKind.deleted,
  },
  error: {
    alreadyDeleted: {
      status: 400,
      messageText: '既に削除された広告です',
    },
  } as const,
};
