import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defPagination } from '../../generator/util';
import { StoreSchema, TaskSchema } from 'backend-core';

extendZodWithOpenApi(z);

export const getTaskApi = {
  summary: 'タスクを取得する',
  description: 'タスクを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/task',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      target_worker: TaskSchema.shape.target_worker.optional(),
      kind: TaskSchema.shape.kind.optional(),
      status: TaskSchema.shape.status.optional(),
      source: TaskSchema.shape.source.optional(),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    tasks: z.array(
      z.object({
        process_id: TaskSchema.shape.process_id,
        target_worker: TaskSchema.shape.target_worker,
        kind: TaskSchema.shape.kind,
        status: TaskSchema.shape.status,
        source: TaskSchema.shape.source,
        requested_at: TaskSchema.shape.requested_at,
        started_at: TaskSchema.shape.started_at,
        finished_at: TaskSchema.shape.finished_at,
        errored_at: TaskSchema.shape.errored_at,
        total_queued_task_count: TaskSchema.shape.total_queued_task_count,
        item_count_per_task: TaskSchema.shape.item_count_per_task,
        total_processed_task_count: TaskSchema.shape.total_processed_task_count,
        metadata: z.any().nullable(),
        corporation_id: TaskSchema.shape.corporation_id,
        store_id: TaskSchema.shape.store_id,
        created_at: TaskSchema.shape.created_at,
        updated_at: TaskSchema.shape.updated_at,
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
