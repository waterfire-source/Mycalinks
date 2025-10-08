//鑑定を変更するAPI
//備考の変更と鑑定料の変更などのみ承る
//備考の変更はいつでもでき、鑑定料の変更は結果入力前のみ可能
// 鑑定を更新

import { BackendAPI } from '@/api/backendApi/main';
import { updateAppraisalApi } from 'api-generator';
import { ApiError } from '@/api/backendApi/error/apiError';

export const PUT = BackendAPI.create(
  updateAppraisalApi,
  async (API, { params, body }) => {
    const {
      description,
      shipping_fee,
      insurance_fee,
      handling_fee,
      other_fee,
    } = body;

    const thisAppraisal = await API.db.appraisal.findUnique({
      where: {
        id: params.appraisal_id,
        store_id: params.store_id,
        deleted: false,
      },
    });

    if (!thisAppraisal) throw new ApiError('notExist');

    //ステータスによって変わる
    if (thisAppraisal.finished) {
      //終わってるのに費用とか入力しようとしてたらエラー

      API.checkField(['description']);
    }

    const updateRes = await API.db.appraisal.update({
      where: {
        id: params.appraisal_id,
        store_id: params.store_id,
      },
      data: {
        description,
        shipping_fee,
        insurance_fee,
        handling_fee,
        other_fee,
      },
    });

    return updateRes;
  },
);
