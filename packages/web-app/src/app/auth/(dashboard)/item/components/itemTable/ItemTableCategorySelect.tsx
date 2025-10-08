import { CategoryAPIRes } from '@/api/frontend/category/api';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
interface Props {
  category: CategoryAPIRes['getCategoryAll'] | undefined;
  selectCategory: string | number;
  setSelectCategory: Dispatch<SetStateAction<string | number>>;
  setSearchState: (value: SetStateAction<ItemSearchState>) => void;
}

// コンポーネント化する際はファイル名とディレクトリの構成を修正する
export const ItemTableCategorySearch = ({
  category,
  selectCategory,
  setSelectCategory,
  setSearchState,
}: Props) => {
  if (!category) return null;
  return (
    <Box
      display="flex"
      justifyContent="space-between" // 均等に配置
      gap={2} // 適宜間隔を調整
    >
      <FormControl
        variant="outlined"
        size="small"
        sx={{
          minWidth: 180,
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
          },
        }}
      >
        <InputLabel sx={{ color: 'text.primary' }}>商品カテゴリ</InputLabel>
        <Select
          value={selectCategory}
          onChange={(e) => {
            setSelectCategory(e.target.value);
            // 選択されたカテゴリのIDを`setSearchState`に反映
            setSearchState((prevState) => ({
              ...prevState,
              selectedCategoryId: e.target.value
                ? Number(e.target.value)
                : undefined,
              currentPage: 0, // ページリセット
            }));
          }}
          label="商品カテゴリ"
        >
          {/* "指定なし"オプション */}
          <MenuItem value="" sx={{ color: 'grey' }}>
            <Typography color="text.primary">指定なし</Typography>
          </MenuItem>

          {/* category.itemCategoriesから選択肢を生成 */}
          {category?.itemCategories.map((itemCategory) => (
            <MenuItem key={itemCategory.id} value={itemCategory.id}>
              <Typography color="text.primary">
                {itemCategory.display_name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
