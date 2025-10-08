// お知らせ削除

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { AnnouncementStatus } from '@prisma/client';
import { deleteAnnouncementApi } from 'api-generator';

export const DELETE = BackendAPI.create(
  deleteAnnouncementApi,
  async (API, { params }) => {
    const currentInfo = await API.db.announcement.findUnique({
      where: {
        id: params.announcement_id,
        status: {
          not: AnnouncementStatus.DELETED,
        },
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    await API.db.announcement.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        status: AnnouncementStatus.DELETED,
      },
    });
  },
);
