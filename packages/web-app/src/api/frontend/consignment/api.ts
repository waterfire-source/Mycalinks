import { CustomError } from '@/api/implement';
import {
  createOrUpdateConsignmentClientApi,
  getConsignmentClientApi,
  deleteConsignmentClientApi,
  stockConsignmentClientProductApi,
} from 'api-generator';

export interface ConsignmentAPI {
  // 委託主の作成・更新
  createOrUpdateConsignmentClient: {
    request: {
      storeID: number;
      id?: number;
      full_name?: string;
      zip_code?: string;
      prefecture?: string;
      city?: string;
      address2?: string;
      building?: string;
      phone_number?: string;
      fax_number?: string;
      email?: string;
      commission_cash_price?: number;
      commission_card_price?: number;
      commission_payment_method?: string;
      payment_cycle?: string;
      description?: string;
      enabled?: boolean;
    };
    response: typeof createOrUpdateConsignmentClientApi.response | CustomError;
  };

  // 委託主の取得
  getConsignmentClient: {
    request: {
      storeID: number;
      enabled?: boolean;
      includesSummary?: boolean;
      limit?: number;
      offset?: number;
    };
    response: typeof getConsignmentClientApi.response | CustomError;
  };

  // 委託主の削除
  deleteConsignmentClient: {
    request: {
      storeID: number;
      consignmentClientID: number;
    };
    response: typeof deleteConsignmentClientApi.response | CustomError;
  };

  // 委託在庫補充
  stockConsignmentClientProduct: {
    request: {
      storeID: number;
      consignmentClientID: number;
      products: Array<{
        product_id: number;
        item_count: number;
      }>;
    };
    response: typeof stockConsignmentClientProductApi.response | CustomError;
  };
}

export interface ConsignmentAPIRes {
  getConsignmentClient: Exclude<
    ConsignmentAPI['getConsignmentClient']['response'],
    CustomError
  >;
}
