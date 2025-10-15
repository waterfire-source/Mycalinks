import { CategoryAPIRes } from '@/api/frontend/lossGenre/api';
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
  lossGenre: CategoryAPIRes['getCategoryAll'] | undefined;
  selectLossGenre: string | number;
  setSelectLossGenre: Dispatch<SetStateAction<string | number>>;
  setSearchState: (value: SetStateAction<ItemSearchState>) => void;
}

export const ItemTableLossCategorySearch = ({
  lossGenre,
  selectLossGenre,
  setSelectLossGenre,
  setSearchState,
}: Props) => {
  if (!lossGenre) return null;
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
        <InputLabel sx={{ color: 'text.primary' }}>ロス区分</InputLabel>
        <Select
          value={selectLossGenre}
          onChange={(e) => {
            setSelectLossGenre(e.target.value);
            // 選択されたロス区分のIDを`setSearchState`に反映
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

          {/* lossGenre.itemCategoriesから選択肢を生成 */}
          {lossGenre?.itemLossGenres.map((itemLossGenre) => (
            <MenuItem key={itemLossGenre.id} value={itemLossGenre.id}>
              <Typography color="text.primary">
                {itemLossGenre.display_name}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
