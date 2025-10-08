// お知らせの作成・更新

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { AnnouncementStatus } from '@prisma/client';
import { createOrUpdateAnnouncementApi } from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateAnnouncementApi,
  async (API, { body }) => {
    let { id, title, url, target_day, kind, publish_at, status } = body;

    if (id) {
      const alreadyInfo = await API.db.announcement.findUnique({
        where: {
          id,
          status: {
            not: AnnouncementStatus.DELETED,
          },
        },
      });

      if (!alreadyInfo) throw new ApiError('notExist');
    } else {
      API.checkField(['title', 'target_day', 'kind', 'publish_at'], true);
    }

    const upsertRes = await API.db.announcement.upsert({
      where: {
        id: id ?? 0,
      },
      create: {
        title,
        url,
        target_day,
        kind: kind!,
        publish_at,
        status,
      },
      update: {
        title,
        url,
        target_day,
        kind: kind!,
        publish_at,
        status,
      },
    });

    return upsertRes;
  },
);
