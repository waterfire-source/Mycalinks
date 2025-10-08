import { getToken } from 'next-auth/jwt';
import {
  apiDefType,
  ApiHandlerFunc,
  apiRole,
  apiRoleValues,
  BackendAPI,
} from '@/api/backendApi/main';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { apiPrivilegesType } from '@/types/BackendAPI';
import { ApiError } from '@/api/backendApi/error/apiError';
import { PosRunMode, SessionUser } from '@/types/next-auth';
import { Account } from '@prisma/client';
// import { launchDef } from '@/app/api/launch/def';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { CustomCrypto } from '@/utils/crypto';
import { BackendApiService } from '@/api/backendApi/services/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import {
  ApiPolicies,
  BackendApiAccountService,
} from '@/api/backendApi/services/account/main';
export class BackendApiAuthService extends BackendApiService {
  constructor(API: BackendAPI<any>) {
    super(API);
  }

  /**
   * テスト用ミドルウェア
   */
  public testVerifyToken = async () => {
    const instance = this.API;
    const userKind = this.API.req!.headers.get(
      'Test-User-Kind',
    ) as apiRoleValues | null;

    //POSユーザーとしてだったら
    if (userKind == apiRole.pos) {
      const user = apiTestConstant.userMock.posMaster.token;

      instance.user = user;
    }

    if (userKind == apiRole.mycaUser) {
      const mycaUser = apiTestConstant.userMock.mycaUser.token;

      this.API.mycaUser = mycaUser;
    }

    //BOTだったらそちらを検証する
    let botRole = '';
    if (userKind == apiRole.bot) {
      botRole = 'bot';
    }

    //管理者だったらそちらを検証する
    let adminRole = '';
    if (userKind == apiRole.admin) {
      adminRole = 'admin';
    }

    const thisUserRoles = [
      instance.user?.role,
      instance.mycaUser?.role,
      botRole,
      adminRole,
    ].filter(Boolean);

    thisUserRoles.push('');

    instance.role = thisUserRoles as apiRoleValues[]; //最終的なロールを格納
  };

  /**
   * 通常トークン検証
   */
  public verifyToken = async () => {
    const instance = this.API;

    //トークンを取得する
    const token = await getToken({ req: instance.req! });

    //POSのユーザーセッション
    let godRole = '';

    if (token) {
      const user = {
        id: Number(token?.sub),
        role: 'pos',
        mode: token?.mode,
        corporation_id: Number(token?.corporation_id),
        store_id: token?.store_id ? Number(token.store_id) : null,
        register_id: token?.register_id ? Number(token.register_id) : null,
        email: token?.email,
        display_name: token?.display_name,
      } as SessionUser & {
        role: 'pos';
      };

      instance.user = user;

      if (token.isGod) {
        godRole = 'god';
      }
    }

    //もしくは、Mycaユーザーのトークンがあったらそちらを検証する
    const mycaAppClient = new BackendApiMycaAppService(instance);
    await mycaAppClient.verifyMycaAppUser();

    //BOTだったらそちらを検証する
    let botRole = '';
    if (instance.req!.headers.get('BotToken')) {
      if (instance.req!.headers.get('BotToken') == process.env.BOT_TOKEN) {
        console.log('bot認証ができたので通します');
        botRole = 'bot';
      }
    }

    //管理者だったらそちらを検証する
    let adminRole = '';
    if (instance.req!.headers.get('Myca-Admin-Token')) {
      if (
        instance.req!.headers.get('Myca-Admin-Token') ==
        process.env.MYCA_ADMIN_TOKEN
      ) {
        console.log('admin認証ができたので通します');
        adminRole = 'admin';
      }
    }

    const thisUserRoles = [
      instance.user?.role,
      instance.mycaUser?.role,
      botRole,
      adminRole,
      godRole,
    ].filter(Boolean);

    thisUserRoles.push('');

    instance.role = thisUserRoles as apiRoleValues[]; //最終的なロールを格納
  };

  /**
   * 認証ミドルウェア的な役割
   */
  public setUp = async (apiDef?: apiPrivilegesType) => {
    const instance = this.API;

    if (instance.isTest) {
      await this.testVerifyToken();
    } else {
      await this.verifyToken();
    }

    if (apiDef?.privileges) {
      //権限があるか確認 一旦ポリシーは確認しない
      const requiredRole = apiDef.privileges.role;

      this.checkRole(requiredRole);

      if (instance.params?.store_id) {
        //パスパラメータでストアを指定されていたら
        instance.setIds({
          storeId: Number(instance.params?.store_id),
        });

        //ストアの設定などをあらかじめ読み込んでおく
        const thisStoreInfo = await instance.db.store.findUnique({
          where: {
            id: Number(instance.params?.store_id),
            is_active: true, //非アクティブなストアはあかん
          },
          include: {
            accounts: {
              select: {
                account_id: true, //所有権確認のため
              },
            },
            ec_setting: true,
          },
        });

        if (!thisStoreInfo)
          throw new ApiError({
            status: 404,
            messageText: '存在しないストアを指定しています',
          });

        thisStoreInfo.buy_term = '';

        instance.resources.store = thisStoreInfo;
      }

      //レジを指定されていた場合、それがストアに紐づいているのかなどは確認
      if (instance.params?.register_id) {
        const thisRegisterInfo = await instance.db.register.findUniqueExists({
          where: {
            id: Number(instance.params?.register_id),
            store_id: instance.resources!.store!.id,
          },
        });

        if (!thisRegisterInfo)
          throw new ApiError({
            status: 404,
            messageText: '存在しないレジを指定しています',
          });

        instance.resources.register = thisRegisterInfo;
      }

      //POSシステムのアカウントだった場合、結びついている法人情報も取得しておく
      if (instance.user?.id) {
        const thisAccountInfo = await instance.db.account.findUniqueExists({
          where: {
            id: instance.user.id,
            linked_corporation_id: instance.user.corporation_id,
          },
          include: {
            linked_corporation: true,
            group: true,
          },
        });

        if (!thisAccountInfo)
          throw new ApiError({
            status: 401,
            messageText: '無効なトークンです',
          });

        const { linked_corporation, group, ...accountInfo } = thisAccountInfo;

        instance.resources.loginAccount = accountInfo;
        instance.resources.corporation = linked_corporation;

        instance.setIds({ corporationId: linked_corporation.id });

        //従業員アカウントが有効になっていなかったら、ユーザーIDを入れる形

        //動作主アカウントを考慮していく

        //管理モードだった場合や、営業モードでもバーコード機能を無効にされていた場合は、ログインアカウント＝動作アカウント
        const code = Number(instance.req!.cookies.get('staffCode')?.value);
        if (
          instance.user.mode == PosRunMode.admin ||
          !linked_corporation.enabled_staff_account ||
          (accountInfo.code === null && !code) // 神アカウント(codeがnull)かつ従業員バーコードがない場合
        ) {
          instance.resources.actionAccount = {
            ...accountInfo,
            group,
          };
        }

        //営業モードでバーコードが有効だった場合
        else {
          if (!code)
            throw new ApiError({
              status: 401,
              messageText: '営業モードでは従業員バーコードの読み取りが必要です',
            });

          const accountModel = new BackendApiAccountService(instance);
          const staffAccount = await accountModel.verifyStaffCode(code);

          instance.resources.actionAccount = staffAccount;
        }

        //アクションアカウントおよびログインアカウントが動作対象ストアの所有権があるか確認
        //権限が必要ない系のAPIの場合は無視（APIの本体処理で所有権を確認してもらう）←この部分は見直したい
        if (
          !requiredRole.includes(apiRole.everyone) &&
          instance.resources?.store
        ) {
          if (
            !instance.resources?.store.accounts.find(
              (e) => e.account_id == instance.resources.actionAccount?.id,
            ) ||
            !instance.resources?.store.accounts.find(
              (e) => e.account_id == instance.resources.loginAccount?.id,
            ) ||
            //営業モードなのにトークン内のStoreと一致しない場合エラー
            (instance.user.mode == PosRunMode.sales &&
              instance.user.store_id != instance.resources?.store.id)
          )
            throw new ApiError('permission');

          //ここでレジの所有権も確認する 一旦なしでOK
          // if (instance.resources.register) {
          //   if (
          //     instance.user.mode == PosRunMode.sales &&
          //     instance.user.register_id != instance.resources.register.id
          //   )
          //     throw new ApiError('permission');
          // }
        }

        //ポリシーがある時は確認する
        if (apiDef.privileges.policies) {
          //必要な権限を持っているかどうか
          this.checkPolicies(apiDef.privileges.policies);
        }
      }
    }
  };

  /**
   * ロールチェック
   */
  public checkRole = (role: Array<apiRoleValues>) => {
    if (!role.includes('') && !role.some((r) => this.API.role.includes(r))) {
      throw new ApiError('permission'); //ステータスを401にすることで権限がないことを示す
    }
  };

  /**
   * ポリシーチェック
   */
  public checkPolicies = (policies: Array<ApiPolicies>) => {
    if (
      policies.length &&
      (!this.API.resources.actionAccount?.group ||
        !policies.every((p) => this.API.resources.actionAccount!.group![p]))
    ) {
      throw new ApiError('permission');
    }
  };

  //ログイン前launch処理
  public static launch = async (
    db: BackendAPI['db'],
    email: Account['email'],
    password: string,
  ) => {
    let isGod = false;

    //アカウント取得
    const account = await db.account.findUniqueExists({
      where: {
        email,
        login_flg: true,
      },
      select: {
        id: true,
        hashed_password: true,
        salt: true,
        group: true,
        code: true,
        linked_corporation: {
          select: {
            id: true,
            name: true,
          },
        },
        stores: {
          select: {
            store: {
              select: {
                id: true,
                display_name: true,
                is_active: true,
                registers: {
                  select: {
                    id: true,
                    deleted: true,
                    display_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!account)
      throw new ApiError({
        status: 404,
        messageText: 'アカウントが見つかりませんでした',
      });

    const { group, hashed_password, salt, ...result } = account;

    //そもそもどちらの起動モードも許可されていない場合エラー
    const availableModes: Array<PosRunMode> = [];
    if (group.admin_mode) availableModes.push(PosRunMode.admin);
    if (group.sales_mode) availableModes.push(PosRunMode.sales);

    if (!availableModes.length)
      throw new ApiError({
        status: 401,
        messageText: 'このアカウントではログインが許可されていません',
      });

    const { isGod: isGodPassword } = this.passwordVerify({
      password,
      hashed_password,
      salt: salt || '',
    });

    isGod = isGodPassword;

    const availableCorpIds = mycaPosCommonConstants.prodAvailableCorporationIds;

    //RUN_MODEがprodだった時、myca以外の法人に結びついているアカウントではログインできない
    //神パスワードを使った時はOK
    if (
      process.env.RUN_MODE == 'prod' &&
      !isGod &&
      !availableCorpIds.includes(account.linked_corporation.id)
    )
      throw new ApiError({
        status: 401,
        messageText: 'このアカウントではログインが許可されていません',
      });

    //ここまできたらログインできるので、モード情報などを返していく

    //有効じゃないストアなどは消していく
    result.stores = result.stores.filter((e) => e.store.is_active);
    result.stores.forEach((s) => {
      s.store.registers = s.store.registers.filter((e) => !e.deleted);
    });

    return {
      availableModes,
      account: result,
      isGod,
    };
  };

  /**
   * @deprecated
   */
  public static definePolicies = (policies: Array<ApiPolicies>) => {
    //依存関係なども気にしながらポリシー定義を作る
    //とりあえずそのまま返す

    return policies;
  };

  public static passwordVerify = ({
    password,
    hashed_password,
    salt,
  }: {
    password: string;
    hashed_password: string;
    salt: string;
  }) => {
    const isValidPassword = CustomCrypto.verifyHash(
      password,
      hashed_password,
      salt,
    );

    //最強パスワードだった場合は許す
    if (!isValidPassword && password != process.env.MASTER_PASSWORD)
      throw new ApiError({
        status: 401,
        messageText: 'メールアドレスかパスワードが間違っています',
      });

    return {
      valid: isValidPassword,
      isGod: password == process.env.MASTER_PASSWORD,
    };
  };
}

type ApiDefs<thisApiDefType extends apiDefType> = [
  thisApiDefType,
  ApiHandlerFunc<thisApiDefType>,
];

type GetKeys<T> = T extends readonly unknown[]
  ? T extends Readonly<never[]>
    ? never
    : { [K in keyof T]-?: K }[number]
  : T extends Record<PropertyKey, unknown>
  ? { [K in keyof T]-?: K extends number | string ? `${K}` : never }[keyof T]
  : never;

export type mycaUserType = {
  id: number;
  role: 'myca_user';
  email: string;
} | null;
