import { Box, Stack } from '@mui/material';
import { useAuthorityForm } from '@/feature/settings/authority/utils/useForm';
import { AccountGroupType } from '@/feature/account/hooks/useAccountGroup';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { AuthorityDeleteDialog } from '@/feature/settings/authority/components/DeleteAuthority/Dialog';
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { FormTextField } from '@/components/inputFields/FormTextField';
import { AuthorityList } from '@/feature/settings/authority/components/Authority/AuthorityList';
import { AUTHORITY_FIELD_NAME_MAP } from '@/feature/settings/authority/utils/form-schema';
import { FormErrorProvider } from '@/contexts/FormErrorContext';

interface Props {
  isOpen: boolean;
  modalType: ModalType;
  onClose: () => void;
  accountsCount: number;
  accountGroup: AccountGroupType | null;
  existingAccountGroups: AccountGroupType[];
  setCanRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

export enum ModalType {
  Create = 'create',
  Edit = 'edit',
}

export const AuthorityModal = ({
  isOpen,
  modalType,
  onClose,
  accountGroup,
  existingAccountGroups,
  setCanRefetch,
}: Props) => {
  const { methods, onSubmit, isLoading, handleClose } = useAuthorityForm(
    existingAccountGroups,
    accountGroup,
    setCanRefetch,
    onClose,
  );
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={handleClose}
        height="90%"
        width="90%"
        title={modalType === ModalType.Create ? '新規権限作成' : '権限編集'}
        onActionButtonClick={onSubmit}
        actionButtonText={
          modalType === ModalType.Create ? '権限新規作成' : '編集内容を保存'
        }
        loading={isLoading}
        cancelButtonText={
          modalType === ModalType.Create
            ? '権限作成をやめる'
            : '編集編集をやめる'
        }
        secondActionButtonText={modalType === ModalType.Edit ? '削除' : ''}
        onSecondActionButtonClick={() => {
          if (modalType === ModalType.Edit) {
            setIsOpenDeleteDialog(true);
          }
        }}
      >
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
          }}
        >
          <Stack sx={{ margin: '20px 50px' }}>
            <FormProvider {...methods}>
              <FormErrorProvider fieldNameMap={AUTHORITY_FIELD_NAME_MAP}>
                <Stack gap={2}>
                  <Box width="50%">
                    <FormTextField name="display_name" titleWidth="100px" />
                  </Box>
                  <AuthorityList />
                </Stack>
              </FormErrorProvider>
            </FormProvider>
          </Stack>
        </Stack>
      </CustomModalWithIcon>
      {modalType === ModalType.Edit && accountGroup && (
        <AuthorityDeleteDialog
          isOpen={isOpenDeleteDialog}
          handleClose={() => setIsOpenDeleteDialog(false)}
          accountGroupId={accountGroup.id}
          accountsCount={accountGroup.accountsCount}
          setCanRefetch={setCanRefetch}
        />
      )}
    </>
  );
};
