//APIの統合テストを行いやすくするためのやつ

import { ApiError } from '@/api/backendApi/error/apiError';
import { apiRoleValues } from '@/api/backendApi/main';
import { ApiResponse, BackendApiDef } from 'api-generator';
import { expect } from 'vitest';
import { z } from 'zod';

// type FetchLike<ResJson extends Record<string, any>, ReqBody extends any> = (
//   init?: RequestInit,
// ) => Promise<ResJson>;

type OriginalFetchLike<ResJson extends Record<string, any>, ReqBody> = (
  init?: Omit<RequestInit, 'body'> & {
    body?: ReqBody;
  },
) => Promise<ResJson>;

export class BackendApiTest {
  public static define = <
    thisApiDefType extends Omit<BackendApiDef, 'response'> & {
      response: any;
    },
  >(
    {
      as,
      apiDef,
      expectError,
    }: {
      as: apiRoleValues; // 任意の役割
      apiDef?: thisApiDefType;
      expectError?: boolean;
    },
    tester: (
      fetch: OriginalFetchLike<
        z.infer<thisApiDefType['response']>,
        z.infer<thisApiDefType['request']['body']>
      >,
    ) => Promise<void>,
  ) => {
    return async ({
      fetch,
    }: {
      fetch: (init?: RequestInit) => Promise<Response>;
    }) => {
      const wrappedFetch: OriginalFetchLike<
        z.infer<thisApiDefType['response']>,
        z.infer<thisApiDefType['request']['body']>
      > = async (init = {}) => {
        const mergedHeaders = {
          ...(init.headers || {}),
          'Content-Type': 'application/json',
          'Test-User-Kind': as,
        };

        const initForFetch: RequestInit = init;

        if (apiDef) {
          initForFetch.method = apiDef.method;
        }

        if (init.body) {
          initForFetch.body = JSON.stringify(init.body);
        }

        const res = await fetch({
          ...initForFetch,
          headers: mergedHeaders,
        });

        const json = await res.json();

        if (expectError) {
          expect(res.ok).toBe(false);
          throw new ApiError({
            //@ts-expect-error becuase of because of
            status: res.status,
            message: json.error,
          });
        } else {
          if (!res.ok) {
            throw new ApiError({
              //@ts-expect-error becuase of because of
              status: res.status,
              message: json.error,
            });
          }
          expect(res.ok).toBe(true);
        }

        expect(json).toBeDefined();

        //         console.log(`
        // APIレスポンス:
        // ${JSON.stringify(json, null, 2)}
        // `);
        return json as ApiResponse<thisApiDefType>;
      };

      await tester(wrappedFetch);
    };
  };

  public static describeApi = (apiDef: BackendApiDef) => {
    return `${apiDef.method} /api/${apiDef.path}`;
  };

  /**
   * 無作為に抽出
   */
  public static getRandRecord = <T extends Record<string, any>>(data: T[]) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex] as T;
  };
}
