import { useCategory } from '@/feature/category/hooks/useCategory';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { useEffect, useState } from 'react';
interface Props {
  onSelect: (e: SelectChangeEvent<string | number>) => void;
  sx?: SxProps<Theme>;
  formControlSx?: SxProps<Theme>;
}

// このカテゴリのセレクトはコンポーネント内でfetchしてきてくれる
export const CategorySelectOnServer = ({
  onSelect,
  sx,
  formControlSx,
}: Props) => {
  const { category, fetchCategoryList } = useCategory();

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  const [selectCategory, setSelectCategory] = useState<string | number>('');
  return (
    <Stack
      direction="row"
      justifyContent="space-between" // 均等に配置
      gap={2} // 適宜間隔を調整
      sx={sx}
    >
      <FormControl
        variant="outlined"
        size="small"
        sx={{
          minWidth: 120,
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
          },
          ...formControlSx,
        }}
      >
        <InputLabel sx={{ color: 'text.primary' }}>カテゴリ</InputLabel>
        <Select
          value={selectCategory}
          onChange={(e) => {
            setSelectCategory(e.target.value);
            // 選択されたカテゴリのIDを`setSearchState`に反映
            onSelect(e);
          }}
          label="カテゴリ"
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
    </Stack>
  );
};
