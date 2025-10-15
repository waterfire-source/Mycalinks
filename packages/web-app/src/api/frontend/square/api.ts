import { CustomError } from '@/api/implement';
import { Register } from '@prisma/client';

export interface SquareAPI {
  getSquareOAuthUrl: {
    request: {
      succeedCallbackUrl: string;
      failedCallbackUrl: string;
    };
    // response: typeof getSquareOAuthUrlDef.response | CustomError; // これ使いたかったけどエラー吐かれるので一旦responseをそのまま定義
    response: {
      url: string;
    };
  };
  listSquareLocations: {
    // response: typeof getSquareLocationsDef.response | CustomError; // これ使いたかったけどエラー吐かれるので一旦responseをそのまま定義
    response:
      | {
          locations: Array<{
            id: string;
            name: string;
            createdAt: string;
            pos_store_id: string | null;
          }>;
        }
      | CustomError;
  };
  createSquareTerminalDeviceCode: {
    request: {
      storeID: number;
      registerID: number;
    };
    // response: typeof createSquareTerminalDeviceCodeDef.response | CustomError; // これ使いたかったけどエラー吐かれるので一旦responseをそのまま定義
    response: Register | CustomError;
  };
}

export type SquareAPIRes = {
  getSquareOAuthUrl: Exclude<
    SquareAPI['getSquareOAuthUrl']['response'],
    CustomError
  >;
  listSquareLocations: Exclude<
    SquareAPI['listSquareLocations']['response'],
    CustomError
  >;
  createSquareTerminalDeviceCode: Exclude<
    SquareAPI['createSquareTerminalDeviceCode']['response'],
    CustomError
  >;
};
