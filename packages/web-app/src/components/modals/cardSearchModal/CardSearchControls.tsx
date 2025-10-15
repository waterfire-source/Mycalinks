import React from 'react';
import { Box, TextField } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { GenreCategoryButtons } from '@/feature/item/components/GenreCategoryButtons';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';

interface CardSearchControls {
  onSearch: () => void;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  searchState: ItemSearchState;
}

const CardSearchControls: React.FC<CardSearchControls> = ({
  onSearch,
  setSearchState,
  searchState,
}) => {
  const handleSearch = () => {
    onSearch();
  };

  const handleChangeDepartment = (categoryId?: number, genreId?: number) => {
    setSearchState((prev) => ({
      ...prev,
      selectedCategoryId: categoryId,
      selectedGenreId: genreId,
    }));
  };

  return (
    <Box
      sx={{
        borderRadius: '4px 4px 0 0',
        display: 'flex',
        width: '100%',
        flexShrink: 0,
        flexDirection: 'column',
      }}
    >
      <GenreCategoryButtons onChange={handleChangeDepartment} />
      <Box
        display="flex"
        sx={{ padding: '10px', backgroundColor: 'common.white' }}
      >
        <TextField
          variant="outlined"
          size="small"
          value={searchState.searchName}
          placeholder="商品名、商品コード"
          onChange={(e) =>
            setSearchState((prev) => ({
              ...prev,
              searchName: e.target.value,
            }))
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          sx={{
            width: '80%',
            backgroundColor: 'common.white',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: 'grey.700',
            },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottomColor: 'grey.600',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'grey.700',
              },
              '&:hover fieldset': {
                borderColor: 'grey.600',
              },
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
          }}
        >
          <PrimaryButton
            sx={{ width: '80px', height: '100%' }}
            onClick={handleSearch}
          >
            検索
          </PrimaryButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CardSearchControls;
