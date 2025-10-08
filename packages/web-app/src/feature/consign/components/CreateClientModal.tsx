import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import {
  ConsignmentClientFormData,
  consignmentClientSchema,
  CreateOrEditClientForm,
  initialFormData,
} from '@/feature/consign/components/CreateOrEditClientForm';
import { useConsignment } from '@/feature/consign/hooks/useConsignment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';

interface Props {
  open: boolean;
  onClose: () => void;
  handleFetchClients: () => void;
}

export const CreateClientModal = ({
  open,
  onClose,
  handleFetchClients,
}: Props) => {
  const { isLoading, createOrUpdateConsignmentClient } = useConsignment();
  const { setAlertState } = useAlert();

  const methods = useForm<ConsignmentClientFormData>({
    resolver: zodResolver(consignmentClientSchema),
    defaultValues: initialFormData,
  });
  const { handleSubmit, reset } = methods;

  const handleCloseModal = () => {
    onClose();
    reset(initialFormData);
  };

  const onSubmit = async (data: ConsignmentClientFormData) => {
    const { bankName, branchCode, accountType, accountNumber, ...rest } = data;

    const bank_info_json = JSON.stringify({
      bankName,
      branchCode,
      accountType,
      accountNumber,
    });
    const result = await createOrUpdateConsignmentClient({
      ...rest,
      bank_info_json,
    });

    if (result) {
      setAlertState({
        message: '委託者を登録しました',
        severity: 'success',
      });
      handleFetchClients();
      handleCloseModal();
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={handleCloseModal}
      title="新規委託者登録"
      width="50%"
      height="90%"
      loading={isLoading}
      actionButtonText="登録"
      onActionButtonClick={handleSubmit(onSubmit)}
      cancelButtonText="閉じる"
      onCancelClick={handleCloseModal}
    >
      <Box display="flex" alignItems="center" justifyContent="center">
        <CreateOrEditClientForm methods={methods} onSubmit={onSubmit} />
      </Box>
    </CustomModalWithIcon>
  );
};
