import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const sendSingleTextToChatbotApi = {
  summary: 'チャットボットに単一テキストを送信',
  description: 'チャットボットに単一テキストを送信',
  method: ApiMethod.POST,
  path: '/admin/chatbot/single-text',
  privileges: {
    role: [apiRole.god],
  },
  request: {
    body: z.object({
      question: z.string().describe('質問'),
    }),
  },
  process: `

  `,
  response: z.object({
    answer: z.string().describe('回答'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
