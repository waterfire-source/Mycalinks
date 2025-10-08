import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemSortSelect } from '@/feature/products/components/searchTable/ItemSortSelect';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';

interface Props {
  searchState: ItemSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
}

export const PurchaseTableNarrowDown = ({
  searchState,
  setSearchState,
}: Props) => {
  const { category, fetchCategoryList } = useCategory();
  const { store } = useStore();

  useEffect(() => {
    fetchCategoryList();
  }, [store.id, fetchCategoryList]);

  useEffect(() => {
    const cardCategory = category?.itemCategories.find(
      (cat) => cat.handle === 'CARD',
    );
    setSearchState((prev) => ({
      ...prev,
      selectedCategoryId: cardCategory?.id,
    }));
  }, [category, setSearchState]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      selectedCategoryId:
        event.target.value === 'all' ? undefined : Number(event.target.value),
    }));
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ m: 1 }}
      gap={2}
      justifyContent="space-between"
    >
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
      {/* レアリティ */}
      {/* <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel sx={{ color: 'black' }}>※レアリティ</InputLabel>
        <Select
        // value={
        //   searchState.selectedCategoryId !== undefined
        //     ? String(searchState.selectedCategoryId)
        //     : 'all'
        // }
        // onChange={handleCategoryChange}
        // label="商品カテゴリ"
        >
          <MenuItem value="not">なし</MenuItem>
        </Select>
      </FormControl> */}
      {/* ※さらに絞り込み */}
      {/* <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel sx={{ color: 'black' }}>※さらに絞り込み</InputLabel>
        <Select
          //   value={
          //     searchState.orderBy !== undefined ? searchState.orderBy : 'not'
          //   }
          //   onChange={handleOrderByChange}
          label="並び替え"
        >
          <MenuItem value="not">なし</MenuItem>
        </Select>
      </FormControl> */}

      <Stack direction="row" gap="12px" alignItems="center">
        <Typography>並び替え</Typography>
        <ItemSortSelect setSearchState={setSearchState} />
      </Stack>
    </Box>
  );
};
