'use client';

import { Stack, TextField } from '@mui/material';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';

type QueryType = {
  productName?: string;
  consignmentUser?: string;
  genreId?: number;
  categoryId?: number;
};

interface ConsignmentSearchFormProps {
  onSearch: (query: QueryType) => void;
}

export function ConsignmentSearchForm({
  onSearch,
}: ConsignmentSearchFormProps) {
  const [productName, setProductName] = useState('');
  const [consignmentUser, setConsignmentUser] = useState('');

  const handleSearch = () => {
    onSearch({
      productName: productName.trim() || undefined,
      consignmentUser: consignmentUser.trim() || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Stack
      direction="row"
      gap="16px"
      component="form"
      alignItems="center"
      mt={1}
    >
      <TextField
        size="small"
        placeholder="商品名"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ maxWidth: '300px', backgroundColor: 'white' }}
      />

      <TextField
        size="small"
        placeholder="委託主"
        value={consignmentUser}
        onChange={(e) => setConsignmentUser(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ maxWidth: '300px', backgroundColor: 'white' }}
      />

      <PrimaryButtonWithIcon icon={<SearchIcon />} onClick={handleSearch}>
        検索
      </PrimaryButtonWithIcon>
    </Stack>
  );
}
