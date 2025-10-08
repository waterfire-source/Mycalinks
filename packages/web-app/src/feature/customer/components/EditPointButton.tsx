import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { EditPointModal } from '@/feature/customer/components/EditPointModal';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import { useState } from 'react';

export const EditPointButton = () => {
  const [isEditPointModalOpen, setIsEditPointModalOpen] =
    useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerType | undefined>();
  const handleClose = () => {
    setIsEditPointModalOpen(false);
    setCustomerInfo(undefined);
  };
  return (
    <>
      <SecondaryButtonWithIcon onClick={() => setIsEditPointModalOpen(true)}>
        ポイントを付与
      </SecondaryButtonWithIcon>
      <EditPointModal
        open={isEditPointModalOpen}
        onClose={handleClose}
        setCustomerInfo={setCustomerInfo}
        customerInfo={customerInfo}
        onTertiaryButtonClick={handleClose}
      />
    </>
  );
};
