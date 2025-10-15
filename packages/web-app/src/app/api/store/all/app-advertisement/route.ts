import { BackendAPI } from '@/api/backendApi/main';
import { getAllStoreAppAdvertisementsApi } from 'api-generator';
import { AppAdvertisementStatus } from '@prisma/client';

//全ストアアプリ広告取得API
export const GET = BackendAPI.create(
  getAllStoreAppAdvertisementsApi,
  async (API, { query }) => {
    // 検索条件の構築
    const whereCondition = {
      deleted: false, // 論理削除されていないもの
      on_pause: false, // 一時停止中でないもの
      status: AppAdvertisementStatus.PUBLISHED, // 公開中のもの
      // クエリパラメータによる絞り込み
      ...(query.id && { id: query.id }),
      ...(query.store_id && { store_id: query.store_id }),
      ...(query.kind && { kind: query.kind }),
    };

    // 広告データの取得
    const appAdvertisements = await API.db.app_Advertisement.findMany({
      where: whereCondition,
      include: {
        data_images: true,
      },
    });

    return { appAdvertisements };
  },
);
