import { BackendAllTransactionAPI } from '@/app/api/store/all/transaction/api';

type BaseTransaction = BackendAllTransactionAPI[1]['response'][200];

export type ModifiedTransactionCart =
  BaseTransaction['transaction_carts'][number] & {
    item_count?: number;
    max_item_count?: number;
  };

export type transactionInfoType = Omit<BaseTransaction, 'transaction_carts'> & {
  total_price?: number;
  transaction_carts: ModifiedTransactionCart[];
};

export interface NotifyInfo {
  purchaseReception: {
    id: number;
    receptionNumber: number;
    assessed: boolean;
    term_accepted_at: string;
    store_id: number;
    canCreateSignature: boolean;
  };
}
