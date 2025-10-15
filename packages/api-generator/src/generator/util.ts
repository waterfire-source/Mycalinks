import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { apiPolicies } from 'common';

extendZodWithOpenApi(z);

/**
 * ソートの定義
 */
export const defOrderBy = (
  columns: Record<string, string>,
): { orderBy: z.ZodType<string> } => {
  let description = 'ソートの定義\n';
  const allowedColumns = Object.keys(columns);

  Object.entries(columns).forEach(([key, value]) => {
    description += ` - ${key}: ${value} 昇降順\n`;
  });

  return {
    orderBy: z
      .string()
      .refine(
        (v) => {
          const columns = v.split(',');
          return columns.every((column) => {
            const propName = column.replace('-', '');
            return allowedColumns.includes(propName);
          });
        },
        {
          message: '無効なソート順が指定されています',
        },
      )
      .describe(description)
      .optional(),
  };
};

/**
 * ページネーション定義
 * @returns
 */
export const defPagination = () => {
  return {
    take: z.number().min(-1).max(1000).optional().describe('取得する数'),
    skip: z.number().min(0).optional().describe('飛ばす数'),
  };
};

/**
 * OKレスポンス
 */
export const defOk = (message: string) =>
  z.object({
    ok: z.literal(message),
  });

/**
 * エラーレスポンス
 */
export const defError = (messages: Array<string>) =>
  z.object({
    error: z.literal(messages.join('｜')),
  });

/**
 * ポリシー定義
 * この中で依存関係とか確認したい
 */
export const defPolicies = (policies: Array<keyof typeof apiPolicies>) => {
  return policies;
};
