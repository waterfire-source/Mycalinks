import React, { useState } from 'react';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { StoreInfoDisplay } from '@/components/common/StoreInfoDisplay';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountID: string;
  storeID: number;
}

export const StoreManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accountID,
  storeID,
}) => {
  const [isStoreEditModalOpen, setIsStoreEditModalOpen] = useState(false);
  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose}
        title="店舗アカウント情報"
        cancelButtonText="閉じる"
        secondActionButtonText="店舗アカウント編集"
        onSecondActionButtonClick={() => setIsStoreEditModalOpen(true)}
        width="90%"
      >
        <StoreInfoDisplay
          storeId={storeID}
          accountID={accountID}
          isStoreEditModalOpen={isStoreEditModalOpen}
          setIsStoreEditModalOpen={setIsStoreEditModalOpen}
        />
      </CustomModalWithIcon>
    </>
  );
};
