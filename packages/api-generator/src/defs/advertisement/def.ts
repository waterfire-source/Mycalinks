import {
  App_AdvertisementSchema,
  App_Advertisement_ImageSchema,
  AppAdvertisementKindSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';

extendZodWithOpenApi(z);

// Define AppAdvertisementVirtualStatus enum
const AppAdvertisementVirtualStatusSchema = z.enum([
  'PUBLISHED', // 公開中かつ公開停止中ではない
  'UNPUBLISHED', // 未公開
  'DRAFT', // 下書き
  'FINISHED', // 公開終了もしくは公開停止中
]);

export const createOrUpdateAppAdvertisementApi = {
  summary: 'アプリ広告作成・更新',
  description: 'アプリ広告を作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/app-advertisement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    body: z.object({
      id: App_AdvertisementSchema.shape.id
        .optional()
        .describe('既存の広告を更新する時のID'),
      display_name: App_AdvertisementSchema.shape.display_name
        .optional()
        .describe('タイトル 新規作成時に必要'),
      on_pause: App_AdvertisementSchema.shape.on_pause
        .optional()
        .describe('公開停止/再開'),
      asDraft: z.boolean().optional().describe('下書きとして保存するか'),
      kind: App_AdvertisementSchema.shape.kind
        .optional()
        .describe('広告の種類 新規作成時に必要'),
      start_at: App_AdvertisementSchema.shape.start_at
        .optional()
        .describe('開始日時 新規作成時に必要'),
      end_at: App_AdvertisementSchema.shape.end_at
        .optional()
        .describe('終了日時'),
      thumbnail_image_url: App_AdvertisementSchema.shape.thumbnail_image_url
        .optional()
        .describe('サムネ画像URL'),
      data_type: App_AdvertisementSchema.shape.data_type
        .optional()
        .describe('データの種類 新規作成時に必要'),
      data_text: App_AdvertisementSchema.shape.data_text
        .optional()
        .describe('文字列データ'),
      data_images: z
        .array(
          z.object({
            image_url:
              App_Advertisement_ImageSchema.shape.image_url.describe('画像URL'),
          }),
        )
        .optional()
        .describe('データの画像'),
    }),
  },
  process: `
  IDを指定されていた場合は、存在するのかどうかを調べつつ、更新処理を行う
  一時公開停止/再開はstatusがPUBLISHEDのもののみいじれる
  data_imagesを指定されていた場合、一度トランザクション内でApp_Advertisement_Imageを削除しつつ、登録し直す
  `,
  response: App_AdvertisementSchema.merge(
    z.object({
      data_images: z
        .array(App_Advertisement_ImageSchema)
        .describe('データの画像'),
    }),
  ),
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
} satisfies BackendApiDef;

export const getAppAdvertisementApi = {
  summary: 'アプリ広告取得',
  description: 'アプリ広告を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/app-advertisement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    query: z.object({
      id: App_AdvertisementSchema.shape.id
        .optional()
        .describe('IDで絞り込みできる'),
      virtualStatus:
        AppAdvertisementVirtualStatusSchema.optional().describe('ステータス'),
      kind: AppAdvertisementKindSchema.optional().describe('広告の種類'),
    }),
  },
  process: `論理削除されているものは除く`,
  response: z.object({
    appAdvertisements: z.array(
      App_AdvertisementSchema.merge(
        z.object({
          data_images: z
            .array(App_Advertisement_ImageSchema)
            .describe('データの画像'),
        }),
      ),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteAppAdvertisementApi = {
  summary: 'アプリ広告削除',
  description: 'アプリ広告を論理削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/app-advertisement/{app_advertisement_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      app_advertisement_id: App_AdvertisementSchema.shape.id.describe('広告ID'),
    }),
  },
  process: `論理削除されているものは再び論理削除できない`,
  response: defOk('広告を削除しました'),
  error: {
    alreadyDeleted: {
      status: 400,
      messageText: '既に削除された広告です',
    },
  } as const,
} satisfies BackendApiDef;

export const getAllStoreAppAdvertisementsApi = {
  summary: '全ストアアプリ広告取得',
  description: '全ストアのアプリ広告を取得する',
  method: ApiMethod.GET,
  path: '/store/all/app-advertisement',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    query: z.object({
      id: App_AdvertisementSchema.shape.id
        .optional()
        .describe('IDで絞り込みできる'),
      store_id: App_AdvertisementSchema.shape.store_id
        .optional()
        .describe('ストアID'),
      kind: AppAdvertisementKindSchema.optional().describe('広告の種類'),
    }),
  },
  process: `公開中でかつ論理削除されてなくて、一時停止中でもないもののみ取得可能にする
  返すフィールドは制限されている`,
  response: z.object({
    appAdvertisements: z.array(
      z.object({
        id: App_AdvertisementSchema.shape.id,
        store_id: App_AdvertisementSchema.shape.store_id,
        display_name: App_AdvertisementSchema.shape.display_name,
        kind: AppAdvertisementKindSchema,
        thumbnail_image_url: App_AdvertisementSchema.shape.thumbnail_image_url,
        data_type: App_AdvertisementSchema.shape.data_type,
        data_text: App_AdvertisementSchema.shape.data_text,
        data_images: z
          .array(App_Advertisement_ImageSchema)
          .describe('データの画像'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const updateAllStoreAppAdvertisementsApi = {
  summary: '全ストアアプリ広告ステータス更新',
  description: '全ストアのアプリ広告ステータスを更新する',
  method: ApiMethod.POST,
  path: '/store/all/app-advertisement/update-status',
  privileges: {
    role: [apiRole.bot],
  },
  request: {},
  process: `ステータスがUNPUBLISHED, PUBLISHEDのもののみ取得し、UNPUBLISHED・PUBLISHED・FINISHEDにしないといけないかどうかを吟味していく on_pause=trueのものもstatusはしっかりと変える`,
  response: defOk('広告ステータスを更新しました'),
  error: {} as const,
} satisfies BackendApiDef;
