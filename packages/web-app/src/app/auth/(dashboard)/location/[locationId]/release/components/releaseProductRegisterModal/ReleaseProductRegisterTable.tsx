import { ReleaseProductRegisterTableContent } from '@/app/auth/(dashboard)/location/[locationId]/release/components/releaseProductRegisterModal/ReleaseProductRegisterTableContent';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { InputAdornment, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton } from '@mui/material';
import { useMemo, useState } from 'react';

type Props = {
  locationProducts: LocationProduct[];
  addToRegisterCart: (product: LocationProduct, count: number) => void;
};

export const ReleaseProductRegisterTable = ({
  locationProducts,
  addToRegisterCart,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 検索でフィルタリングされた商品リスト
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return locationProducts;

    return locationProducts.filter(
      (product) =>
        product.displayNameWithMeta
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.item_category_display_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.condition_option_display_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [locationProducts, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <TextField
        placeholder="商品名、カテゴリ、状態で検索..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        size="small"
        sx={{ width: '100%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => handleSearch('')}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <ReleaseProductRegisterTableContent
        locationProducts={filteredProducts}
        addToRegisterCart={addToRegisterCart}
      />
    </Stack>
  );
};
