import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';

import { getTransactionReceptionNumberCommandApi } from 'api-generator';

export const GET = BackendAPI.create(
  getTransactionReceptionNumberCommandApi,
  async (API, { params }) => {
    const { transaction_id } = params;

    //この取引を取得しつつ、買取受付番号などを発行
    const transactionModel = new BackendApiTransactionService(
      API,
      transaction_id,
    );

    const { receiptCommand, receiptCommandForStaff } =
      await transactionModel.printReceptionNumber();

    return {
      forCustomer: receiptCommand,
      forStaff: receiptCommandForStaff,
    };
  },
);
