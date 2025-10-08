import { BackendAPI } from '@/api/backendApi/main';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { getRedis } from 'backend-core';
import sseClients, { SSE } from '@/api/backendApi/event/sse';

//ヘルスチェック
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const API = new BackendAPI(req);

    const isBot = ![...req.headers.keys()].length;
    if (isBot)
      throw new ApiError({
        status: 500,
        messageText: 'bot',
      });

    //データベース接続
    const stores = await API.db.store.count();

    if (!stores)
      throw new ApiError({
        status: 500,
        messageText: 'データベースに接続できません',
      });

    //redis接続 subscribe
    const redis = getRedis();
    SSE.subscribeRedis();

    if (!redis)
      throw new ApiError({
        status: 500,
        messageText: 'Redisに接続されていません',
      });

    //sseクライアントオブジェクト
    if (!sseClients)
      throw new ApiError({
        status: 500,
        messageText: 'SSE接続の準備ができていません',
      });

    return API.status(200).response({
      data: {
        prisma: 'ok',
        redis: 'ok',
        sse: 'ok',
      },
    });
  },
);
