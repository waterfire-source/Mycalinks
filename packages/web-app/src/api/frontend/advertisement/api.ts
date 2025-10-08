import { CustomError } from '@/api/implement';
import {
  createOrUpdateAppAdvertisementDef,
  deleteAppAdvertisementDef,
  getAppAdvertisementDef,
} from '@/app/api/store/[store_id]/app-advertisement/def';
import {
  AppAdvertisementDataType,
  AppAdvertisementKind,
  AppAdvertisementStatus,
} from '@prisma/client';

export interface AdvertisementAPI {
  //アプリ広告取得API
  getAppAdvertisement: {
    request: {
      storeId: number; //店舗ID
      id?: number; //IDで絞り込みできる
      virtualStatus?: AppAdvertisementStatus; //ステータス バックエンドでは公開中のものを一時停止にしたときでもstatusは「PUBLISHED」のままだが、フロントエンドではそれも「FINISHED」として扱うため
      kind?: AppAdvertisementKind; //広告の種類
    };
    response: typeof getAppAdvertisementDef.response;
  };
  //アプリ広告作成・更新API
  createOrUpdateAppAdvertisement: {
    request: {
      storeId: number; //店舗ID
      id?: number; //既存の広告を更新する時のID
      displayName?: string; //タイトル 新規作成時に必要
      onPause?: boolean; //公開停止/再開
      asDraft?: boolean; //下書きとして保存するか
      kind?: AppAdvertisementKind; //広告の種類 新規作成時に必要
      startAt?: Date; //開始日時 新規作成時に必要 ※あとで10分刻みじゃないといけないバリデーションここに入れるかも
      endAt?: Date; //終了日時 ※あとで10分刻みじゃないといけないバリデーションここに入れるかも
      thumbnailImageUrl?: string; //サムネ画像URL
      dataType?: AppAdvertisementDataType; //データの種類 新規作成時に必要
      dataText?: string; //文字列データ
      dataImages: { imageUrl: string }[];
    };
    response: typeof createOrUpdateAppAdvertisementDef.response | CustomError;
  };
  deleteAppAdvertisement: {
    request: {
      storeId: number; //店舗ID
      appAdvertisementId: number; //IDで絞り込みできる
    };
    response: typeof deleteAppAdvertisementDef.response | CustomError;
  };
}
