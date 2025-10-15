import {
  Store,
  Transaction,
  $Enums,
  TransactionKind,
  TransactionPaymentMethod,
} from '@prisma/client';

import { CustomError } from '@/api/implement';
import {
  BackendTransactionAPI,
  getPurchaseFormUrlDef,
  putTransactionDef,
} from '@/app/api/store/[store_id]/transaction/api';
import { getAddablePointDef } from '@/app/api/store/[store_id]/customer/api';

export interface TransactionAPI {
  create: {
    request: {
      store_id: number;
      staff_account_id?: number;
      customer_id?: number;
      register_id?: number;
      transaction_kind: string;
      total_price: number;
      subtotal_price: number | null;
      tax: number | null;
      discount_price: number;
      point_discount_price?: number;
      payment_method: string | null;
      recieved_price: number | null;
      reservation_reception_id?: number | null;
      change_price: number | null;
      asDraft?: boolean;
      buy__is_assessed?: boolean;
      id: number | null; // 下書きが存在する場合は既存の取引履歴をupdate
      id_kind?: string | null;
      id_number?: string | null;
      parental_consent_image_url?: string | null;
      description?: string | null;
      parental_contact?: string | null;
      carts: {
        product_id: number;
        item_count: number;
        unit_price: number;
        discount_price: number;
        reservation_price?: number;
        original_unit_price: number | null;
        sale_id?: number | null;
        sale_discount_price?: number;
        dont_adjust_stock_number?: boolean;
        reservation_reception_product_id_for_deposit?: number | null;
        reservation_reception_product_id_for_receive?: number | null;
      }[];
      set_deals?: {
        set_deal_id: number;
        apply_count: number;
        total_discount_price: number;
      }[];
      disableGivePoint?: boolean; //ポイント付与を無効にする
    };
    response:
      | {
          id: number;
          reception_number: number | null;
          purchaseReceptionNumberReceiptCommand?: string;
          purchaseReceptionNumberForStaffReceiptCommand?: string;
          status: $Enums.TransactionStatus | null;
          autoPrintReceiptEnabled: boolean;
        }
      | CustomError;
  };
  getTransactionDetails: {
    request: {
      store_id: Store['id'];
      transaction_id: Transaction['id'];
    };
    response: BackendTransactionAPI[5]['response']['200'] | CustomError;
  };
  //取引履歴 一覧取得
  listTransactions: {
    request: {
      store_id: Store['id'];
      id?: Transaction['id'];
      customer_id?: Transaction['customer_id'];
      staff_account_id?: Transaction['staff_account_id'];
      register_id?: Transaction['register_id'];
      transaction_kind?: Transaction['transaction_kind'];
      payment_method?: Transaction['payment_method'];
      status?: Transaction['status'];
      includeSales?: true;
      today?: true;
      buy__is_assessed?: boolean;
      includeCustomerCarts?: boolean;
      includeReceptionNumber?: boolean;
      finishedAtStart?: Date; //期間指定の開始日時（取引完了日時）
      finishedAtEnd?: Date; //期間指定の終了日時（取引完了日時）
      createdAtStart?: Date; //期間指定の開始日時（受付開始日時）
      createdAtEnd?: Date; //期間指定の終了日時（受付開始日時
      listTransactions?: boolean;
      productName?: string;
      includeStats?: boolean;
      includeSummary?: boolean;
      skip?: number;
      take?: number;
    };
    response: BackendTransactionAPI[5]['response']['200'] | CustomError;
  };
  processReturn: {
    request: {
      store_id: Store['id'];
      transaction_id: Transaction['id'];
      body: BackendTransactionAPI[1]['request']['body'];
    };
    response: BackendTransactionAPI[1]['response']['201'] | CustomError;
  };
  // 一時保留されている販売の一覧を取得
  listSellDraft: {
    request: {
      store_id: Store['id'];
    };
    response: BackendTransactionAPI[5]['response']['200'] | CustomError;
  };
  // 一時保留した販売の取引をキャンセル
  cancelSellDraft: {
    request: {
      store_id: Store['id'];
      transaction_id: Transaction['id'];
    };
    response: BackendTransactionAPI[4]['response']['200'] | CustomError;
  };
  // 一時保留されている買取の一覧を取得
  listPurchaseDraft: {
    request: {
      store_id: Store['id'];
    };
    response: BackendTransactionAPI[5]['response']['200'] | CustomError;
  };
  // 買取査定が完了して、署名ができるようにする
  canCreateSignature: {
    request: {
      storeId: number;
      transactionId: number;
    };
    response: putTransactionDef['response']['200'] | CustomError;
  };
  // 一時保存した取引をキャンセル
  cancelPurchaseDraft: {
    request: {
      store_id: Store['id'];
      transaction_id: Transaction['id'];
    };
    response: BackendTransactionAPI[4]['response']['200'] | CustomError;
  };
  //最低状況を一覧で取得するAPI（現在はゲスト用
  getAssessmentList: {
    request: {
      store_id: Store['id'];
      createdAtStart?: Date; //期間指定の開始日時（受付開始日時）
      createdAtEnd?: Date; //期間指定の終了日時（受付開始日時）
    };
    response: BackendTransactionAPI[6]['response']['200'] | CustomError;
  };

  // 銀行振込情報を更新
  putPayment: {
    request: {
      storeId: number;
      transactionId: number;
      payment: {
        bank__checked: boolean;
      };
    };
    response: putTransactionDef['response']['200'] | CustomError;
  };

  //レシートダウンロード
  getReceipt: {
    request: {
      params: BackendTransactionAPI[2]['request']['params'];
      query: BackendTransactionAPI[2]['request']['query'];
    };
    response: BackendTransactionAPI[2]['response']['200'] | CustomError;
  };

  //非会員フォームURL取得
  getPurchaseFormUrl: {
    request: {
      params: getPurchaseFormUrlDef['request']['params'];
      query: getPurchaseFormUrlDef['request']['query'];
    };
    response: getPurchaseFormUrlDef['response'][200] | CustomError;
  };

  // totalPriceとcustomer_idから付与可能ポイントを取得
  getAddablePoint: {
    request: {
      storeId: number;
      customerId: number;
      totalPrice: number;
      transactionKind: TransactionKind;
      paymentMethod: TransactionPaymentMethod;
    };
    response: getAddablePointDef['response'][200] | CustomError;
  };

  // 取引更新API
  putTransaction: {
    request: {
      storeId: number;
      transactionId: number; //更新する対象のID
      customerId: number;
      idKind?: string | null; //身分証の種類
      idNumber?: string | null; //身分証の番号
      parentalConsentImageUrl?: string | null; //保護者承諾書
      parentalContact?: string | null; //保護者の連絡先
    };
    response: putTransactionDef['response'][200] | CustomError;
  };
}
