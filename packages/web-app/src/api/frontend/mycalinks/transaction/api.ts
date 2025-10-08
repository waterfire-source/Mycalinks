import { CustomError } from '@/api/implement';
import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';
import { TransactionKind, TransactionStatus } from '@prisma/client';
export interface MycalinksTransactionAPI {
  getAll: {
    request: {
      status?: TransactionStatus;
      transactionKind?: TransactionKind;
      storeId?: number; //店舗IDで絞り込み}
    };
    response: BackendAllTransactionAPI[0]['response'][200] | CustomError;
  };
  //取引の詳細情報を取得する
  getPosTransactionDetail: {
    request: {
      transactionId: number;
    };
    response: BackendAllTransactionAPI[1]['response'][200] | CustomError;
  };
  //数量変更をPOSに送信する
  putPosTransactionCustomerCart: {
    request: {
      transactionId: number;
      carts: {
        product_id: number;
        unit_price: number;
        discount_price: number | null;
        item_count: number;
      }[];
    };
    response: BackendAllTransactionAPI[2]['response'][200] | CustomError;
  };
  //署名記録API
  putPosTransaction: {
    request: {
      transactionId: number;
      signatureImageUrl?: string | null;
      termAcceptedAt?: Date | null;
    };
    response: BackendAllTransactionAPI[3]['response'][200] | CustomError;
  };
}
