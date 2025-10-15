import React from 'react';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SearchModalContent } from '@/feature/purchase/components/searchModal/contents/SearchModalContent';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="商品検索"
      width="90%"
      height="85%"
      hideButtons={true}
      dataTestId="product-search-modal"
      closeButtonDataTestId="product-search-modal-close"
    >
      <SearchModalContent />
    </CustomModalWithIcon>
  );
};
