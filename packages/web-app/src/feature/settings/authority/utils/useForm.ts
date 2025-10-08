import {
  AUTHORITY_FIELD_NAME_MAP,
  AuthorityFormObject,
  AuthorityFormSchema,
} from '@/feature/settings/authority/utils/form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account_Group } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
import { useEffect, useState } from 'react';
import { formatErrorMessages } from '@/contexts/FormErrorContext';

const clientAPI = createClientAPI();

export const useAuthorityForm = (
  existingAccountGroups: AccountGroupType[],
  accountGroup: AccountGroupType | null,
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>,
  onClose: () => void,
) => {
  const { setAlertState } = useAlert();

  const methods = useForm<AuthorityFormSchema>({
    defaultValues: generateDefaultValues(accountGroup),
    resolver: zodResolver(AuthorityFormObject),
  });

  const { reset } = methods;

  const handleClose = () => {
    onClose();
    if (accountGroup) {
      reset(generateDefaultValues(accountGroup));
    } else {
      reset();
    }
  };

  useEffect(() => {
    reset(generateDefaultValues(accountGroup));
  }, [accountGroup, reset]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleSubmit } = methods;
  const onSubmit = handleSubmit(async (data: AuthorityFormSchema) => {
    try {
      setIsLoading(true);

      const isDuplicate = existingAccountGroups.some(
        (group) =>
          group.display_name === data.display_name &&
          group.id !== accountGroup?.id,
      );

      if (isDuplicate) {
        setAlertState({
          message: formatErrorMessages(
            [
              {
                field: 'displayName',
                message: '既に使われている権限名です。',
              },
            ],
            AUTHORITY_FIELD_NAME_MAP,
          ),
          severity: 'error',
        });
        return;
      }
      if (accountGroup) {
        await clientAPI.accountGroup.updateAccountGroup({
          body: {
            id: accountGroup.id,
            ...data,
          },
        });
      } else {
        await clientAPI.accountGroup.createAccountGroup({
          body: {
            ...data,
          },
        });
      }
      setCanRefetch(true);
      setAlertState({
        message: `登録に成功しました。`,
        severity: 'success',
      });
      handleClose();
    } catch (error) {
      if (error instanceof CustomError) {
        console.error('error', error);
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  });

  return { methods, onSubmit, isLoading, handleClose };
};

export type AuthorityItem = {
  id: string;
  screen: string;
  action: string;
};

export const authorityItems: AuthorityItem[] = [
  {
    id: 'create_account',
    screen: '管理',
    action: 'アカウントが作成できるかどうか',
  },
  {
    id: 'update_corporation',
    screen: '管理',
    action: '法人情報自体を更新できるか',
  },
  { id: 'admin_mode', screen: '管理', action: '管理モードとして起動できるか' },
  { id: 'update_store', screen: '管理', action: '店舗自体の編集' },
  { id: 'sales_mode', screen: '管理', action: '営業モードとして起動できるか' },
  { id: 'update_store_setting', screen: '管理', action: '店舗設定' },
  {
    id: 'get_transaction_customer_info',
    screen: '販売画面',
    action: '会員情報の表示',
  },
  {
    id: 'set_transaction_manual_discount',
    screen: '販売画面',
    action: '手動での値引き',
  },
  { id: 'create_transaction_return', screen: '販売画面', action: '返品' },
  { id: 'create_buy_reception', screen: '買取画面', action: '買取受付' },
  { id: 'assess_buy_transaction', screen: '買取画面', action: '査定' },
  { id: 'finish_buy_transaction', screen: '買取画面', action: '精算' },
  {
    id: 'set_buy_transaction_manual_product_price',
    screen: '買取画面',
    action: '手動金額設定',
  },
  { id: 'list_item', screen: '商品画面', action: '商品マスタ閲覧' },
  { id: 'list_product', screen: '在庫画面', action: '在庫一覧閲覧' },
  { id: 'list_original_pack', screen: 'オリパ・福袋', action: 'オリパ閲覧' },
  {
    id: 'list_purchase_table',
    screen: '買取表',
    action: '買取表閲覧',
  },
  { id: 'list_inventory', screen: '棚卸', action: '棚卸の閲覧' },
  { id: 'list_stocking_supplier', screen: '仕入れ先', action: '仕入れ先閲覧' },
  { id: 'list_stocking', screen: '入荷', action: '入荷閲覧' },
  { id: 'list_cash_history', screen: '入出金', action: '入出金閲覧' },
  { id: 'list_transaction', screen: '取引履歴', action: '取引履歴閲覧' },
  { id: 'list_customer', screen: '顧客管理', action: '顧客閲覧' },
  { id: 'get_stats', screen: '売上分析', action: '売上分析閲覧' },
];

export const generateDefaultValues = (
  accountGroup: Account_Group | null,
): AuthorityFormSchema => {
  if (accountGroup) {
    return {
      display_name: accountGroup.display_name,
      create_account: accountGroup.create_account,
      update_corporation: accountGroup.update_corporation,
      admin_mode: accountGroup.admin_mode,
      update_store: accountGroup.update_store,
      sales_mode: accountGroup.sales_mode,
      update_store_setting: accountGroup.update_store_setting,
      get_transaction_customer_info: accountGroup.get_transaction_customer_info,
      set_transaction_manual_discount:
        accountGroup.set_transaction_manual_discount,
      create_transaction_return: accountGroup.create_transaction_return,
      create_buy_reception: accountGroup.create_buy_reception,
      assess_buy_transaction: accountGroup.assess_buy_transaction,
      finish_buy_transaction: accountGroup.finish_buy_transaction,
      set_buy_transaction_manual_product_price:
        accountGroup.set_buy_transaction_manual_product_price,
      list_item: accountGroup.list_item,
      list_product: accountGroup.list_product,
      list_inventory: accountGroup.list_inventory,
      list_stocking_supplier: accountGroup.list_stocking_supplier,
      list_stocking: accountGroup.list_stocking,
      list_cash_history: accountGroup.list_cash_history,
      list_transaction: accountGroup.list_transaction,
      list_customer: accountGroup.list_customer,
      get_stats: accountGroup.get_stats,
      list_original_pack: accountGroup.list_original_pack,
      list_purchase_table: accountGroup.list_purchase_table,
    };
  } else {
    return {
      display_name: '',
      create_account: false,
      update_corporation: false,
      admin_mode: false,
      update_store: false,
      sales_mode: false,
      update_store_setting: false,
      get_transaction_customer_info: false,
      set_transaction_manual_discount: false,
      create_transaction_return: false,
      create_buy_reception: false,
      assess_buy_transaction: false,
      finish_buy_transaction: false,
      set_buy_transaction_manual_product_price: false,
      list_item: false,
      list_product: false,
      list_inventory: false,
      list_stocking_supplier: false,
      list_stocking: false,
      list_cash_history: false,
      list_transaction: false,
      list_customer: false,
      get_stats: false,
      list_original_pack: false,
      list_purchase_table: false,
    };
  }
};
