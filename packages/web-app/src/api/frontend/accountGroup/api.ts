import { CustomError } from '@/api/implement';
import { getAccountGroup } from '@/app/api/account/def';
import { Account_Group } from '@prisma/client';

export interface AccountGroupAPI {
  listAllAccountGroups: {
    response: typeof getAccountGroup.response.account_groups | CustomError;
  };
  getAccountGroupById: {
    request: {
      id: number;
    };
    response: typeof getAccountGroup.response.account_groups | CustomError;
  };
  deleteAccountGroup: {
    request: {
      accountGroupId: number;
    };
    response: {
      ok: string;
    };
  };
  createAccountGroup: {
    request: {
      body: {
        display_name: string;
        create_account: boolean;
        update_corporation: boolean;
        admin_mode: boolean;
        update_store: boolean;
        sales_mode: boolean;
        update_store_setting: boolean;
        get_transaction_customer_info: boolean;
        set_transaction_manual_discount: boolean;
        create_transaction_return: boolean;
        create_buy_reception: boolean;
        assess_buy_transaction: boolean;
        finish_buy_transaction: boolean;
        set_buy_transaction_manual_product_price: boolean;
        list_item: boolean;
        list_product: boolean;
        list_inventory: boolean;
        list_stocking_supplier: boolean;
        list_stocking: boolean;
        list_cash_history: boolean;
        list_transaction: boolean;
        list_customer: boolean;
        get_stats: boolean;
      };
    };
    response: {
      Account_Group: Account_Group;
    };
  };
  updateAccountGroup: {
    request: {
      body: {
        id: number;
        display_name: string;
        create_account: boolean;
        update_corporation: boolean;
        admin_mode: boolean;
        update_store: boolean;
        sales_mode: boolean;
        update_store_setting: boolean;
        get_transaction_customer_info: boolean;
        set_transaction_manual_discount: boolean;
        create_transaction_return: boolean;
        create_buy_reception: boolean;
        assess_buy_transaction: boolean;
        finish_buy_transaction: boolean;
        set_buy_transaction_manual_product_price: boolean;
        list_item: boolean;
        list_product: boolean;
        list_inventory: boolean;
        list_stocking_supplier: boolean;
        list_stocking: boolean;
        list_cash_history: boolean;
        list_transaction: boolean;
        list_customer: boolean;
        get_stats: boolean;
      };
    };
    response: {
      Account_Group: Account_Group;
    };
  };
}

export interface AccountGroupApiRes {
  listAllAccountGroups: Exclude<
    AccountGroupAPI['listAllAccountGroups']['response'],
    CustomError
  >;
  getAccountGroupById: Exclude<
    AccountGroupAPI['getAccountGroupById']['response'],
    CustomError
  >;

  createAccountGroup: Exclude<
    AccountGroupAPI['createAccountGroup']['response'],
    CustomError
  >;
  updateAccountGroup: Exclude<
    AccountGroupAPI['updateAccountGroup']['response'],
    CustomError
  >;
  deleteAccountGroup: Exclude<
    AccountGroupAPI['deleteAccountGroup']['response'],
    CustomError
  >;
}
