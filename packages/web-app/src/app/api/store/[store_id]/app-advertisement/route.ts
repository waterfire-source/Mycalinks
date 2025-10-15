import { BackendAPI } from '@/api/backendApi/main';
import {
  createOrUpdateAppAdvertisementApi,
  getAppAdvertisementApi,
} from 'api-generator';

// Define AppAdvertisementVirtualStatus enum
enum AppAdvertisementVirtualStatus {
  PUBLISHED = 'PUBLISHED', // 公開中かつ公開停止中ではない
  UNPUBLISHED = 'UNPUBLISHED', // 未公開
  DRAFT = 'DRAFT', // 下書き
  FINISHED = 'FINISHED', // 公開終了もしくは公開停止中
}
import { App_Advertisement, Prisma } from '@prisma/client';
import { AppAdvertisementStatus } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAppAdvertisementModel } from '@/api/backendApi/model/appAdvertisement';

//アプリ広告取得API
export const GET = BackendAPI.create(
  getAppAdvertisementApi,
  async (API, { params, query }) => {
    // クエリパラメータを生成
    const whereCondition: Prisma.App_AdvertisementWhereInput = {
      store_id: params.store_id,
      deleted: false,
      ...(query.id && { id: query.id }),
      ...(query.kind && { kind: query.kind }),
    };

    // virtualStatusに応じた条件を追加
    if (query.virtualStatus) {
      switch (query.virtualStatus) {
        case AppAdvertisementVirtualStatus.PUBLISHED:
          whereCondition.status = AppAdvertisementStatus.PUBLISHED;
          whereCondition.on_pause = false;
          break;
        case AppAdvertisementVirtualStatus.UNPUBLISHED:
          whereCondition.status = AppAdvertisementStatus.UNPUBLISHED;
          break;
        case AppAdvertisementVirtualStatus.DRAFT:
          whereCondition.status = AppAdvertisementStatus.DRAFT;
          break;
        case AppAdvertisementVirtualStatus.FINISHED:
          whereCondition.OR = [
            { status: AppAdvertisementStatus.FINISHED },
            { on_pause: true },
          ];
          break;
      }
    }

    const appAdvertisements = await API.db.app_Advertisement.findMany({
      where: whereCondition,
      include: { data_images: true },
    });

    return { appAdvertisements };
  },
);

//アプリ広告作成・更新API
export const POST = BackendAPI.create(
  createOrUpdateAppAdvertisementApi,
  async (API, { params, body }) => {
    // パラメータを取得
    const { store_id } = params;
    const {
      id,
      display_name,
      on_pause,
      asDraft, //下書きとして保存するか
      kind,
      start_at,
      end_at,
      thumbnail_image_url,
      data_type,
      data_text,
      data_images,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    let existing: App_Advertisement | null = null;
    if (id) {
      existing = await API.db.app_Advertisement.findUnique({
        where: { id },
      });

      if (!existing)
        throw new ApiError(createOrUpdateAppAdvertisementApi.error.notExist);
    }

    // トランザクション内で処理
    const advertisement = await API.transaction(async (tx) => {
      if (id) {
        // ステータスチェック
        if (
          existing!.status === AppAdvertisementStatus.FINISHED ||
          existing!.on_pause
        ) {
          throw new ApiError(
            createOrUpdateAppAdvertisementApi.error.alreadyDeleted,
          );
        }
        // 広告を更新
        return await tx.app_Advertisement.update({
          where: { id },
          data: {
            staff_account_id,
            display_name,
            on_pause,
            status:
              existing!.status === AppAdvertisementStatus.DRAFT
                ? asDraft
                  ? AppAdvertisementStatus.DRAFT
                  : AppAdvertisementStatus.UNPUBLISHED
                : undefined,
            kind,
            start_at,
            end_at,
            thumbnail_image_url,
            data_type,
            data_text,
            data_images: data_images
              ? {
                  deleteMany: {}, // 既存の画像を全て削除
                  create: data_images, // 新しい画像を作成
                }
              : undefined,
          },
          include: {
            data_images: true,
          },
        });
      } else {
        // 新規作成の場合
        // 必須項目のチェック
        if (!display_name || !kind || !start_at || !data_type) {
          throw new ApiError(createOrUpdateAppAdvertisementApi.error.required);
        }

        // 開始日時と終了日時のチェック
        if (start_at && end_at && start_at >= end_at) {
          throw new ApiError(
            createOrUpdateAppAdvertisementApi.error.startAtEndAt,
          );
        }

        // 広告を作成
        return await tx.app_Advertisement.create({
          data: {
            store_id,
            staff_account_id,
            display_name,
            on_pause,
            status: asDraft
              ? AppAdvertisementStatus.DRAFT
              : AppAdvertisementStatus.UNPUBLISHED,
            kind,
            start_at,
            end_at,
            thumbnail_image_url,
            data_type,
            data_text,
            data_images: {
              create: data_images || [],
            },
          },
          include: {
            data_images: true,
          },
        });
      }
    });

    // DRAFT以外の場合は、このストアのアプリ広告のステータス更新関数を実行する
    if (!asDraft) {
      const model = new BackendAppAdvertisementModel(API);
      await model.updateStatus({ storeId: store_id });
    }

    return advertisement;
  },
);
