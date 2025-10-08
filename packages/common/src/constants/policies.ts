export const apiPolicies = {
  create_account: {
    key: 'create_account',
    label: 'アカウント作成',
    domain: '管理',
  },
  update_corporation: {
    key: 'update_corporation',
    label: '本部アカウント編集',
    domain: '管理',
  },
  admin_mode: {
    key: 'admin_mode',
    label: '管理モードとしてPOSを起動',
    domain: '管理',
  },
  update_store: {
    key: 'update_store',
    label: '店舗編集',
    domain: '管理',
  },
  sales_mode: {
    key: 'sales_mode',
    label: '店舗営業モードとしてPOSを起動',
    domain: '管理',
  },
  update_store_setting: {
    key: 'update_store_setting',
    label: '店舗設定を編集',
    domain: '管理',
  },
  get_transaction_customer_info: {
    key: 'get_transaction_customer_info',
    label: '会員情報の表示',
    domain: '販売',
  },
  set_transaction_manual_discount: {
    key: 'set_transaction_manual_discount',
    label: '手動での値引き',
    domain: '販売',
  },
  create_transaction_return: {
    key: 'create_transaction_return',
    label: '返品',
    domain: '販売',
  },
  create_buy_reception: {
    key: 'create_buy_reception',
    label: '買取受付',
    domain: '買取受付',
  },
  assess_buy_transaction: {
    key: 'assess_buy_transaction',
    label: '査定',
    domain: '買取受付',
  },
  finish_buy_transaction: {
    key: 'finish_buy_transaction',
    label: '清算',
    domain: '買取受付',
  },
  set_buy_transaction_manual_product_price: {
    key: 'set_buy_transaction_manual_product_price',
    label: '手動金額設定',
    domain: '買取受付',
  },
  list_item: {
    key: 'list_item',
    label: '商品一覧',
    domain: '商品',
  },
  list_original_pack: {
    key: 'list_original_pack',
    label: 'オリパ一覧',
    domain: '商品',
  },
  list_product: {
    key: 'list_product',
    label: '在庫一覧',
    domain: '在庫',
  },
  list_inventory: {
    key: 'list_inventory',
    label: '棚卸一覧',
    domain: '棚卸',
  },
  list_stocking_supplier: {
    key: 'list_stocking_supplier',
    label: '仕入れ先一覧',
    domain: '仕入れ先',
  },
  list_stocking: {
    key: 'list_stocking',
    label: '発注管理',
    domain: '発注',
  },
  list_cash_history: {
    key: 'list_cash_history',
    label: '入出金閲覧',
    domain: '入出金',
  },
  list_transaction: {
    key: 'list_transaction',
    label: '取引履歴閲覧',
    domain: '取引',
  },
  list_customer: {
    key: 'list_customer',
    label: '顧客管理の閲覧',
    domain: '顧客管理',
  },
  get_stats: {
    key: 'get_stats',
    label: '売り上げ分析の閲覧',
    domain: '売上分析',
  },
  list_purchase_table: {
    key: 'list_purchase_table',
    label: '買取表の閲覧',
    domain: '買取表',
  },
};
