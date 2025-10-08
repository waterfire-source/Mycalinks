// メッセージセンターの既読

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { readEcMessageCenterApi } from 'api-generator';

export const POST = BackendAPI.create(readEcMessageCenterApi, async (API) => {
  const { message_id } = API.params;

  //このメッセージを取得する
  const thisMessageInfo = await API.db.ec_Message_Center.findUnique({
    where: {
      id: message_id,
      myca_user_id: API.mycaUser!.id,
    },
  });

  if (!thisMessageInfo) throw new ApiError('notExist');

  //既読にする
  const updateRes = await API.db.ec_Message_Center.update({
    where: {
      id: thisMessageInfo.id,
    },
    data: {
      read_at: new Date(),
    },
  });

  return updateRes;
});
