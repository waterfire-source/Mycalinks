import { CustomError } from '@/api/implement';
import {
  changeRegisterCashDef,
  createRegisterDef,
  registerSettlementDef,
  listRegisterSettlementDef,
  getRegisterTodaySummaryDef,
} from '@/app/api/store/[store_id]/register/def';
import {
  Register,
  RegisterSettlementKind,
  RegisterStatus,
  TransactionPaymentMethod,
} from '@prisma/client';

export interface DrawerContent {
  denomination: number;
  item_count: number;
}

export interface RegisterAPI {
  listRegister: {
    request: {
      storeID: number;
      inUse?: boolean;
      me?: boolean;
    };
    response:
      | {
          registers: Register[];
        }
      | CustomError;
  };
  listCashRegister: {
    request: {
      storeID: number;
      inUse?: boolean;
    };
    response:
      | {
          registers: Register[];
        }
      | CustomError;
  };
  createRegister: {
    request: {
      storeId: number;
      displayName: string;
      cashResetPrice?: number;
      sellPaymentMethod: TransactionPaymentMethod[];
      buyPaymentMethod: TransactionPaymentMethod[];
      autoPrintReceiptEnabled?: boolean;
    };
    response: typeof createRegisterDef.response | CustomError;
  };
  updateRegister: {
    request: {
      id: number;
      storeId: number;
      displayName: string;
      cashResetPrice?: number;
      sellPaymentMethod: TransactionPaymentMethod[];
      buyPaymentMethod: TransactionPaymentMethod[];
      status?: RegisterStatus;
      autoPrintReceiptEnabled?: boolean;
    };
    response: typeof createRegisterDef.response | CustomError;
  };
  deleteRegister: {
    request: {
      storeID: number;
      registerID: number;
    };
    response: { ok: string } | CustomError;
  };
  openRegister: {
    request: {
      id: number;
      storeId: number;
    };
    response: typeof createRegisterDef.response | CustomError;
  };
  closeRegister: {
    request: {
      id: number;
      storeId: number;
    };
    response: typeof createRegisterDef.response | CustomError;
  };
  registerSettlement: {
    request: {
      storeId: number;
      registerId: number;
      actualCashPrice: number;
      kind: RegisterSettlementKind;
      drawerContents: DrawerContent[];
    };
    response: typeof registerSettlementDef.response | CustomError;
  };
  listRegisterSettlement: {
    request: {
      storeId: number;
      kind?: RegisterSettlementKind;
      register_id?: number;
      today?: boolean;
      take?: number;
      skip?: number;
    };
    response: typeof listRegisterSettlementDef.response | CustomError;
  };
  changeRegisterCash: {
    request: {
      storeID: number;
      registerID: number;
    } & typeof changeRegisterCashDef.request.body;
    response: typeof changeRegisterCashDef.response | CustomError;
  };
  getRegisterTodaySummary: {
    request: {
      storeId: number;
      registerId: number;
    };
    response: typeof getRegisterTodaySummaryDef.response | CustomError;
  };
}

export interface RegisterAPIRes {
  createRegister: {
    response: Exclude<RegisterAPI['createRegister']['response'], CustomError>;
  };
  updateRegister: {
    response: Exclude<RegisterAPI['updateRegister']['response'], CustomError>;
  };
  openRegister: {
    response: Exclude<RegisterAPI['openRegister']['response'], CustomError>;
  };
  closeRegister: {
    response: Exclude<RegisterAPI['closeRegister']['response'], CustomError>;
  };
  registerSettlement: {
    response: Exclude<
      RegisterAPI['registerSettlement']['response'],
      CustomError
    >;
  };
  listRegisterSettlement: Exclude<
    RegisterAPI['listRegisterSettlement']['response'],
    CustomError
  >;
  changeRegisterCash: {
    response: Exclude<
      RegisterAPI['changeRegisterCash']['response'],
      CustomError
    >;
  };
  getRegisterTodaySummary: {
    response: Exclude<
      RegisterAPI['getRegisterTodaySummary']['response'],
      CustomError
    >;
  };
}
