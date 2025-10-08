import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Product } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { deleteProductApi } from 'api-generator';

//販売/買取商品情報の更新
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
      'specific_sell_price',
      'specific_buy_price',
      'retail_price',
      'allowed_point', //ポイントを許可するかどうか
      'display_name',
      'image_url',
      'description',
      // 'staff_account_id',
      'needBundleAdjust', //バンドル商品用に結びついている商品の在庫数も変動させる必要があるかどうか
      'readonly_product_code',
      'disable_ec_auto_stocking',
      'mycalinks_ec_enabled',
      'ochanoko_ec_enabled',
      'shopify_ec_enabled',
      'pos_reserved_stock_number',
      'specific_ec_sell_price',
      'ecPublishStockNumber', //一旦使わない
      // 'ec_stock_number',
      'tablet_allowed',
      'arrow_auto_price_adjustment', //廃止
      'allow_buy_price_auto_adjustment',
      'allow_sell_price_auto_adjustment',
      'management_number',
    ];

    //確認する
    API.checkField(allowedField);

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    const { product_id: id } = API.params;

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    let result: {
      updateResult: Product;
      productsToPrint: Array<{
        id: Product['id'];
        stock_number: Product['stock_number'];
      }>;
    } | null = null;

    const productService = new BackendApiProductService(API, Number(id));

    const txResult = await API.transaction(async (tx) => {
      delete API.body?.needBundleAdjust;
      delete API.body?.staff_account_id;

      const body = API.body as BackendProductAPI[2]['request']['body'];

      const { updateResult } = await productService.core.update({
        data: body,
      });

      result = {
        updateResult,
        productsToPrint: [],
      };
    });

    return API.status(200).response({ data: result });
  },
);

// 在庫の論理削除

export const DELETE = BackendAPI.create(
  deleteProductApi,
  async (API, { params }) => {
    const productService = new BackendApiProductService(API, params.product_id);
    await productService.core.delete({});
  },
);
