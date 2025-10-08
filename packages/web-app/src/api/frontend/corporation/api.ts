import { CustomError } from '@/api/implement';
import { BackendCorporationAPI } from '@/app/api/corporation/api';
import { getCorporationDef } from '@/app/api/corporation/def';
import {
  OrderRule,
  RoundRule,
  TaxMode,
  WholesalePriceKeepRule,
  WholesalePriceOrderColumn,
} from '@prisma/client';

export interface CorporationAPI {
  getCorporation: {
    request: (typeof getCorporationDef)['request'];
    response: (typeof getCorporationDef)['response'] | CustomError;
  };
  updateCorporation: {
    request: {
      corporationId: number; // 法人ID
      name?: string; // 法人名
      ceoName?: string; // 代表者名
      headOfficeAddress?: string; // 本社住所
      zipCode?: string; // 郵便番号
      phoneNumber?: string; // 電話番号
      kobutsushoKoanIinkai?: string; // 古物商公安委員会名
      kobutsushoNumber?: string; // 古物商許可番号
      invoiceNumber?: string; // インボイス
    };
    response: BackendCorporationAPI[0]['response']['200'] | CustomError;
  };
  updateDefaultStoreSetting: {
    request: {
      corporationId: number; // 法人ID
      taxMode: TaxMode; // 税率(内税か外税か)
      priceAdjustmentRoundRule: RoundRule; // 端数処理(四捨五入、切り上げ、切り捨て)
      priceAdjustmentRoundRank: number; // 端数処理の桁数
      useWholesalePriceOrderColumn: WholesalePriceOrderColumn; // 仕入れ値の使い方のルールなど(値段、仕入れ日時)
      wholesalePriceKeepRule: WholesalePriceKeepRule; // 仕入れ値保持ルール(個別or平均値)
      useWholesalePriceOrderRule: OrderRule; // 仕入れ値の順番(OrderColumnにの順番をここで指定)のルール(降順、昇順)
    };
    response: BackendCorporationAPI[0]['response']['200'] | CustomError;
  };
}
