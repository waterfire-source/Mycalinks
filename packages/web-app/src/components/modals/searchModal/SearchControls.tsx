import React, { useEffect, useMemo } from 'react';
import { Box, TextField } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { GenreCategoryButtons } from '@/feature/item/components/GenreCategoryButtons';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { FindOptionSelect } from '@/feature/item/components/select/FindOptionSelect';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';
import {
  ChangeFindOptionType,
  FindOptionType,
} from '@/feature/item/hooks/useSearchItemByFindOption';

interface SearchControlsProps {
  onSearch: () => void;
  onCategoryOrGenreChange: (
    categoryId?: number,
    genreId?: number | null,
  ) => void;
  searchTerm?: string;
  isActive?: string;
  onIsActiveChange: (state: boolean | undefined) => void;
  setSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPurchase?: boolean;
  storeId?: number;
  selectedGenreId?: number;
  selectedCategoryId?: number;
  selectedFindOption?: FindOptionType[];
  handleChangeFindOption?: (value: ChangeFindOptionType) => void;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  onSearch,
  onCategoryOrGenreChange,
  isActive,
  onIsActiveChange,
  searchTerm,
  setSearchTerm,
  isPurchase,
  storeId,
  selectedGenreId,
  selectedCategoryId,
  selectedFindOption,
  handleChangeFindOption,
}) => {
  const { category, fetchCategoryList } = useCategory();
  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  useEffect(() => {
    if (storeId) {
      fetchCategoryList();
    }
  }, [storeId]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          borderRadius: '4px 4px 0 0',
          backgroundColor: 'grey.100',
          display: 'flex',
          flex: 1,
          overflowX: 'auto',
          flexShrink: 0,
          flexDirection: 'column',
        }}
        data-testid="search-controls-container"
      >
        <GenreCategoryButtons
          onChange={onCategoryOrGenreChange}
          notDisplayOriginalProductCategory={isPurchase}
        />
        <Box display="flex" alignItems="center" flexWrap="wrap">
          <Box
            display="flex"
            sx={{ padding: '10px', backgroundColor: 'grey.100' }}
            data-testid="search-input-container"
          >
            <TextField
              variant="outlined"
              size="small"
              placeholder="商品名、商品コード"
              value={searchTerm}
              onChange={setSearchTerm}
              onKeyDown={handleSearchKeyPress}
              inputProps={{ 'data-testid': 'search-input' }}
              sx={{
                width: '300px',
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
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
                sx={{ height: '100%' }}
                onClick={onSearch}
                data-testid="search-button"
              >
                検索
              </PrimaryButton>
            </Box>
          </Box>
          {isPurchase && selectedFindOption && handleChangeFindOption && (
            <FindOptionSelect
              storeID={storeId}
              selectedGenreId={selectedGenreId}
              selectedCategoryId={selectedCategoryId}
              selectedFindOption={selectedFindOption}
              handleChangeFindOption={handleChangeFindOption}
              cardCategoryId={cardCategory?.id}
            />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '10px',
          maxWidth: 'fit-content',
        }}
      >
        {isActive === 'true' ? (
          <SecondaryButton
            onClick={() => onIsActiveChange(undefined)}
            variant="outlined"
            data-testid="show-in-stock-only-button"
            sx={{
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              width: 'auto',
              height: '30px',
            }}
          >
            在庫のない商品も表示する
          </SecondaryButton>
        ) : (
          <SecondaryButton
            onClick={() => onIsActiveChange(true)}
            variant="outlined"
            data-testid="show-out-of-stock-button"
            sx={{
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              width: 'auto',
              height: '30px',
              boxShadow: 'none',
            }}
          >
            在庫のある商品のみ表示する
          </SecondaryButton>
        )}
      </Box>
    </Box>
  );
};
