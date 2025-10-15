import sseClients, { SSE } from '@/api/backendApi/event/sse';
import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: any) {
  const apiDef: apiPrivilegesType = {
    privileges: {
      role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
      policies: [], //実行に必要なポリシー
    },
  };

  const API = await BackendAPI.setUp(req, params, apiDef);

  for (const [id, client] of sseClients.entries()) {
    const data = {
      sample: 'これは長い文字列になりますね',
      type: 'ここで色々付け加えることでさらに長い文字列に',
      kaigyo: '改行なんかも\n\nつけてしまいましょう',
    };

    await SSE.sendMessage(id, data);
  }

  //この店の街灯の

  return API.response({ data: { message: 'success' } });
}
