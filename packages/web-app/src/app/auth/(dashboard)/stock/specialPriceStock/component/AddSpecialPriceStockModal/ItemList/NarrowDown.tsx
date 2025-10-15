import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useEffect } from 'react';

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NarrowDown = ({
  searchState,
  setSearchState,
  setIsReset,
}: Props) => {
  const { category, fetchCategoryList } = useCategory(); //カテゴリーの取得
  const { store } = useStore();

  useEffect(() => {
    fetchCategoryList();
  }, [store.id, fetchCategoryList]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      selectedCategoryId:
        event.target.value === 'all' ? undefined : Number(event.target.value),
    }));
    setIsReset(true);
  };
  return (
    <Box display="flex" alignItems="center" sx={{ m: 1 }} gap={2}>
      {/* 商品カテゴリ */}
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel sx={{ color: 'black' }}>商品カテゴリ</InputLabel>
        <Select
          value={
            searchState.selectedCategoryId !== undefined
              ? String(searchState.selectedCategoryId)
              : 'all'
          }
          onChange={handleCategoryChange}
          label="商品カテゴリ"
        >
          <MenuItem value="all">すべて</MenuItem>
          {category?.itemCategories.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* ※さらに絞り込み */}
      {/* <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel sx={{ color: 'black' }}>※さらに絞り込み</InputLabel>
        <Select
            value={
              searchState.orderBy !== undefined ? searchState.orderBy : 'not'
            }
            onChange={handleOrderByChange}
          label="並び替え"
        >
          <MenuItem value="not">なし</MenuItem>
        </Select>
      </FormControl> */}
    </Box>
  );
};
