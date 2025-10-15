// テンプレートを削除

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteTemplateApi } from 'api-generator';

export const DELETE = BackendAPI.create(
  deleteTemplateApi,
  async (API, { params }) => {
    const { store_id, template_id } = params;

    // 存在確認
    const currentInfo = await API.db.template.findUnique({
      where: {
        id: template_id,
        store_id: store_id,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    // 物理削除（Templateモデルにはdeletedフィールドがないため）
    await API.db.template.delete({
      where: {
        id: template_id,
      },
    });
  },
);
