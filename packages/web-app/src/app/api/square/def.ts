import { apiMethod, apiRole, Optional } from '@/api/backendApi/main';
import { Store } from '@prisma/client';

//OAuth同意URL取得API
/**
 * @deprecated Use getSquareOAuthUrlApi from api-generator instead
 */
export const getSquareOAuthUrlDef = {
  method: apiMethod.GET,
  path: 'square/oauth/url',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる
  },
  request: {
    query: {
      succeedCallbackUrl: Optional<string>(), //成功した時の遷移先URL
      failedCallbackUrl: Optional<string>(), //失敗した時の遷移先URL
    },
  },
  process: `
  stateも発行してそれをクッキーに保存しつつ、oauth同意画面用のURLを発行
  `,
  response: <
    {
      url: string;
    }
  >{},
  error: {
    alreadyAvailable: {
      status: 400,
      messageText: 'この法人ではすでにSquare連携設定が済んでいます',
    },
  } as const,
};

//Squareのlocationを取得するAPI
/**
 * @deprecated Use getSquareLocationsApi from api-generator instead
 */
export const getSquareLocationsDef = {
  method: apiMethod.GET,
  path: 'square/location',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: `
  `,
  response: <
    {
      locations: Array<{
        id: string; //SquareのlocationId
        name: string; //店舗名
        createdAt: string;
        pos_store_id: Store['id'] | null; //POS上の店舗ID（すでに結び付けられていた場合）
      }>;
    }
  >{},
  error: {} as const,
};
