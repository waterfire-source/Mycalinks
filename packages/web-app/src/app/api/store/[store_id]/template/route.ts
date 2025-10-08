// テンプレートを作成・更新・削除する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { TemplateKind } from '@prisma/client';
import { createTemplateApi, getTemplateApi } from 'api-generator';

export const POST = BackendAPI.create(
  createTemplateApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const { kind, display_name, url } = body;

    //kind=labelだった場合lbx形式かどうかを確認する
    switch (kind) {
      case TemplateKind.LABEL_PRINTER:
        if (!url || !url.endsWith('.lbx')) {
          throw new ApiError({
            status: 400,
            messageText:
              'ラベルプリンターのテンプレートのファイルはlbx形式である必要があります',
          });
        }
        break;
    }

    //作る
    const createRes = await API.db.template.create({
      data: {
        store_id,
        kind,
        display_name,
        url,
      },
    });

    return createRes;
  },
);

// テンプレートを取得する

export const GET = BackendAPI.create(
  getTemplateApi,
  async (API, { params, query }) => {
    const selectRes = await API.db.template.findMany({
      where: {
        store_id: params.store_id,
        kind: query.kind,
      },
    });

    return {
      templates: selectRes,
    };
  },
);
