import React, { Dispatch, SetStateAction, useState } from 'react';
import { SxProps, Theme, TextField, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: () => void;
  setSearchState: Dispatch<SetStateAction<ProductSearchState>>;
  searchState: ProductSearchState;
  additions?: React.ReactNode;
}

// 商品検索の検索窓等を定義したコンポーネント。
const SearchField: React.FC<Props> = ({
  sx,
  onSearch,
  searchState,
  setSearchState,
  additions = null,
}) => {
  const [searchName, setSearchName] = useState(searchState.searchName || '');
  const [expansion, setExpansion] = useState(searchState.modelExpansion || '');
  const [modelNumber, setModelNumber] = useState(searchState.modelNumber || '');
  const [rarity, setRarity] = useState(searchState.rarity || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <Stack direction="row" alignItems="center" gap="10px" sx={{ ...sx }}>
        {/* 商品名検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="商品名"
          value={searchName}
          type="text"
          size="small"
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchState((prev) => ({
                ...prev,
                searchName: searchName,
              }));
            }
          }}
          onBlur={() => {
            setSearchState((prev) => ({
              ...prev,
              searchName: searchName,
            }));
          }}
          sx={{
            flexGrow: 2,
            minWidth: 200,
            backgroundColor: 'white',
          }}
        />

        {/* エキスパンション検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="エキスパンション"
          value={expansion}
          type="text"
          size="small"
          onChange={(e) => setExpansion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchState((prev) => ({
                ...prev,
                expansion: expansion,
              }));
            }
          }}
          onBlur={() => {
            setSearchState((prev) => ({
              ...prev,
              expansion: expansion,
            }));
          }}
          sx={{
            minWidth: 70,
            backgroundColor: 'white',
          }}
        />

        {/* 型番検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="型番"
          value={modelNumber}
          type="text"
          size="small"
          onChange={(e) => setModelNumber(toHalfWidthOnly(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchState((prev) => ({
                ...prev,
                modelNumber: modelNumber,
              }));
            }
          }}
          onBlur={() => {
            setSearchState((prev) => ({
              ...prev,
              modelNumber: modelNumber,
            }));
          }}
          sx={{
            minWidth: 70,
            backgroundColor: 'white',
          }}
        />

        {/* レアリティ検索フィールド */}
        <TextField
          variant="outlined"
          placeholder="レアリティ"
          value={rarity}
          size="small"
          onChange={(e) => setRarity(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchState((prev) => ({
                ...prev,
                rarity: rarity,
              }));
            }
          }}
          onBlur={() => {
            setSearchState((prev) => ({
              ...prev,
              rarity: rarity,
            }));
          }}
          sx={{
            minWidth: 70,
            backgroundColor: 'white',
          }}
        />

        <PrimaryButtonWithIcon
          type="submit"
          startIcon={<SearchIcon />}
          onClick={onSearch}
        >
          検索
        </PrimaryButtonWithIcon>

        {additions}
      </Stack>
    </form>
  );
};

export default SearchField;
