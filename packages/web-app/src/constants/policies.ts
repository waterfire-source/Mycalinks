import { PATH } from '@/constants/paths';
import { apiPolicies } from 'common';

export enum PolicyKind {
  // 実行権限
  FEATURE = 'feature',
  // ページ閲覧権限
  PAGE_READ = 'page_read',
  // 読み込み権限
  READ = 'read',
  // 編集権限
  EDIT = 'edit',
  // 削除権限
  DELETE = 'delete',
  // 作成権限
  CREATE = 'create',
}

export interface Policy {
  key: keyof typeof apiPolicies;
  label: string;
  domain: string;
  kind: PolicyKind;
  path?: string;
}

const basePolicies = apiPolicies;

//ポリシーの定義

const frontDef = {
  create_account: {
    kind: PolicyKind.FEATURE,
  },
  update_corporation: {
    kind: PolicyKind.EDIT,
  },
  admin_mode: {
    kind: PolicyKind.FEATURE,
  },
  update_store: {
    kind: PolicyKind.EDIT,
  },
  sales_mode: {
    kind: PolicyKind.FEATURE,
  },
  update_store_setting: {
    kind: PolicyKind.EDIT,
  },
  get_transaction_customer_info: {
    kind: PolicyKind.READ,
  },
  set_transaction_manual_discount: {
    kind: PolicyKind.FEATURE,
  },
  create_transaction_return: {
    kind: PolicyKind.CREATE,
  },
  create_buy_reception: {
    kind: PolicyKind.CREATE,
  },
  assess_buy_transaction: {
    kind: PolicyKind.FEATURE,
  },
  finish_buy_transaction: {
    kind: PolicyKind.FEATURE,
  },
  set_buy_transaction_manual_product_price: {
    kind: PolicyKind.FEATURE,
  },
  list_item: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.ITEM.root,
  },
  list_product: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.STOCK.root,
  },
  list_inventory: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.INVENTORY_COUNT.root,
  },
  list_stocking_supplier: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.SUPPLIER.root,
  },
  list_stocking: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.ARRIVAL.root,
  },
  list_original_pack: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.ORIGINAL_PACK.root,
  },
  list_purchase_table: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.PURCHASE_TABLE.root,
  },
  list_cash_history: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.CASH,
  },
  list_transaction: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.TRANSACTION,
  },
  list_customer: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.CUSTOMERS.root,
  },
  get_stats: {
    kind: PolicyKind.PAGE_READ,
    path: PATH.SALES_ANALYTICS.root,
  },
} as const;

const mergedPolicies = structuredClone(basePolicies);

Object.keys(frontDef).forEach((key) => {
  const prop = key as keyof typeof frontDef;
  mergedPolicies[prop] = {
    ...mergedPolicies[prop],
    ...frontDef[prop],
  };
});

export const policies = mergedPolicies as Record<
  keyof typeof basePolicies,
  Policy
>;
