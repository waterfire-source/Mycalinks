import React, { useEffect, Dispatch, SetStateAction } from 'react';
import {
  Box,
  SxProps,
  Theme,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ProductSearchState } from '@/feature/products/hooks/useProductsSearch';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useStore } from '@/contexts/StoreContext';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

interface Props {
  sx?: SxProps<Theme>;
  onSearch: () => void;
  searchState: ProductSearchState;
  setSearchState: Dispatch<SetStateAction<ProductSearchState>>;
}

export const MobileStockSearchField: React.FC<Props> = ({
  sx,
  onSearch,
  searchState,
  setSearchState,
}) => {
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();
  const { store } = useStore();

  useEffect(() => {
    if (store) {
      fetchGenreList();
      fetchCategoryList();
    }
  }, [store]);

  // 初回の検索
  useEffect(() => {
    onSearch();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Box
        sx={{
          flexDirection: 'column',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          ...sx,
        }}
      >
        <Stack direction={'column'} gap={1}>
          <Stack direction={'row'} gap={1}>
            {/* カテゴリ選択フィールド */}
            <FormControl
              size="small"
              variant="outlined"
              sx={{
                minWidth: 90,
                backgroundColor: 'common.white',
                '& .MuiInputLabel-root': {
                  color: 'text.primary',
                },
              }}
            >
              <InputLabel sx={{ color: 'text.primary' }}>カテゴリ</InputLabel>
              <Select
                value={
                  searchState.selectedCategoryId !== null
                    ? searchState.selectedCategoryId.toString()
                    : ''
                }
                onChange={(e) =>
                  setSearchState((prev) => ({
                    ...prev,
                    selectedCategoryId:
                      e.target.value === ''
                        ? null
                        : parseInt(e.target.value, 10),
                  }))
                }
                label="カテゴリ"
              >
                <MenuItem value="">未選択</MenuItem>

                {/* 他の選択肢を動的に生成 */}
                {Object.entries(category?.itemCategories ?? []).map(
                  ([id, item_category]) => (
                    <MenuItem key={id} value={item_category.id}>
                      {item_category.display_name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* ジャンル選択フィールド */}
            <FormControl
              size="small"
              variant="outlined"
              sx={{
                minWidth: 90,
                backgroundColor: 'common.white',
                '& .MuiInputLabel-root': {
                  color: 'text.primary',
                },
              }}
            >
              <InputLabel sx={{ color: 'text.primary' }}>ジャンル</InputLabel>
              <Select
                value={
                  searchState.selectedGenreId !== null
                    ? searchState.selectedGenreId.toString()
                    : ''
                }
                onChange={(e) =>
                  setSearchState((prev) => ({
                    ...prev,
                    selectedGenreId:
                      e.target.value === ''
                        ? null
                        : parseInt(e.target.value, 10),
                  }))
                }
                label="ジャンル"
              >
                <MenuItem value="">未選択</MenuItem>

                {/* 他の選択肢を動的に生成 */}
                {Object.entries(genre?.itemGenres ?? []).map(
                  ([id, item_genre]) => (
                    <MenuItem key={id} value={item_genre.id}>
                      {item_genre.display_name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* rarity検索フィールド */}
            <TextField
              variant="outlined"
              placeholder="レアリティ"
              value={searchState.rarity}
              type="text"
              onChange={(e) =>
                setSearchState((prev) => ({
                  ...prev,
                  rarity: toHalfWidthOnly(e.target.value),
                }))
              }
              sx={{
                minWidth: 50,
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: 'black',
                  fontSize: '0.8rem',
                  width: '100%',
                },
              }}
              InputProps={{
                sx: {
                  height: '35px',
                  fontSize: '0.8rem',
                },
              }}
            />
            {/* 型番検索フィールド */}
            <TextField
              placeholder="エキスパンション"
              value={searchState.modelExpansion}
              type="text"
              onChange={(e) => {
                setSearchState((prev) => ({
                  ...prev,
                  modelExpansion: e.target.value,
                }));
              }}
              sx={{
                minWidth: 50,
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: 'black',
                  fontSize: '0.8rem',
                  width: '100%',
                },
              }}
              InputProps={{
                sx: {
                  height: '35px',
                  fontSize: '0.8rem',
                },
              }}
            />
            <TextField
              placeholder="型番"
              value={searchState.modelNumber}
              type="text"
              onChange={(e) => {
                setSearchState((prev) => ({
                  ...prev,
                  modelNumber: toHalfWidthOnly(e.target.value),
                }));
              }}
              sx={{
                minWidth: 50,
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
              }}
              InputLabelProps={{
                sx: {
                  color: 'black',
                  fontSize: '0.8rem',
                  width: '100%',
                },
              }}
              InputProps={{
                sx: {
                  height: '35px',
                  fontSize: '0.8rem',
                },
              }}
            />
          </Stack>

          <Stack direction={'row'} gap={1} sx={{ width: '100%' }}>
            {/* 商品名検索フィールド */}
            <TextField
              placeholder="商品名"
              type="text"
              size="small"
              value={searchState.searchName}
              onChange={(e) =>
                setSearchState((prev) => ({
                  ...prev,
                  searchName: e.target.value,
                }))
              }
              sx={{ flex: 1, backgroundColor: 'white', width: '100%' }}
              InputLabelProps={{
                sx: {
                  color: 'black',
                  fontSize: '0.8rem',
                  width: '100%',
                },
              }}
              InputProps={{
                sx: {
                  height: '35px',
                  fontSize: '0.8rem',
                },
              }}
            />
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: 'primary.main',
                whiteSpace: 'nowrap',
                width: '70px',
              }}
              startIcon={<SearchIcon />}
              onClick={() => onSearch()}
            >
              検索
            </Button>
          </Stack>
        </Stack>
      </Box>
    </form>
  );
};
