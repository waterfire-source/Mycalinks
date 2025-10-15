import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Item, ItemStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';

//店基本情報の更新
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef); //左にcheckField統合する？

    //許可されているフィールド ここで今後ロールとかを使って制限したい
    const allowedField = [
      'display_name',
      'display_name_ruby',
      'allowed_point',
      'sell_price',
      'buy_price',
      'rarity',
      'pack_name',
      'description',
      'image_url',
      'expansion',
      'order_number',
      'cardnumber',
      'keyword',
      'is_buy_only',
      'readonly_product_code',
      'janAsProductCode',
      'allow_round',
      'hide',
      'delete',
      'allow_auto_print_label',
      'infinite_stock',
      'tablet_allowed',
      'release_date',
      'box_pack_count',
    ];

    //確認する
    API.checkField(allowedField);

    const { item_id: id } = API.params;

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    let result: Item | null = null;

    //hideが指定されていた場合、status = hidden or status = published にする
    if ('hide' in API.body) {
      API.body.status = API.body.hide ? ItemStatus.HIDDEN : ItemStatus.PUBLISH;
      delete API.body.hide;
    }

    if ('delete' in API.body) {
      API.body.status = ItemStatus.DELETED;
      delete API.body.delete;
    }

    await API.transaction(async () => {
      const thisItem = new BackendApiItemService(API, id);
      result = await thisItem.core.update(API.body);
    });

    return API.status(200).response({ data: result });
  },
);
