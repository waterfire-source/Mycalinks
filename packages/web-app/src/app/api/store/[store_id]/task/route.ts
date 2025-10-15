// タスクを取得する

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, Task } from '@prisma/client';
import { getTaskApi } from 'api-generator';

export const GET = BackendAPI.create(getTaskApi, async (API, { params }) => {
  const whereInput: Array<Prisma.TaskWhereInput> = [];

  // クエリパラメータを見ていく
  await API.processQueryParams((key, value) => {
    switch (key) {
      case 'target_worker':
      case 'kind':
        whereInput.push({
          target_worker: value as string,
        });
        break;

      case 'status':
        whereInput.push({
          status: value as Task['status'],
        });
        break;

      case 'source':
        whereInput.push({
          source: value as Task['source'],
        });
        break;
    }
  });

  const selectRes = await API.db.task.findMany({
    where: {
      AND: whereInput,
      store_id: params.store_id,
    },
    ...API.limitQuery,
    orderBy: {
      requested_at: 'desc',
    },
  });

  return {
    tasks: selectRes,
  };
});
