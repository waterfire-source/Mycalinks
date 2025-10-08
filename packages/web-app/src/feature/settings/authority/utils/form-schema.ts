import { FieldNameMap } from '@/contexts/FormErrorContext';
import { z } from 'zod';

export const AUTHORITY_FIELD_NAME_MAP: FieldNameMap = {
  display_name: '権限名',
};

//キャメルケースに修正

export const AuthorityFormObject = z.object({
  display_name: z.string().min(1, { message: '権限名を入力してください' }),
  create_account: z.boolean(), //アカウント作成ができるかどうか
  update_corporation: z.boolean(), //法人情報自体を更新できるか
  admin_mode: z.boolean(), //管理モードとして起動できるか
  update_store: z.boolean(), //店舗自体の編集
  sales_mode: z.boolean(), //営業モードとして起動できるか
  update_store_setting: z.boolean(), //店舗設定

  //販売
  get_transaction_customer_info: z.boolean(), //会員情報の表示
  set_transaction_manual_discount: z.boolean(), //手動での値引き
  create_transaction_return: z.boolean(), //返品 ※APIレベル

  //買取
  create_buy_reception: z.boolean(), //買取受付
  assess_buy_transaction: z.boolean(), //査定
  finish_buy_transaction: z.boolean(), //買取精算
  set_buy_transaction_manual_product_price: z.boolean(), //手動金額設定

  //商品
  list_item: z.boolean(), //商品一覧

  //在庫
  list_product: z.boolean(), //在庫一覧

  //オリパ
  list_original_pack: z.boolean(), //オリパ一覧

  //買取表
  list_purchase_table: z.boolean(), //買取表一覧

  //棚卸
  list_inventory: z.boolean(), //棚卸の閲覧

  //仕入れ先
  list_stocking_supplier: z.boolean(), //仕入れ先一覧

  //入荷
  list_stocking: z.boolean(), //入荷一覧

  //入出金
  list_cash_history: z.boolean(), //入出金履歴

  //取引履歴
  list_transaction: z.boolean(), //取引履歴一覧

  //顧客管理
  list_customer: z.boolean(), //顧客一覧

  //売上分析
  get_stats: z.boolean(), //売上分析
});

export type AuthorityFormSchema = z.infer<typeof AuthorityFormObject>;
