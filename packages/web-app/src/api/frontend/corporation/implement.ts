import { CorporationAPI } from '@/api/frontend/corporation/api';
import { customFetch, METHOD } from '@/api/implement';
import { BackendCorporationAPI } from '@/app/api/corporation/api';

export const corporationImplement = () => {
  return {
    getCorporation: async (): Promise<
      CorporationAPI['getCorporation']['response']
    > => {
      return await customFetch({
        method: METHOD.GET,
        url: '/api/corporation',
      })();
    },
    updateCorporation: async (
      request: CorporationAPI['updateCorporation']['request'],
    ): Promise<CorporationAPI['updateCorporation']['response']> => {
      const body: BackendCorporationAPI[0]['request']['body'] = {
        name: request.name,
        ceo_name: request.ceoName,
        head_office_address: request.headOfficeAddress,
        // バックエンドで追加されていない
        zip_code: request.zipCode,
        phone_number: request.phoneNumber,
        kobutsusho_koan_iinkai: request.kobutsushoKoanIinkai,
        kobutsusho_number: request.kobutsushoNumber,
        invoice_number: request.invoiceNumber,
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/corporation/${request.corporationId}`,
        body,
      })();
    },
    updateDefaultStoreSetting: async (
      request: CorporationAPI['updateDefaultStoreSetting']['request'],
    ): Promise<CorporationAPI['updateDefaultStoreSetting']['response']> => {
      const body: BackendCorporationAPI[0]['request']['body'] = {
        tax_mode: request.taxMode,
        price_adjustment_round_rule: request.priceAdjustmentRoundRule,
        price_adjustment_round_rank: request.priceAdjustmentRoundRank,
        use_wholesale_price_order_column: request.useWholesalePriceOrderColumn,
        wholesale_price_keep_rule: request.wholesalePriceKeepRule,
        use_wholesale_price_order_rule: request.useWholesalePriceOrderRule,
      };
      return await customFetch({
        method: METHOD.PUT,
        url: `/api/corporation/${request.corporationId}`,
        body,
      })();
    },
  };
};
