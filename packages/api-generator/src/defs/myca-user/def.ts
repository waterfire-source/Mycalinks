import { ApiMethod, apiRole, BackendApiDef } from '@/types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const getMycaUserBarcodeApi = {
  summary: 'Myca会員のバーコードを取得',
  description: 'Myca会員のバーコードを取得',
  method: ApiMethod.GET,
  path: '/myca-user/barcode',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {},
  process: `

  `,
  response: z.object({
    barcode: z.string().describe('バーコード'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
