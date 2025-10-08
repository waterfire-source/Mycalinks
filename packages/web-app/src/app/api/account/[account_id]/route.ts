import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { CustomCrypto } from '@/utils/crypto';
import { deleteAccountApi } from 'api-generator';
import { BackendAccountAPI } from '@/app/api/account/api';
import { BackendApiAuthService } from '@/api/backendApi/auth/main';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

// アカウント情報を更新するAPI
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [], //ポリシーなしでOK
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);
    const account = new BackendApiAccountService(API);

    const {
      current_password,
      new_password,
      email,
      display_name,
      group_id,
      regenerateCode,
      nick_name,
      stores,
    } = API.body as BackendAccountAPI[1]['request']['body'];
    if (!current_password) {
      throw new ApiError({
        status: 400,
        messageText: 'パスワードが必要です',
      });
    }

    // パスワード検証
    const { id: account_id } = API.user!; // ログインしているアカウントIDを取得
    const targetAccountId = Number(params.account_id);
    const loginAccount = await API.db.account.findUniqueExists({
      where: { id: Number(account_id) },
      select: {
        hashed_password: true,
        salt: true,
      },
    });
    if (!loginAccount) {
      throw new ApiError({
        status: 404,
        messageText: 'アカウントが見つかりません',
      });
    }

    // ログインユーザーが管理できる店舗に紐づくアカウントを取得
    const managableAccounts = await account.getManagableAccounts();

    // ログインユーザーが更新可能なアカウントでない場合はエラー
    if (!managableAccounts.find((each) => each.id === targetAccountId)) {
      throw new ApiError({
        status: 401,
        messageText: 'アカウントの更新権限がありません',
      });
    }

    //group_idを指定している場合、それが自分が管理できる権限なのか確認
    if (group_id) {
      const thisAccountGroup = await API.db.account_Group.findUnique({
        where: {
          ...(await account.getManagableAccountGroupQuery()),
          id: group_id,
        },
      });

      if (!thisAccountGroup)
        throw new ApiError({
          status: 401,
          messageText: 'アカウントの更新権限がありません',
        });
    }

    //storesを指定している場合、それが自分の管理できるストアなのか確認
    if (stores) {
      const managableStores = await account.getManagableStores();
      if (!stores.every((s) => managableStores.includes(s.store_id)))
        throw new ApiError({
          status: 401,
          messageText: 'アカウントの更新権限がありません',
        });
    }

    // 現在のパスワードを検証
    BackendApiAuthService.passwordVerify({
      password: current_password,
      hashed_password: loginAccount.hashed_password,
      salt: loginAccount.salt || '',
    });

    // パスワードの更新
    const { hash, salt } = new_password
      ? CustomCrypto.generateHash(new_password)
      : { hash: undefined, salt: undefined };

    // アカウント情報を更新
    const updateRes = await API.db.account.update({
      where: {
        id: targetAccountId,
      },
      data: {
        email,
        display_name,
        hashed_password: hash,
        salt,
        nick_name,
        group_id,
        code: regenerateCode //コードを更新したい時
          ? await account.generateStaffCode()
          : undefined,
        ...(stores
          ? {
              stores: {
                deleteMany: {},
                create: stores,
              },
            }
          : null),
      },
      select: {
        id: true,
        code: true,
      },
    });
    return API.status(200).response({ data: updateRes });
  },
);

// アカウントの論理削除を行うAPI
export const DELETE = BackendAPI.create(
  deleteAccountApi,
  async (API, { params }) => {
    // 法人情報を取得
    const corporation = API.resources.corporation;

    // 法人情報が見つからない場合はエラー
    if (!corporation) {
      throw new ApiError({
        status: 404,
        messageText: '法人情報が見つかりません',
      });
    }

    const account = new BackendApiAccountService(API);

    const managableAccounts = await account.getManagableAccounts();

    //削除対象のアカウントがあるかどうか
    if (!managableAccounts.find((e) => e.id == params.account_id))
      throw new ApiError(deleteAccountApi.error.invalidAccount);

    //無事あったら論理削除する

    await API.db.account.update({
      where: {
        id: params.account_id,
      },
      data: {
        deleted: true,
      },
    });
  },
);
