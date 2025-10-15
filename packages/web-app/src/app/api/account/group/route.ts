import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  createOrUpdateAccountGroupApi,
  getAccountGroupApi,
} from 'api-generator';
import {
  ApiPolicies,
  BackendApiAccountService,
} from '@/api/backendApi/services/account/main';

// アカウントグループ作成・更新API
export const POST = BackendAPI.create(
  createOrUpdateAccountGroupApi,
  async (API, { body }) => {
    const { id, display_name } = body;

    // 法人情報を取得
    const corporation = API.resources.corporation;

    // 法人情報が見つからない場合はエラー
    if (!corporation) {
      throw new ApiError({
        status: 404,
        messageText: '法人情報が見つかりません',
      });
    }

    //作成でも更新でも、ポリシーの内容が適切か確認する
    const accountModel = new BackendApiAccountService(API);
    const groupQuery = await accountModel.getManagableAccountGroupQuery();

    //自分では不可になっている権限を1つでも可にしてたらアウト
    let outPolicy: string | undefined;
    if (
      (outPolicy = Object.keys(groupQuery).find((p) => body[p as ApiPolicies]))
    )
      throw new ApiError({
        status: 401,
        messageText: `このアカウントでは ポリシー:${outPolicy} を許可する権限グループを作成することができません`,
      });

    // 更新の場合
    if (id) {
      const existingGroup = await API.db.account_Group.findUnique({
        where: {
          id,
          corporation_id: corporation.id,
        },
      });

      // アカウントグループが見つからない場合はエラー
      if (!existingGroup) {
        throw new ApiError({
          status: 404,
          messageText: '指定されたアカウントグループが見つかりません',
        });
      }

      // アカウントグループを更新
      return await API.db.account_Group.update({
        where: { id },
        data: {
          ...body,
          id: undefined,
        },
      });
    }

    // 新規作成の場合
    if (!display_name) {
      throw new ApiError({
        status: 400,
        messageText: '権限名は必須です',
      });
    }

    // アカウントグループを作成
    return await API.db.account_Group.create({
      data: {
        corporation_id: corporation.id,
        ...body,
        display_name: display_name!,
        id: undefined,
      },
    });
  },
);

// アカウントグループ取得API
export const GET = BackendAPI.create(
  getAccountGroupApi,
  async (API, { query }) => {
    // 法人情報を取得
    const corporation = API.resources.corporation;

    // 法人情報が見つからない場合はエラー
    if (!corporation) {
      throw new ApiError({
        status: 404,
        messageText: '法人情報が見つかりません',
      });
    }

    const accountModel = new BackendApiAccountService(API);

    // アカウントグループの取得
    const account_groups = await API.db.account_Group.findMany({
      where: {
        ...(await accountModel.getManagableAccountGroupQuery()),
        id: query.id,
        OR: [
          {
            corporation_id: corporation.id,
          },
          {
            corporation_id: null,
          },
        ],
      },
      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },
    });

    //特殊権限グループの個数だけ算出し直す
    await Promise.all(
      account_groups.map(async (group) => {
        if (!group.corporation_id) {
          const specialGroup = await API.db.account.count({
            where: {
              group_id: group.id,
              linked_corporation_id: corporation.id,
            },
          });
          group._count.accounts = specialGroup;
        }
      }),
    );

    // レスポンス形式に整形
    return {
      account_groups: account_groups.map((group) => ({
        ...group,
        _count: undefined,
        accountsCount: group._count.accounts,
      })),
    };
  },
);
