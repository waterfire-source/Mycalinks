import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';

// OAuthのコールバック
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.everyone], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { state, error, code, response_type } = API.query;

    if (!state)
      throw new ApiError({
        status: 400,
        messageText: 'Bad Request',
      });

    //このCorporationを取得
    const thisCorpInfo = API.resources?.corporation;

    //法人がなくて本番環境だったらpublicにリダイレクト
    if (!thisCorpInfo) {
      let redirectUrl = '';
      const url = req.nextUrl;
      switch (process.env.RUN_MODE) {
        case 'local':
        case 'prod':
          redirectUrl = url.href.replace(
            url.origin,
            'https://pos.mycalinks.com',
          );
          break;
        default:
          throw new ApiError({
            status: 400,
            messageText: 'Bad Request',
          });
      }

      return NextResponse.redirect(redirectUrl);
    }

    if (!thisCorpInfo) throw new ApiError('notExist');

    //クッキーの妥当性を確認する

    const authState = req.cookies.get(
      BackendApiSquareService.config.oAuthStateKey,
    );
    const succeedCallbackUrl = req.cookies.get(
      BackendApiSquareService.config.succeedCallbackUrl,
    );
    const failedCallbackUrl = req.cookies.get(
      BackendApiSquareService.config.failedCallbackUrl,
    );

    if (!authState || state != authState.value)
      throw new ApiError({
        status: 401,
        messageText: 'Invalid State',
      });

    if (error || response_type != 'code' || !code)
      return NextResponse.redirect(
        new URL(failedCallbackUrl?.value ?? process.env.NEXT_PUBLIC_ORIGIN!),
      );

    //codeからトークンを算出
    const squareClient = new BackendApiSquareService(API);
    const tokenInfo = await squareClient.getTokenByOAuthCode(code);

    //トークンをデータベースに格納していく
    await API.db.corporation.update({
      where: {
        id: thisCorpInfo.id,
      },
      data: {
        square_access_token_expires_at: tokenInfo.expiresAt
          ? new Date(tokenInfo.expiresAt)
          : null,
        square_access_token: tokenInfo.accessToken,
        square_refresh_token: tokenInfo.refreshToken,
        square_available: true,
      },
    });

    //成功ページへ遷移
    return NextResponse.redirect(
      new URL(succeedCallbackUrl?.value ?? process.env.NEXT_PUBLIC_ORIGIN!),
    );
  },
);
