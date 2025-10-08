import { Stack, useTheme } from '@mui/material';
import { FormProvider } from 'react-hook-form';
import { useAccountForm } from '@/feature/settings/account/components/Modal/utils/useForm';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { AccountFormContents } from '@/feature/settings/account/components/Modal/FormContents';
import { AccountDeleteDialog } from '@/feature/settings/account/components/DeleteAccount/Dialog';
import { useState } from 'react';
import { ConfirmPasswordDialog } from '@/feature/settings/account/components/Modal/ConfirmPasswordDialog';
import { FormErrorProvider } from '@/contexts/FormErrorContext';
import { ACCOUNT_FIELD_NAME_MAP } from '@/feature/settings/account/components/Modal/utils/form-schema';

interface Props {
  isOpen: boolean;
  modalType: ModalType;
  onClose: () => void;
  account: AccountType | undefined;
  accountGroups: AccountGroupType[];
  fetchData: () => Promise<void>;
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export enum ModalType {
  Create = 'create',
  Edit = 'edit',
}

export const AccountModal = ({
  isOpen,
  modalType,
  onClose,
  account,
  accountGroups,
  fetchData,
  setCanRefetch,
}: Props) => {
  const { palette } = useTheme();
  const { methods, onSubmit, isLoading, handleClose } = useAccountForm(
    account,
    fetchData,
    onClose,
  );

  const [isOpenConfirmPasswordDialog, setIsOpenConfirmPasswordDialog] =
    useState<boolean>(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);

  const handleCloseDeleteDialog = () => {
    setIsOpenDeleteDialog(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (modalType === ModalType.Create) {
      await onSubmit();
    } else if (modalType === ModalType.Edit) {
      setIsOpenConfirmPasswordDialog(true);
    }
  };

  const previewAccountGroup = accountGroups?.find(
    (item) => item.id === account?.group_id,
  );

  const formTitle =
    modalType === ModalType.Create
      ? '従業員アカウント新規作成'
      : '従業員アカウント編集';

  const actionButtonText =
    modalType === ModalType.Create ? '従業員新規作成' : '編集内容を保存';

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      height="90%"
      width="90%"
      loading={isLoading}
      title={formTitle}
      actionButtonText={actionButtonText}
      onActionButtonClick={handleSubmit}
      secondActionButtonText={modalType === ModalType.Edit ? '削除' : ''}
      onSecondActionButtonClick={() => setIsOpenDeleteDialog(true)}
    >
      <Stack
        sx={{
          backgroundColor: palette.background.paper,
          height: '100%',
        }}
      >
        <Stack sx={{ margin: '20px 50px', height: '100%' }}>
          <FormProvider {...methods}>
            <FormErrorProvider fieldNameMap={ACCOUNT_FIELD_NAME_MAP}>
              <Stack
                direction="row"
                sx={{ margin: '20px 50px', height: '100%' }}
              >
                <AccountFormContents
                  account={account}
                  accountGroups={accountGroups}
                  previousAccountGroup={previewAccountGroup}
                  setCanRefetch={setCanRefetch}
                />
              </Stack>
              <ConfirmPasswordDialog
                isOpen={isOpenConfirmPasswordDialog}
                onClose={() => setIsOpenConfirmPasswordDialog(false)}
                onSubmit={onSubmit}
              />
            </FormErrorProvider>
          </FormProvider>
        </Stack>
      </Stack>
      {account && (
        <AccountDeleteDialog
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
          onClose={handleCloseDeleteDialog}
          accountId={account.id}
          setCanRefetch={setCanRefetch}
        />
      )}
    </CustomModalWithIcon>
  );
};
