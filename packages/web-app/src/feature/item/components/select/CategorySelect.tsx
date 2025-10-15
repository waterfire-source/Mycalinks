import { useCategory } from '@/feature/category/hooks/useCategory';
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  Theme,
  SxProps,
  InputLabel,
} from '@mui/material';
import { ItemCategoryHandle } from '@prisma/client';
import { useEffect } from 'react';

interface Props {
  selectedCategoryId: number | null | undefined;
  onSelect: (e: SelectChangeEvent) => void;
  sx?: SxProps<Theme>;
  // menuItemに表示する文言をフィルターする
  // (具体例: src/app/auth/(dashboard)/original-pack/create/components/confirm/OriginalPackConfirmDetailCard.tsx を参照)
  filterCategoryHandles?: ItemCategoryHandle[];
  inputLabel?: string;
  disabled?: boolean;
}

export const CategorySelect = ({
  selectedCategoryId,
  onSelect,
  sx,
  filterCategoryHandles,
  inputLabel,
  disabled = false,
}: Props) => {
  const { category, fetchCategoryList } = useCategory();

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        ...sx,
        backgroundColor: 'common.white',
        '& .MuiInputLabel-root': {
          color: 'text.primary',
        },
      }}
    >
      {inputLabel && (
        <InputLabel sx={{ color: 'text.primary' }}>{inputLabel}</InputLabel>
      )}
      <Select
        value={selectedCategoryId ? selectedCategoryId.toString() : ''}
        onChange={onSelect}
        disabled={disabled}
        label={inputLabel}
      >
        {/* "指定なし"オプション */}
        <MenuItem value="" sx={{ color: 'grey' }}>
          <Typography color="text.primary">指定なし</Typography>
        </MenuItem>

        {/* category.itemCategoriesから選択肢を生成 */}
        {category?.itemCategories.map((itemCategory) => {
          if (
            filterCategoryHandles &&
            filterCategoryHandles.find(
              (handle) => handle === itemCategory.handle,
            ) === undefined
          ) {
            return null;
          }
          return (
            <MenuItem key={itemCategory.id} value={itemCategory.id}>
              <Typography color="text.primary">
                {itemCategory.display_name}
              </Typography>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
