import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import {
  ACCOUNT_FIELD_NAME_MAP,
  AccountFormObject,
} from '@/feature/settings/account/components/Modal/utils/form-schema';
import { AccountFormSchema } from '@/feature/settings/account/components/Modal/utils/form-schema';
import { useEffect, useState } from 'react';
import { AccountType, useAccounts } from '@/feature/account/hooks/useAccounts';
import { formatErrorMessages } from '@/contexts/FormErrorContext';

export const useAccountForm = (
  account: AccountType | undefined,
  fetchData: () => Promise<void>,
  onClose: () => void,
) => {
  const { setAlertState } = useAlert();
  const {
    createAccount,
    updateAccount,
    fetchAccounts,
    accounts: existingAccounts,
  } = useAccounts();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<AccountFormSchema>({
    defaultValues: generateDefaultValues(account),
    resolver: zodResolver(AccountFormObject),
  });

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const { handleSubmit, watch, reset } = methods;
  const handleClose = () => {
    onClose();
    if (account) {
      reset(generateDefaultValues(account));
    } else {
      reset();
    }
  };
  const onSubmit = handleSubmit(async (data: AccountFormSchema) => {
    setIsLoading(true);
    const errors: Array<{ field: string; message: string }> = [];
    const isDuplicateName =
      existingAccounts &&
      existingAccounts.some(
        (account) =>
          account.display_name === data.displayName &&
          account.id !== account?.id,
      );

    const isDuplicateEmail =
      existingAccounts &&
      existingAccounts.some(
        (account) => account.email === data.email && account.id !== account?.id,
      );

    if (isDuplicateName) {
      errors.push({
        field: 'displayName',
        message: '既に使われている名前です。',
      });
    }
    if (isDuplicateEmail) {
      errors.push({
        field: 'email',
        message: '既に使われているメールアドレスです。',
      });
    }
    const currentPassword = watch('currentPassword');
    if (account && !currentPassword) {
      errors.push({
        field: 'currentPassword',
        message: 'パスワードを入力してください',
      });
    }

    if (errors.length > 0) {
      // エラーメッセージをまとめて表示 - アカウント専用のマッピングを使用
      setAlertState({
        message: formatErrorMessages(errors, ACCOUNT_FIELD_NAME_MAP),
        severity: 'error',
      });
      setIsLoading(false);
      return;
    }
    try {
      if (account) {
        // TODO: 新しく入力されたパスワード
        await updateAccount(account.id, data.currentPassword!, {
          email: data.email,
          displayName: data.displayName,
          groupId: data.groupId,
          nickName: data.nickName,
          storeIds: data.storeIds,
        });
      } else {
        await createAccount(
          data.displayName,
          data.email,
          data.groupId,
          data.storeIds,
          data.nickName,
        );
      }
      setAlertState({
        message: `登録に成功しました。`,
        severity: 'success',
      });
      handleClose();
      fetchData();
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

export const generateDefaultValues = (
  account: AccountType | undefined,
): AccountFormSchema => {
  if (account) {
    return {
      displayName: account.display_name ?? '',
      currentPassword: null,
      email: account.email,
      storeIds: account.stores.map((store) => store.store_id),
      groupId: account.group_id,
      nickName: account.nick_name ?? '',
    };
  } else {
    return {
      displayName: '',
      currentPassword: null,
      email: '',
      storeIds: [],
      groupId: 0,
      nickName: '',
    };
  }
};
