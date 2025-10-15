//APIエラーを発しやすくするやつ

import { ResponseMsgKind } from '@/api/backendApi/main';
import { BackendCoreError } from 'backend-core';
import { NextRequest, NextResponse } from 'next/server';

type status = 400 | 404 | 401 | 500;

export type ApiErrorObj = {
  status: status;
  messageText?: string;
};

export class ApiError extends Error {
  public status: status;
  public messageText?: string;

  private static shortCuts = {
    permission: {
      status: 401,
      messageText: '権限がありません',
    },
    notEnough: {
      status: 400,
      messageText: '情報が不足しています',
    },
    notAllowedParameter: {
      status: 400,
      messageText: '許可されてないパラメータが指定されています',
    },
    invalidParameter: {
      status: 400,
      messageText: 'パラメータの形式が不正です',
    },
    notExist: {
      status: 404,
      messageText: '情報が見つかりません',
    },
    noStore: {
      status: 400,
      messageText: '店舗が指定されていません',
    },
    noStaffAccount: {
      status: 400,
      messageText: '従業員が指定されていません',
    },
  } as const;

  constructor(param: ApiErrorObj | keyof typeof ApiError.shortCuts) {
    if (typeof param == 'string') {
      param = ApiError.shortCuts[param];
    }

    super(param.messageText); //ErrorクラスにはmessageTextを渡す
    this.status = param.status;
    this.messageText = param.messageText;
  }

  //エラーをえみっとする
  public emit = () =>
    NextResponse.json(
      {
        error: this.messageText ?? 'エラーが発生しました',
      },
      {
        status: this.status,
      },
    );

  public static emitUnknown = () =>
    NextResponse.json(
      {
        error: ResponseMsgKind.serverError,
      },
      {
        status: 500,
      },
    );

  //エラーのラッパー（ほぼミドルウェアみたいになっちゃってる） これ今は使ってない
  public static errorWrapper =
    (fn: (req: NextRequest, param?: any) => Promise<unknown>) =>
    (req: NextRequest, param?: any) =>
      fn(req, param).catch(async (err) => {
        //エラーのインスタンスの種類を検査
        console.error(`サーバーエラー発生`, err);
        try {
          const body = await req.json();
          console.log('ボディは', body);
        } catch {
          console.log('ボディは取得できなかった');
        }
        if (err instanceof ApiError) return err.emit();

        if (err instanceof BackendCoreError) {
          const apiError = new ApiError({
            status: 500,
            messageText: err.externalMessage ?? 'サーバーエラー',
          });

          return apiError.emit();
        }

        return ApiError.emitUnknown();
      });
}
