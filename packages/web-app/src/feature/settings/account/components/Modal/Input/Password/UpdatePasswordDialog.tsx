import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { PasswordTextField } from '@/feature/settings/account/components/Modal/Input/Password/TextField';
import { usePasswordForm } from '@/feature/settings/account/components/Modal/Input/Password/useForm';
import { Stack, Typography } from '@mui/material';
import { FormProvider } from 'react-hook-form';

interface Props {
  isOpen: boolean;
  accountId: number;
  onClose: () => void;
}

export const UpdatePasswordDialog = ({ isOpen, accountId, onClose }: Props) => {
  const { onSubmit, methods, isLoading } = usePasswordForm(accountId, onClose);
  return (
    <FormProvider {...methods}>
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose}
        title="パスワード変更"
        actionButtonText="保存"
        loading={isLoading}
        onActionButtonClick={onSubmit}
        cancelButtonText="キャンセル"
        onCancelClick={onClose}
        type="submit"
        sx={{
          backgroundColor: 'white',
        }}
      >
        <Stack gap={2} alignItems="center">
          <Typography>
            ※パスワードには
            <span style={{ color: 'red', fontWeight: 'bold' }}>
              ログイン中のユーザー
            </span>
            <br />
            のパスワードを入力してください
          </Typography>
          <PasswordTextField name="currentPassword" label="パスワード" />
          <PasswordTextField name="newPassword" label="新しいパスワード" />
          <PasswordTextField
            name="confirmPassword"
            label="新しいパスワード(確認)"
          />
        </Stack>
      </CustomModalWithIcon>
    </FormProvider>
  );
};
