import { BackendAPI } from '@/api/backendApi/main';
import { deleteAccountGroupApi } from 'api-generator';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

// アカウントグループ削除API
export const DELETE = BackendAPI.create(
  deleteAccountGroupApi,
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

    const accountModel = new BackendApiAccountService(API);

    // アカウントグループを取得
    const group = await API.db.account_Group.findUnique({
      where: {
        ...(await accountModel.getManagableAccountGroupQuery()),
        id: params.account_group_id,
        corporation_id: corporation?.id,
      },
      select: {
        id: true,
      },
    });

    // アカウントグループが見つからない場合はエラー
    if (!group) {
      throw new ApiError({
        status: 404,
        messageText: '指定されたアカウントグループが見つかりません',
      });
    }

    // グループに紐づいているアカウントを確認
    const linkedAccounts = await API.db.account.findFirstExists({
      where: {
        group_id: group.id,
      },
    });

    // 紐づいているアカウントが存在する場合はエラー
    if (linkedAccounts) {
      throw new ApiError({
        status: 400,
        messageText: 'アカウントが紐づいているため削除できません',
      });
    }

    // アカウントグループを削除
    await API.db.account_Group.delete({
      where: { id: params.account_group_id },
    });

    return;
  },
);
