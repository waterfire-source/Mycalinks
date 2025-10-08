import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAlert } from '@/contexts/AlertContext';
import {
  PasswordFormSchema,
  PasswordFormType,
} from '@/feature/settings/account/components/Modal/Input/Password/form-schema';
import { useAccounts } from '@/feature/account/hooks/useAccounts';
import { useState } from 'react';

export const usePasswordForm = (accountId: number, handleClose: () => void) => {
  const { setAlertState } = useAlert();
  const { updatePassword } = useAccounts();
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<PasswordFormType>({
    mode: 'onSubmit',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(PasswordFormSchema),
  });

  const { handleSubmit, reset } = methods;
  const onSubmit = handleSubmit(async (data: PasswordFormType) => {
    try {
      setIsLoading(true);
      await updatePassword(accountId, data.currentPassword, data.newPassword);
      setAlertState({
        message: `パスワードの更新に成功しました。`,
        severity: 'success',
      });
      reset();
      handleClose();
    } catch (error) {
      console.error('パスワード更新に失敗しました。', error);
      setAlertState({
        message: `パスワードの更新に失敗しました。${error}`,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  });

  return { methods, onSubmit, isLoading };
};
