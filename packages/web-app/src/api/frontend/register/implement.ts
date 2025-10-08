import { RegisterAPI } from '@/api/frontend/register/api';
import { customFetch } from '@/api/implement';
import { METHOD } from '@/api/implement';
import {
  changeRegisterCashDef,
  createRegisterDef,
  registerSettlementDef,
  listRegisterSettlementDef,
} from '@/app/api/store/[store_id]/register/def';
import { RegisterStatus } from '@prisma/client';

export const registerImplement = () => {
  return {
    // レジ作成
    createRegister: async (
      request: RegisterAPI['createRegister']['request'],
    ) => {
      const body: typeof createRegisterDef.request.body = {
        id: undefined,
        display_name: request.displayName,
        cash_reset_price: request.cashResetPrice,
        // バックエンドではStringの配列として格納しているのでjoinする
        sell_payment_method: request.sellPaymentMethod.join(','),
        buy_payment_method: request.buyPaymentMethod.join(','),
        status: undefined,
        auto_print_receipt_enabled: request.autoPrintReceiptEnabled,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/register`,
        body,
      })();
    },
    // レジ更新
    updateRegister: async (
      request: RegisterAPI['updateRegister']['request'],
    ) => {
      const body: typeof createRegisterDef.request.body = {
        id: request.id,
        display_name: request.displayName,
        cash_reset_price: request.cashResetPrice,
        sell_payment_method: request.sellPaymentMethod.join(','),
        buy_payment_method: request.buyPaymentMethod.join(','),
        status: request.status,
        auto_print_receipt_enabled: request.autoPrintReceiptEnabled,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/register`,
        body,
      })();
    },
    // レジ削除
    deleteRegister: async (
      request: RegisterAPI['deleteRegister']['request'],
    ) => {
      return await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeID}/register/${request.registerID}`,
      })();
    },
    // レジ開店
    openRegister: async (request: RegisterAPI['openRegister']['request']) => {
      const body: typeof createRegisterDef.request.body = {
        id: request.id,
        display_name: undefined,
        cash_reset_price: undefined,
        sell_payment_method: undefined,
        buy_payment_method: undefined,
        status: RegisterStatus.OPEN,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/register`,
        body,
      })();
    },
    // レジ閉店
    closeRegister: async (request: RegisterAPI['closeRegister']['request']) => {
      const body: typeof createRegisterDef.request.body = {
        id: request.id,
        display_name: undefined,
        cash_reset_price: undefined,
        sell_payment_method: undefined,
        buy_payment_method: undefined,
        status: RegisterStatus.CLOSED,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/register`,
        body,
      })();
    },
    // レジ精算API
    registerSettlement: async (
      request: RegisterAPI['registerSettlement']['request'],
    ): Promise<RegisterAPI['registerSettlement']['response']> => {
      const body: typeof registerSettlementDef.request.body = {
        actual_cash_price: request.actualCashPrice,
        kind: request.kind,
        drawerContents: request.drawerContents,
      };
      return await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/register/${request.registerId}/settlement`,
        body,
      })();
    },
    // レジ精算リスト取得API
    listRegisterSettlement: async (
      request: RegisterAPI['listRegisterSettlement']['request'],
    ): Promise<RegisterAPI['listRegisterSettlement']['response']> => {
      const query: typeof listRegisterSettlementDef.request.query = {
        kind: request.kind,
        register_id: request.register_id,
        today: request.today,
        take: request.take,
        skip: request.skip,
      };

      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/register/settlement`,
        params: query,
      })();
    },
    changeRegisterCash: async (
      request: RegisterAPI['changeRegisterCash']['request'],
    ): Promise<RegisterAPI['changeRegisterCash']['response']> => {
      const url = `/api/store/${request.storeID}/register/${request.registerID}/cash`;
      const body: typeof changeRegisterCashDef.request.body = {
        changeAmount: request.changeAmount,
        reason: request.reason,
        toAmount: request.toAmount,
        kind: request.kind,
      };
      return await customFetch({
        method: METHOD.PUT,
        url,
        body,
      })();
    }, //レジ設定画面で使用するAPI
    listCashRegister: async (
      request: RegisterAPI['listCashRegister']['request'],
    ): Promise<RegisterAPI['listCashRegister']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/register`,
        params: {
          inUse: request.inUse,
        },
      })();
    },
    // レジ一覧を取得するAPI（上記の修正をしたかったが影響がおおきそうなので新しく作成）
    listRegister: async (
      request: RegisterAPI['listRegister']['request'],
    ): Promise<RegisterAPI['listRegister']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeID}/register`,
        params: {
          inUse: request.inUse,
          me: request.me,
        },
      })();
    },
    // レジの当日まとめ情報の取得API
    getRegisterTodaySummary: async (
      request: RegisterAPI['getRegisterTodaySummary']['request'],
    ): Promise<RegisterAPI['getRegisterTodaySummary']['response']> => {
      return await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/register/${request.registerId}/today-summary`,
      })();
    },
  };
};
