import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { SearchModal } from '@/feature/purchase/components/searchModal/SearchModal';

export const SearchButton: React.FC = () => {
  // 検索モーダル表示状態を表すState.
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <>
      <SearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
      <SecondaryButtonWithIcon
        sx={{
          height: '40px',
        }}
        onClick={() => setIsSearchModalOpen(true)}
        icon={<FaSearch size={20} />}
      >
        商品検索
      </SecondaryButtonWithIcon>
    </>
  );
};
