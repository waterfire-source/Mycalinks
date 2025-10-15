import { BackendAPI } from '@/api/backendApi/main';
import { EcBannerPlace, Prisma } from '@prisma/client';
import { getEcBannerDef } from '@/app/api/ec/def';
import { setEcBannerApi } from 'api-generator';

//バナー取得
export const GET = BackendAPI.defineApi(
  getEcBannerDef,
  async (API, { query }) => {
    const whereInput: Array<Prisma.Ec_BannerWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'place':
          whereInput.push({
            place: value as EcBannerPlace,
          });
          break;
      }
    }

    const selectRes = await API.db.ec_Banner.findMany({
      where: {
        AND: whereInput,
      },
      select: {
        place: true,
        image_url: true,
        url: true,
      },
      orderBy: {
        order_number: 'asc',
      },
    });

    return {
      banners: selectRes,
    };
  },
);
// ECのバナー設定

export const POST = BackendAPI.create(setEcBannerApi, async (API, { body }) => {
  const { banners } = body;

  const txResult = await API.transaction(async (tx) => {
    //一回全て削除する
    await tx.ec_Banner.deleteMany();

    await tx.ec_Banner.createMany({
      data: banners,
    });

    const findRes = await tx.ec_Banner.findMany();

    return {
      banners: findRes,
    };
  });

  return txResult;
});
