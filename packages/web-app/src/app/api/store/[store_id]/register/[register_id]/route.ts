import { BackendAPI } from '@/api/backendApi/main';
import { deleteRegisterDef } from '@/app/api/store/[store_id]/register/def';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
//レジの削除
export const DELETE = BackendAPI.defineApi(
  deleteRegisterDef,
  async (API, { params }) => {
    //レジを論理削除するだけ
    const thisRegister = new BackendApiRegisterService(
      API,
      API.params.register_id,
    );
    const currentInfo = await thisRegister.core.existingObj;

    //primaryレジは消せない
    if (currentInfo.is_primary)
      throw new ApiError({
        status: 400,
        messageText: 'メインレジは削除することができません',
      });

    await API.db.register.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        deleted: true,
      },
    });
  },
);
