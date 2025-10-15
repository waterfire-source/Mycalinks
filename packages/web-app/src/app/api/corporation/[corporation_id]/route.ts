import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { apiPrivilegesType } from '@/types/BackendAPI';
import { BackendCorporationAPI } from '@/app/api/corporation/api';

// 法人情報更新API
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], // 法人アカウントのみ許可
        policies: ['update_corporation'],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    // パラメータから更新対象の法人IDを取得
    const corporation = API.resources.corporation;

    if (!corporation) {
      throw new ApiError({
        status: 404,
        messageText: '法人情報が見つかりません',
      });
    }

    const {
      name,
      ceo_name,
      head_office_address,
      phone_number,
      kobutsusho_koan_iinkai,
      kobutsusho_number,
      invoice_number,
      zip_code,
      tax_mode,
      price_adjustment_round_rank,
      price_adjustment_round_rule,
      use_wholesale_price_order_column,
      use_wholesale_price_order_rule,
      wholesale_price_keep_rule,
    } = API.body as BackendCorporationAPI[0]['request']['body'];

    // 法人情報を更新
    const updatedCorporation = await API.db.corporation.update({
      where: {
        id: corporation.id,
      },
      data: {
        name,
        ceo_name,
        head_office_address,
        phone_number,
        kobutsusho_koan_iinkai,
        kobutsusho_number,
        tax_mode,
        price_adjustment_round_rank,
        price_adjustment_round_rule,
        use_wholesale_price_order_column,
        use_wholesale_price_order_rule,
        wholesale_price_keep_rule,
        invoice_number,
        zip_code,
      },
      select: {
        //[TODO] DAOりたい
        id: true,
        name: true,
        ceo_name: true,
        head_office_address: true,
        phone_number: true,
        kobutsusho_koan_iinkai: true,
        kobutsusho_number: true,
        invoice_number: true,
        zip_code: true,
        square_available: true,
        tax_mode: true,
        price_adjustment_round_rule: true,
        price_adjustment_round_rank: true,
        use_wholesale_price_order_column: true,
        use_wholesale_price_order_rule: true,
        wholesale_price_keep_rule: true,
      },
    });

    return API.status(200).response({
      data: {
        corporation: updatedCorporation,
      },
    });
  },
);
