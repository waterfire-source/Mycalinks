// 取引請求書発行

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';
import { getTransactionInvoiceApi } from 'api-generator';

export const GET = BackendAPI.create(
  getTransactionInvoiceApi,
  async (API, { params }) => {
    const transactionService = new BackendApiTransactionService(
      API,
      params.transaction_id,
    );

    const fileUrl = await transactionService.core.generateInvoice();

    return {
      fileUrl,
    };
  },
);
