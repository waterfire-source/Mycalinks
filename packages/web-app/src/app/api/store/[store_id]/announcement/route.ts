// POSアプリのお知らせの取得

import { BackendAPI } from '@/api/backendApi/main';
import { Announcement, AnnouncementStatus, Prisma } from '@prisma/client';
import { ApiResponse, apiRole, getAnnouncementApi } from 'api-generator';

export const GET = BackendAPI.create(
  getAnnouncementApi,
  async (API, { params }) => {
    const whereInput: Array<Prisma.AnnouncementWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'kind':
          whereInput.push({
            kind: value as Announcement['kind'],
          });
          break;

        case 'onlyUnread': //未読のみ
          whereInput.push({
            stores: {
              none: {
                store_id: params.store_id,
                read: true,
              },
            },
          });
          break;
      }
    });

    //godだったら非公開のものも取得できる
    if (API.role.includes(apiRole.god)) {
      whereInput.push({
        status: {
          in: [AnnouncementStatus.PUBLISHED, AnnouncementStatus.UNPUBLISHED],
        },
      });
    } else {
      whereInput.push({
        status: AnnouncementStatus.PUBLISHED,
      });
    }

    const selectRes: ApiResponse<typeof getAnnouncementApi>['announcements'] =
      await API.db.announcement.findMany({
        where: {
          AND: whereInput,
        },
        orderBy: {
          target_day: 'desc',
        },
      });

    const announcementStores = await API.db.announcement_Store.findMany({
      where: {
        announcement_id: {
          in: selectRes.map((announcement) => announcement.id),
        },
        store_id: params.store_id,
      },
      select: {
        announcement_id: true,
        read: true,
      },
    });

    selectRes.forEach((announcement) => {
      announcement.read = announcementStores.find(
        (e) => e.announcement_id === announcement.id,
      )?.read;
    });

    return {
      announcements: selectRes,
    };
  },
);
