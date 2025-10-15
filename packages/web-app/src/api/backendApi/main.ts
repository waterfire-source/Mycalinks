import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { apiPrivilegesType, fileData } from '@/types/BackendAPI';

import { renameSync, rmSync } from 'fs';
import { ApiError, ApiErrorObj } from '@/api/backendApi/error/apiError';
import { SSE, SubscribeApiEventType } from '@/api/backendApi/event/sse';
import { ApiEvent, ApiEventBody } from 'backend-core';
import {
  BackendApiAuthService,
  mycaUserType,
} from '@/api/backendApi/auth/main';
import { Session } from 'next-auth';
import { BackendApiCacheService } from '@/api/backendApi/services/cache/main';
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context';
import {
  BackendCoreError,
  BackendService,
  SNSCustomClient,
} from 'backend-core';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { ApiMethod, BackendApiDef } from 'api-generator';
import { apiPolicies } from 'common';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

export enum ResponseMsgKind {
  permission = '権限がありません',
  notEnoughData = '情報が足りません',
  serverError = 'サーバーで不具合が発生しました',
  updated = '情報が更新できました',
  created = '登録が完了しました',
  deleted = '削除が完了しました',
  notExist = '存在しないデータを参照しています',
  invalidWebhook = 'webhookの署名が不正です',
}

export type ValueOf<T> = T[keyof T];

//[TODO] 見直し必要
export class BackendAPI<
  DefType extends BackendApiDef = BackendApiDef,
> extends BackendService {
  public user?: Session['user'] & {
    role: 'pos';
  };
  public role: Array<ValueOf<typeof apiRole>>;
  public mycaUser: mycaUserType; //[TODO]: 別にしたい
  public statusNum: number;
  public body: any;
  public query: any;
  public params: any;
  public setCookies: Array<{
    key: string;
    value: string;
    expire?: number;
  }>;
  public files: Array<fileData>;

  public requestTime: number;

  constructor(public req: NextRequest) {
    super();

    this.role = [];
    this.mycaUser = null;
    this.statusNum = 200;
    this.body = null;
    this.setCookies = [];
    this.query = {};
    this.params = {}; //この辺りの値は書き変わらない
    this.files = [];
    this.requestTime = Date.now();
    //このコンストラクタは1API呼び出しにつき1回呼ばれる
    this.generateService({});
  }

  //[TODO] この辺の処理を分野ごとにクラスに切り出して分けたい
  // auth系はCustomAuthenticatorというクラスを作るなど
  //そもそもミドルウェア化したい

  //setUpはAPIハンドラー関数内で直接呼ぶのは非推奨 現在はdefineApiラッパー内でのみ使う想定
  static async setUp<DefType extends BackendApiDef>(
    req: NextRequest,
    params?: any,
    apiDef?: apiPrivilegesType,
  ): Promise<BackendAPI<DefType>> {
    const instance = new BackendAPI<DefType>(req);

    if (req) {
      instance.query = Object.fromEntries(req.nextUrl.searchParams);
      instance.params = params;

      if (
        req.headers.get('content-type')?.includes('application/json') &&
        req.method != 'GET'
      ) {
        try {
          instance.body = await req.json();
        } catch {
          console.log('ボディは取得できなかった');
        }
      }

      const fileModule = new BackendApiFileService(instance);
      await fileModule.setUp();

      //権限、リソース所有権周り
      const auth = new BackendApiAuthService(instance);
      await auth.setUp(apiDef);
    }

    return instance;
  }

  //APIハンドラー関数をラッピングすることでフィールドの確認や権限の確認などができる
  //エラーのハンドリングにも対応
  /**
   * @deprecated 廃止予定
   */
  public static defineApi =
    <thisApiDefType extends apiDefType>(
      apiDef: thisApiDefType,
      handler: ApiHandlerFunc<thisApiDefType>,
    ) =>
    //コールバック関数を返す
    async (
      req: NextRequest,
      additionalData: {
        params: Record<string, string>;
      },
    ) => {
      //中でハンドラー関数を実行する
      let API: BackendAPI<any>;

      try {
        //セットアップ 主にパラメータの整理と権限の確認 [TODO]: リソース別に権限確認の方法を定義書から入力できるようにしたい

        API = await BackendAPI.setUp(req, additionalData.params, {
          // @ts-expect-error becuase of because of
          privileges: apiDef.privileges,
        });

        const reqDef = apiDef.request;
        const resDef = apiDef.response;

        //クエリのバリデーション
        if (reqDef.query && reqDef.query != 'any') {
          API.fieldChecker(API.query, reqDef.query);
        }

        //パラム
        if (reqDef.params) {
          API.fieldChecker(API.params, reqDef.params);
        }

        //ボディチェック
        if (reqDef.body && reqDef.body != 'any') {
          API.fieldChecker(API.body, reqDef.body);
        }

        let registerSse:
          | ((registerSseInput: SubscribeApiEventType) => {
              stream: TransformStream;
              sendToClient: (data: thisApiDefType['response']['obj']) => void;
            })
          | undefined = undefined;

        //リアルタイムAPIかどうか判断
        if (resDef?.type == 'sse') {
          registerSse = (registerSseInput) => {
            const addRes = SSE.addClient({
              API: API!,
              subscribeApiEvent: registerSseInput,
            });

            return {
              ...addRes,
              sendToClient: async (data) => {
                //この型でクライアントにデータを送る

                const apiEvent = new ApiEvent({
                  // type: registerSseInput?.type ?? '',
                  //@ts-expect-error becuase of because of
                  obj: data,
                });

                await SSE.sendMessage(API.processId, apiEvent.body);
              },
            };
          };
        }

        const cacheService = new BackendApiCacheService(
          API,
          typeof apiDef.cache == 'number' ? apiDef.cache : undefined,
        );

        //キャッシュが指定されているかどうか
        if (apiDef.method == apiMethod.GET && apiDef.cache) {
          //このリクエストの
          let cacheData;
          if ((cacheData = await cacheService.getCache())) {
            console.log('キャッシュから返します');
            return API.status(200).response({ data: cacheData });
          }
        }

        const handlerRes = await handler(
          API!,
          {
            query: API.query,
            params: API.params,
            body: API.body,
          },
          registerSse,
        );

        //リアルタイムAPIだったらstreamを返す
        if (resDef?.type == 'sse' && handlerRes instanceof TransformStream)
          return new NextResponse(handlerRes.readable, {
            headers: {
              'Content-Type': 'text/event-stream; charset=utf-8',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
              'Cache-Control': 'no-cache, no-transform',
            },
          });

        if (handlerRes) {
          if (apiDef.method == apiMethod.GET && apiDef.cache) {
            cacheService.setCache(handlerRes);
          }
          return API.status(200).response({ data: handlerRes });
        }

        const resInDef = apiDef.response;

        if (Object.values(resInDef).length)
          return API.status(200).response({ data: resInDef });

        return API.status(200).response({
          msgContent: '処理が完了しました',
        });
      } catch (err: unknown) {
        if (isDynamicServerError(err)) throw err;

        //Slackに送信
        if (API!?.req) {
          await API.sendDevAlert(err as Error);
        }

        //ApiError形式だったら綺麗にエラーを返す
        if (err instanceof ApiError) return err.emit();

        //バックエンドコアエラー形式だったらexternalMessageがあるならそれをステータスメッセージとして返す　ステータスコードは500で固定
        if (err instanceof BackendCoreError) {
          const apiError = new ApiError({
            status: 500,
            messageText: err.externalMessage ?? 'サーバーエラー',
          });

          return apiError.emit();
        }

        //そうじゃなかったら不明エラーとして返す
        return ApiError.emitUnknown();
      }
    };

  /**
   * OpenAPI&zodの方
   */
  public static create =
    <thisApiDefType extends BackendApiDef>(
      apiDef: thisApiDefType,
      handler: OpenApiHandlerFunc<thisApiDefType>,
    ) =>
    //コールバック関数を返す
    async (
      req: NextRequest,
      additionalData: {
        params: Record<string, string>;
      },
    ) => {
      //中でハンドラー関数を実行する
      let API: BackendAPI<thisApiDefType>;

      try {
        //セットアップ 主にパラメータの整理と権限の確認 [TODO]: リソース別に権限確認の方法を定義書から入力できるようにしたい

        API = await BackendAPI.setUp(req, additionalData.params, {
          // @ts-expect-error becuase of because of
          privileges: apiDef.privileges,
        });

        const reqDef = apiDef.request;
        const resDef = apiDef.response;

        //クエリのバリデーション zodを使う
        if (reqDef.query) {
          API.fieldCheckerWithZod(API.query, reqDef.query);
        }

        //パラム
        if (reqDef.params) {
          API.fieldCheckerWithZod(API.params, reqDef.params);
        }

        //ボディチェック
        if (reqDef.body && reqDef.body != 'any') {
          API.fieldCheckerWithZod(API.body, reqDef.body);
        }

        const cacheService = new BackendApiCacheService(
          API,
          typeof apiDef.cache == 'number' ? apiDef.cache : undefined,
        );

        //キャッシュが指定されているかどうか
        if (apiDef.method == ApiMethod.GET && apiDef.cache) {
          //このリクエストの
          let cacheData;
          if ((cacheData = await cacheService.getCache())) {
            console.log('キャッシュから返します');
            return API.status(200).response({ data: cacheData });
          }
        }

        const handlerRes = await handler(API!, {
          query: API.query,
          params: API.params,
          body: API.body,
        });

        if (handlerRes) {
          if (apiDef.method == ApiMethod.GET && apiDef.cache) {
            cacheService.setCache(handlerRes);
          }
          return API.status(200).response({ data: handlerRes });
        }

        const resInDef = apiDef.response;

        if (API.getInstanceType(resInDef) == 'ZodObject') {
          for (const [key, value] of Object.entries(
            (resInDef as z.ZodObject<any>).shape,
          )) {
            if (key == 'ok') {
              //valueがリテラルだったらそれを返す

              //@ts-expect-error becuase of because of
              if (API.getInstanceType(value) == 'ZodLiteral') {
                return API.status(200).response({
                  data: {
                    ok: (value as z.ZodLiteral<string>)._def.value,
                  },
                });
              }
            }
          }
        }

        return API.status(200).response({
          msgContent: '処理が完了しました',
        });
      } catch (err: unknown) {
        if (isDynamicServerError(err)) throw err;

        //Slackに送信
        if (API!?.req) {
          await API.sendDevAlert(err as Error);
        }

        //ApiError形式だったら綺麗にエラーを返す
        if (err instanceof ApiError) return err.emit();

        //バックエンドコアエラー形式だったらexternalMessageがあるならそれをステータスメッセージとして返す　ステータスコードは500で固定
        if (err instanceof BackendCoreError) {
          const apiError = new ApiError({
            status: 500,
            messageText: err.externalMessage ?? 'サーバーエラー',
          });

          return apiError.emit();
        }

        //そうじゃなかったら不明エラーとして返す
        return ApiError.emitUnknown();
      }
    };

  /**
   * エラーをSlackに送信
   */
  sendDevAlert = async (e: Error) => {
    if (!this.req) return false;

    console.error(e);

    let errMessage = `🚨${process.env.RUN_MODE}で *エラー発生*
`;
    if (e instanceof ApiError) {
      if (e.status != 500) return;

      errMessage += `
ステータスコード:${e.status}
ステータスメッセージ:${e.messageText}


      `;
    }

    errMessage += `

エラー名:${e.name}
${e.cause}
${e.message}
${e.stack}


    `;

    const sendMessage = `
${errMessage}

${this.reqInfoText}

datetime: ${new Date().toISOString()}
    `;

    const sns = new SNSCustomClient('slack');

    console.error(errMessage);
    const res = await sns.sendToSlack({
      message: sendMessage,
      subject: 'POSエラー',
    });

    //ロガーでも送信する
    if (this.storage?.logService) {
      const logService = this.storage.logService;

      logService.add(`${errMessage}`);

      await logService.save();
    }
  };

  status(statusNum: number): BackendAPI<DefType> {
    //ステータスを格納するセッター的なやつ

    this.statusNum = statusNum;
    return this;
  }

  public get reqInfoText() {
    return `
reqTime: ${new Date(this.requestTime).toISOString()}

url: ${this.req.url}
method: ${this.req.method}
query:
${JSON.stringify(this.query, null, '  ')}

params:
${JSON.stringify(this.params, null, '  ')}

body:
${JSON.stringify(this.body, null, '  ')}

role: ${this.role}
    `;
  }

  //ハッシュ化関数(廃止予定)
  //sha256(char: string): string {
  //  return crypto.createHash('sha256').update(char).digest('hex');
  //}

  public get isTest() {
    return process.env.VITEST == 'true';
  }

  //prismaの結果をフラットに取得するための関数 基本的に参照渡しをすることで再帰的に実行しても変更が反映されるようにする
  // [TODO] フラットにすることによるメリットが割と薄いため廃止する予定 もしくは存続させるにしてもタイプセーフに扱える様に改造したい
  /**
   * @deprecated 廃止予定
   */
  static useFlat(
    obj: any,
    aliasObj?: any,
    excludeObj?: any,
    parentObj?: any,
    propName?: string,
  ): any {
    //parentがなくてobjとして渡されていた場合、配列にして[0]を取り出す
    const ifRootObj =
      obj instanceof Object &&
      !(obj instanceof Array) &&
      Object.keys(obj).length > 0 &&
      !parentObj &&
      !propName;

    if (ifRootObj) {
      obj = [obj];
    }

    //配列の場合
    if (obj instanceof Array) {
      for (const each of obj) {
        //配列の中のオブジェクトの中の項目について検証
        for (const [key, value] of Object.entries(each)) {
          this.useFlat(value, aliasObj, excludeObj, each, key);
        }
      }
    }

    //連想配列の場合
    else if (
      obj instanceof Object &&
      !(obj instanceof Array) &&
      Object.keys(obj).length > 0 &&
      parentObj &&
      propName &&
      !(propName in (excludeObj || {}))
    ) {
      for (const prop in obj) {
        let alias = `${propName}__${prop}`;

        if (aliasObj) {
          if (`${propName}__` in aliasObj) {
            alias = aliasObj[`${propName}__`] + prop;
          }
          if (alias in aliasObj) {
            alias = aliasObj[alias];
          }
        }

        parentObj[alias] = obj[prop];
        this.useFlat(obj[prop], aliasObj, excludeObj, parentObj, alias);
      }
      delete parentObj[propName];
    } else if (typeof obj == 'bigint' && parentObj && propName) {
      parentObj[propName] = Number(obj);
      return parentObj[propName];
    }

    if (ifRootObj && obj instanceof Array) {
      obj = obj[0];
    }

    return obj;
  }

  //Bodyのフィールドをチェックする 廃止するかも
  checkField(
    allowedFields: Array<keyof z.infer<DefType['request']['body']>>,
    isNeed?: boolean,
  ): BackendAPI<DefType> {
    if (!this.body) throw new ApiError('permission');

    if (!isNeed) {
      if (
        !Object.keys(this.body as z.infer<DefType['request']['body']>).every(
          (prop) => allowedFields.includes(prop),
        )
      ) {
        throw new ApiError('permission');
      }
    } else {
      //必要なフィールドモードだったら、400番エラー
      if (
        !allowedFields.every((prop) =>
          Object.keys(
            this.body as z.infer<DefType['request']['body']>,
          ).includes(String(prop)),
        )
      ) {
        throw new ApiError('notEnough');
      }
    }

    return this;
  }

  //skip, take
  public get limitQuery() {
    const { skip, take } = this.query;

    return {
      skip: Number(skip) || undefined,
      take: take == '-1' ? undefined : take ? Number(take) : 500, //何も指定がない場合は500個制限 -1を指定されている時は無制限
    };
  }

  //skip, take
  public get limitQueryRaw() {
    const { skip, take } = this.query;

    const skipQuery = Prisma.sql([String(skip || 0)]);
    const takeQuery = Prisma.sql([String(take || 100)]);

    return Prisma.sql`
    LIMIT ${skipQuery},${takeQuery}
    `;
  }

  /**
   * クエリパラメータを順番に確認していくやつ
   */
  public async processQueryParams(
    callback: (
      prop: keyof z.infer<DefType['request']['query']>,
      value: ValueOf<z.infer<DefType['request']['query']>>,
    ) => Promise<void> | void,
  ) {
    for (const prop in this.query) {
      const value = this.query[prop];

      await callback(prop, value);
    }
  }

  //orderBy
  public get orderByQuery() {
    const { orderBy } = this.query;
    if (!orderBy) return [];

    //順番が大事であるためArr
    const splitted = orderBy.split(',');

    const queryArr: Array<Record<string, 'asc' | 'desc'>> = splitted.map(
      (e: string) => {
        const mode = e.includes('-') ? 'desc' : 'asc';
        const propName = e.replace('-', '');

        return {
          [propName]: mode,
        };
      },
    );

    return queryArr;
  }

  //orderBy
  public get orderByQueryRaw() {
    const { orderBy } = this.query;

    let queryString = Prisma.sql``;

    if (!orderBy) return queryString;

    queryString = Prisma.sql`
    ORDER BY 
    `;

    //順番が大事であるためArr
    const splitted = orderBy.split(',');

    const queryArr: Array<Record<string, 'ASC' | 'DESC'>> = splitted.map(
      (e: string) => {
        const mode = e.includes('-') ? 'DESC' : 'ASC';
        const propName = e.replace('-', '');

        return {
          [propName]: mode,
        };
      },
    );

    queryString = Prisma.sql`
    ${queryString} ${Prisma.join(
      queryArr.map((e) => {
        const entry = Object.entries(e)[0];

        const field = Prisma.sql([entry[0]]);
        const mode = Prisma.sql([entry[1]]);

        if (entry) {
          return Prisma.sql`${field} ${mode}`;
        } else {
          return Prisma.sql``;
        }
      }),
    )}`;

    return queryString;
  }

  /**
   * IP取得
   */
  public get reqIp() {
    const ip = this.req!.headers.get('x-forwarded-for')?.split(',')[0] || ''; // プロキシ経由の場合
    return ip;
  }

  //あくまでもフィールドチェック、最低限のキャスト、バリデーションを提供するため、
  //データの前処理は別で行うこと
  //フィールドについては確認するが、オブジェクト自体の有無については寛容する
  /**
   * フィールドをチェックする関数
   * @deprecated 廃止予定
   * @param reqBody - リクエストの値オブジェクト
   * @param defBody - API定義書の方のオブジェクト
   * @returns - 不適切な場合にエラーをスローだけのため、返り値は無し
   */
  public fieldChecker = (
    reqBody: bodyObjectType,
    defBody: bodyObjectType,
  ): void => {
    //オブジェクトだったら
    if (defBody && defBody instanceof Object) {
      //連想配列だったら
      if (!(defBody instanceof Array)) {
        //パラメータの方がundefinedだったら許してあげる
        if (reqBody === undefined) return;

        //パラメータの方も連想配列になっているか確認
        if (
          !reqBody ||
          !(reqBody instanceof Object) ||
          reqBody instanceof Array
        ) {
          console.error(
            reqBody,
            defBody,
            'パラメータの方が連想配列になっていませんでした',
          );

          throw new ApiError('invalidParameter');
        }

        //それぞれのフィールドを確認
        for (const [prop, value] of Object.entries(defBody)) {
          //このフィールドがオブジェクトか確認する
          // @ts-expect-error becuase of フィールド定義の方にあわせるため
          if (!value.isField && value instanceof Object) {
            this.fieldChecker(
              reqBody[prop] as bodyObjectType,
              value as bodyObjectType,
            ); //オブジェクトだったら再帰的に確認する
          }

          const thisField = value as unknown as fieldDef;

          //このフィールドが必須かどうかを判定
          const required = thisField.required;

          //必須だったら、あるか確認する
          if (required && reqBody[prop] === undefined) {
            console.error(`${prop}が必須ですが指定されていませんでした`);

            throw new ApiError('notEnough');
          }

          //この下は値がある場合にのみ行う
          if (reqBody[prop] === undefined) continue;

          //キャストするべきか確認 同時に型確認も行なったりする
          if (thisField.caster) {
            //キャストする
            switch (thisField.caster) {
              case String:
                reqBody[prop] = String(reqBody[prop]);
                break;
              case Number:
                reqBody[prop] = Number(reqBody[prop]);

                //キャストできてなかったらエラー
                if (isNaN(reqBody[prop] as number)) {
                  console.error(`${prop}をNumberにキャストできませんでした`);
                  throw new ApiError('invalidParameter');
                }

                break;

              case Boolean:
                if (reqBody[prop] == 'true') {
                  reqBody[prop] = true;
                } else if (reqBody[prop] == 'false') {
                  reqBody[prop] = false;
                } else if (typeof reqBody[prop] == 'string') {
                  console.error(`${prop}をBooleanにキャストできませんでした`);
                  throw new ApiError('invalidParameter');
                } else {
                  reqBody[prop] = Boolean(reqBody[prop]);
                }

                break;

              case Date:
                //適切な日付か確認
                if (!reqBody[prop]) continue;
                reqBody[prop] = new Date(
                  (reqBody[prop] as string)?.replaceAll(`"`, ''),
                );
                if (isNaN((reqBody[prop] as Date).getTime())) {
                  console.error(`${prop}をDateにキャストできませんでした`);
                  throw new ApiError('invalidParameter');
                }
                break;

              // case DataUrlFile:
              //   //base64形式でアップロードしたものをFile形式に変換したい場合
              //   const thisFile = new DataUrlFile(reqBody[prop] as string);
              //   reqBody[prop] = thisFile;
              //   break;

              default: //それ以外はenum
                //orderByのキャスターの可能性があるため確認
                if (
                  'type' in thisField.caster &&
                  thisField.caster.type == 'orderBy'
                ) {
                  //カンマ区切りを解く
                  const splitted = (reqBody[prop] as string).split(',');
                  splitted.forEach((e) => {
                    const propName = e.replace('-', '');

                    // @ts-expect-error becuase of 上でこのキャスターがorderByであることは確認しているため
                    if (!thisField.caster.fields.includes(propName))
                      throw new ApiError('invalidParameter');
                  });
                }

                //ちゃんとenumの中に入っているか確認
                else if (!((reqBody[prop] as string) in thisField.caster)) {
                  console.error(`${prop}をenumにキャストできませんでした`);
                  throw new ApiError('invalidParameter');
                }
            }
          }

          //バリデータがあったらバリデーションする
          if (thisField.validator) {
            const validationResult = thisField.validator(reqBody[prop]);

            if (validationResult === false) {
              console.error(`${prop}のバリデーションエラーです`);
              throw new ApiError('invalidParameter');
            } else if (typeof validationResult == 'string') {
              console.error(`${prop}のバリデーションエラーです`);
              throw new ApiError({
                status: 400,
                messageText: validationResult,
              });
            }
          }
        }

        //余計なパラメータが指定されていないか確認
        for (const prop in reqBody) {
          if (!Object.keys(defBody).includes(prop)) {
            console.error(`${prop}という余分なパラメータが指定されています`);
            throw new ApiError('notAllowedParameter');
          }
        }
      }
      //配列だったら
      else {
        //undefinedだったら逆に許す
        if (reqBody === undefined) return;

        //パラメータの方も配列になっているか確認
        if (
          !reqBody ||
          !(reqBody instanceof Object) ||
          !(reqBody instanceof Array)
        ) {
          console.error(
            reqBody,
            defBody,
            'パラメータの方が配列になっていませんでした',
          );
          throw new ApiError('invalidParameter');
        }

        //全ての要素が型を満たしているか確認
        const defUnit = defBody[0];

        // @ts-expect-error becuase of フィールド定義の方にあわせるため
        if (!defUnit.isField && defUnit instanceof Object) {
          //要素がオブジェクトで指定されていたら再帰的に実行する
          for (const each of reqBody) {
            this.fieldChecker(
              each as bodyObjectType,
              defUnit as bodyObjectType,
            );
          }
        }

        //オブジェクトで指定されていない場合は特に検証しない
      }
    }
  };

  private getInstanceType = (zod: z.ZodType): string => {
    if (!zod) return '';

    zod = this.unwrapZod(zod);

    //@ts-expect-error becuase of because of
    return zod._def.typeName;
  };

  private unwrapZod = (zod: z.ZodType): z.ZodType => {
    // optional/nullable/arrayなど、unwrapを持つ型ならunwrapする
    if (typeof (zod as any).unwrap === 'function') {
      const unwrapped = (zod as any).unwrap();
      return this.unwrapZod(unwrapped);
    }
    return zod;
  };

  /**
   * zod使う版 見直し必要
   * バージョンの違いのせいか、instanceofが機能してなかったからconstructor.nameで耐えてる
   */
  public fieldCheckerWithZod = (
    reqBody: bodyObjectType,
    defBody: z.ZodType,
  ): void => {
    defBody = this.unwrapZod(defBody);

    //オブジェクトだったら
    if (
      defBody &&
      (this.getInstanceType(defBody) == 'ZodObject' ||
        this.getInstanceType(defBody) == 'ZodArray')
    ) {
      //連想配列だったら
      if (this.getInstanceType(defBody) != 'ZodArray') {
        //パラメータの方がundefinedだったら許してあげる
        if (reqBody === undefined) return;

        //パラメータの方も連想配列になっているか確認
        if (
          !reqBody ||
          !(reqBody instanceof Object) ||
          reqBody instanceof Array
        ) {
          console.error(
            reqBody,
            defBody,
            'パラメータの方が連想配列になっていませんでした',
          );

          throw new ApiError('invalidParameter');
        }

        //それぞれのフィールドを確認
        //@ts-expect-error becuase of because of
        const defShape = defBody.shape;
        for (const [prop, value] of Object.entries(defShape)) {
          //このフィールドがオブジェクトか確認する
          //@ts-expect-error becuase of because of
          if (this.getInstanceType(value) == 'ZodObject') {
            this.fieldCheckerWithZod(
              reqBody[prop] as bodyObjectType,
              value as z.ZodType,
            ); //オブジェクトだったら再帰的に確認する
          }

          const thisField = value as z.ZodType;

          //このフィールドが必須かどうかを判定
          const required = !thisField.isOptional();

          //必須だったら、あるか確認する
          if (required && reqBody[prop] === undefined) {
            console.error(`${prop}が必須ですが指定されていませんでした`);

            throw new ApiError('notEnough');
          }

          //この下は値がある場合にのみ行う
          if (reqBody[prop] === undefined) continue;

          //キャストするべきか確認 同時に型確認も行なったりする

          //キャストする
          //@ts-expect-error becuase of because of
          switch (this.getInstanceType(value)) {
            case 'ZodString':
              reqBody[prop] = String(reqBody[prop]);
              break;
            case 'ZodNumber':
              reqBody[prop] = Number(reqBody[prop]);

              //キャストできてなかったらエラー
              if (isNaN(reqBody[prop] as number)) {
                console.error(`${prop}をNumberにキャストできませんでした`);
                throw new ApiError('invalidParameter');
              }

              break;

            case 'ZodBoolean':
              if (reqBody[prop] == 'true') {
                reqBody[prop] = true;
              } else if (reqBody[prop] == 'false') {
                reqBody[prop] = false;
              } else if (typeof reqBody[prop] == 'string') {
                console.error(`${prop}をBooleanにキャストできませんでした`);
                throw new ApiError('invalidParameter');
              } else {
                reqBody[prop] = Boolean(reqBody[prop]);
              }

              break;

            case 'ZodDate':
              //適切な日付か確認
              if (!reqBody[prop]) continue;
              reqBody[prop] = new Date(
                (reqBody[prop] as string)?.replaceAll(`"`, ''),
              );
              if (isNaN((reqBody[prop] as Date).getTime())) {
                console.error(`${prop}をDateにキャストできませんでした`);
                throw new ApiError('invalidParameter');
              }
              break;
          }

          //あとのバリデーションはzodに任せる
          const validationResult = thisField.safeParse(reqBody[prop]);
          if (!validationResult.success) {
            console.error(`${prop}のバリデーションエラーです`);
            console.log(validationResult.error);

            //中にメッセージが定義されていたらそれを返す
            const errors = validationResult.error.errors;
            const errMsgs = errors.map((e) => e.message);

            if (errMsgs.length > 0) {
              throw new ApiError({
                status: 400,
                messageText: errMsgs.join('\n'),
              });
            }

            throw new ApiError('invalidParameter');
          }
        }

        //余計なパラメータが指定されていないか確認
        for (const prop in reqBody) {
          //@ts-expect-error becuase of because of
          if (!Object.keys(defBody.shape).includes(prop)) {
            console.error(`${prop}という余分なパラメータが指定されています`);
            throw new ApiError('notAllowedParameter');
          }
        }
      }
      //配列だったら
      else {
        //undefinedだったら逆に許す
        if (reqBody === undefined) return;

        //パラメータの方も配列になっているか確認
        if (
          !reqBody ||
          !(reqBody instanceof Object) ||
          !(reqBody instanceof Array)
        ) {
          console.error(
            reqBody,
            defBody,
            'パラメータの方が配列になっていませんでした',
          );
          throw new ApiError('invalidParameter');
        }

        //全ての要素が型を満たしているか確認
        //@ts-expect-error becuase of because of
        const defUnit = defBody.element;

        if (this.getInstanceType(defUnit) == 'ZodObject') {
          //要素がオブジェクトで指定されていたら再帰的に実行する
          for (const each of reqBody) {
            this.fieldCheckerWithZod(
              each as bodyObjectType,
              defUnit as z.ZodType,
            );
          }
        }

        //オブジェクトで指定されていない場合は特に検証しない
      }
    }
  };

  response({
    data = {},
    msgContent,
  }: {
    data?: any;
    msgContent?: ResponseMsgKind | string;
  }): NextResponse {
    //NextResponse形式でレスポンスを行う関数

    //一時ファイルを削除する
    for (const file of this.files) {
      if (!file.dontDelete) {
        rmSync(`./uploaded/${file.nameOnServer}`);
      } else {
        renameSync(
          `./uploaded/${file.nameOnServer}`,
          `./uploaded/keeped__${file.nameOnServer}`,
        );
      }
    }

    const msgKindDict: any = {};

    if (msgContent) {
      data = {
        [/^2..$/.test(this.statusNum.toString()) ? 'ok' : 'error']: msgContent,
      };
    }

    const res = NextResponse.json(data, {
      status: this.statusNum,
    });

    this.setCookies.forEach((cookie) => {
      res.cookies.set(cookie.key, cookie.value, {
        expires: cookie.expire,
      });
    });

    this.destruct();

    return res;
  }
}

export enum apiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export const apiRole = {
  pos: 'pos', //POSのアカウントとして認証されている状態
  everyone: '',
  bot: 'bot',
  mycaUser: 'myca_user',
  admin: 'admin', //MycaAdminとして
  god: 'god', //神
} as const;

export type apiRoleValues = ValueOf<typeof apiRole>;

//必須パラメータ
//ここで権限などをパラメータに入れて、フィールド単位で権限管理できるようにしてもいいかも
//Recordはenum用
type casterType =
  | NumberConstructor
  | StringConstructor
  | DateConstructor
  | BooleanConstructor
  | {
      type: 'orderBy';
      fields: Array<string>;
    }
  | Record<string, string>;

//バリデータは単一の値を受けて、trueかfalseかを返さないといけない
//もしくは、def.ts内の400番エラーのプロパティ名を指定することで、失敗時のエラー文字列を指定することができる
type validator<fieldType = unknown> = (value: fieldType) => boolean | string;

export type fieldDef = {
  isField: true;
  required?: true;
  must?: true;
  caster?: casterType;
  validator?: validator;
};

/**
 * 必要なリクエストフィールドを定義する関数
 * @type フィールドの型
 * @param caster - 値をキャスト&型確認したい場合のコンストラクタ
 * @param validator - 値をバリデーションしたい時のコールバック関数
 * @returns - フィールドの定義オブジェクト
 */
export const Required = <fieldType>(
  caster?: casterType,
  validator?: validator<fieldType>,
) => {
  return {
    isField: true, //これがフィールドの値定義であることを示す
    required: true, //これが必須フィールドであることを示す
    caster, //キャスター
    validator,
  } as unknown as NonNullable<fieldType>; //強制的にキャスト
  //NonNullableにすることで確実に値が入っていることを保証できる これで大丈夫か検討中
};

/**
 * 任意なリクエストフィールドを定義する関数
 * @type フィールドの型
 * @param caster - 値があった時、値をキャスト&型確認したい場合のコンストラクタ
 * @param validator - 値があった時、値をバリデーションしたい時のコールバック関数
 * @returns - フィールドの定義オブジェクト
 */
export const Optional = <fieldType>(
  caster?: casterType,
  validator?: validator<fieldType>,
) => {
  return {
    isField: true, //これがフィールドの値定義であることを示す
    required: false, //これが必須フィールドではないことを示す
    caster, //キャスター
    validator,
  } as unknown as fieldType | undefined; //強制的にキャスト
};

//並び替えのためのフィールド
export const defOrderBy = (fields: Array<string>) =>
  ({
    type: 'orderBy',
    fields,
  }) as const;

//リアルタイムレスポンス（SSE）
export const StreamRes = <dataType>() => {
  return {
    type: 'sse',
  } as unknown as ApiEventBody;
};

/**
 * APIの権限定義
 */
export type ApiPrivileges = {
  role: Array<apiRoleValues>; //必要なロール 配列指定
  policies?: Array<keyof typeof apiPolicies>; //必要なポリシー
};

//apiDefの共通形式
export interface apiDefType {
  method: apiMethod;
  path: string;
  cache?: number | true; //キャッシュを有効にする場合
  privileges: ApiPrivileges;
  request: {
    //リクエストパラメータの定義
    params?: Record<string, undefined | number | string>;
    query?:
      | Record<string, undefined | null | boolean | number | string | Date>
      | 'any';
    body?: Record<string, unknown> | 'any';
  };
  process: string;
  response: apiOkRes;
  // headers?: Record<string, string>; //追加ヘッダー
  error?: Record<string, ApiErrorObj>; //このAPI特有のエラーをあらかじめ定義しておく（なるべく定義書で定義した方がフロントエンドの人にも伝わりやすくて良い）
}

export type apiOkRes = Record<string, unknown>;

type bodyObjectType = Record<string, unknown> | Array<unknown>;

export type ApiHandlerFunc<thisApiDefType extends apiDefType> = (
  API: BackendAPI<any>,
  parameters: thisApiDefType['request'],
  registerSse:
    | ((registerSseInput: SubscribeApiEventType) => {
        stream: TransformStream;
        sendToClient: (data: thisApiDefType['response']['obj']) => void;
      })
    | undefined,
) => Promise<thisApiDefType['response'] | void | TransformStream>;

// export type ParamsType<ParamsSchema extends Record<string, z.ZodType>> = {
//   [K in keyof ParamsSchema]: z.infer<ParamsSchema[K]>;
// };

export type OpenApiHandlerFunc<thisApiDefType extends BackendApiDef> = (
  API: BackendAPI<thisApiDefType>,
  parameters: {
    params: thisApiDefType['request']['params'] extends z.ZodType
      ? z.infer<thisApiDefType['request']['params']>
      : thisApiDefType['request']['params'];
    query: thisApiDefType['request']['query'] extends z.ZodType
      ? z.infer<thisApiDefType['request']['query']>
      : thisApiDefType['request']['query'];
    body: thisApiDefType['request']['body'] extends z.ZodType
      ? z.infer<thisApiDefType['request']['body']>
      : thisApiDefType['request']['body'];
  },
) => Promise<z.infer<thisApiDefType['response']> | void>;
