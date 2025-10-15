import { apiMethod, apiRole } from '@/api/backendApi/main';

export const transactionDailyCalculateDef = {
  method: apiMethod.POST,
  path: 'store/all/transaction/daily-calculate',
  privileges: {
    role: [apiRole.bot, apiRole.pos],
  },
  request: {
    body: 'any' as const,
  },
  process: `
  `,
  response: {
    ok: 'タスクがキューに送信されました',
  },
  error: {} as const,
};
