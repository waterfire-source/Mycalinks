import { BackendAPI } from '@/api/backendApi/main';
import { deleteAppAdvertisementApi } from 'api-generator';
import { ApiError } from '@/api/backendApi/error/apiError';

//アプリ広告論理削除API
export const DELETE = BackendAPI.create(
  deleteAppAdvertisementApi,
  async (API, { params }) => {
    const { store_id, app_advertisement_id } = params;

    // 広告を取得
    const advertisement = await API.db.app_Advertisement.findUnique({
      where: {
        id: app_advertisement_id,
        store_id: store_id,
      },
    });

    // 広告が存在しない場合はエラー
    if (!advertisement) {
      throw new ApiError('notExist');
    }

    // 広告が既に論理削除されている場合はエラー
    if (advertisement.deleted) {
      throw new ApiError(deleteAppAdvertisementApi.error.alreadyDeleted);
    }

    // 論理削除を実行
    await API.db.app_Advertisement.update({
      where: {
        id: app_advertisement_id,
      },
      data: {
        deleted: true,
      },
    });
  },
);
