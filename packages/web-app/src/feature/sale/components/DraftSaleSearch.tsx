import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { Box, TextField } from '@mui/material';
import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface DraftSaleSearchProps {
  onSearch: (searchParams: {
    productName?: string;
    customerName?: string;
    description?: string;
  }) => void;
}

export const DraftSaleSearch = ({ onSearch }: DraftSaleSearchProps) => {
  const [productName, setProductName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSearch = () => {
    onSearch({
      productName: productName === '' ? undefined : productName,
      customerName: customerName === '' ? undefined : customerName,
      description: description === '' ? undefined : description,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <TextField
        placeholder="商品名"
        size="small"
        value={productName}
        onChange={(event) => setProductName(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="会員名"
        size="small"
        value={customerName}
        onChange={(event) => setCustomerName(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ backgroundColor: 'white' }}
      />
      <TextField
        placeholder="メモ"
        size="small"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ backgroundColor: 'white' }}
      />
      <PrimaryButtonWithIcon
        onClick={handleSearch}
        icon={<SearchIcon />}
        iconSize={20}
      >
        検索
      </PrimaryButtonWithIcon>
    </Box>
  );
};
