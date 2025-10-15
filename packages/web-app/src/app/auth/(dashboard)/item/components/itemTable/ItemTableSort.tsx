import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
// 未使用のインポートはコメントアウト
// import { SimpleButtonWithIcon } from '@/components/buttons/SimpleButtonWithIcon';
// import WindowIcon from '@mui/icons-material/Window';
import { Dispatch, SetStateAction } from 'react';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';

interface Props {
  selectCategory: string | number;
  setSelectCategory: Dispatch<SetStateAction<string | number>>;
  setSearchState: (value: SetStateAction<ItemSearchState>) => void;
}

// コンポーネント化する際はファイル名とディレクトリの構成を修正する
export const ItemTableSort = ({
  selectCategory,
  setSelectCategory,
  setSearchState,
}: Props) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between" // 均等に配置
      gap={2} // 必要に応じて間隔を設定
    >
      <FormControl
        variant="outlined"
        size="small"
        sx={{
          minWidth: 130,
          backgroundColor: 'common.white',
          '& .MuiInputLabel-root': {
            color: 'text.primary',
          },
        }}
      >
        <InputLabel sx={{ color: 'text.primary' }}>並び替え</InputLabel>
        <Select
          value={selectCategory}
          onChange={(e) => {
            const newValue = e.target.value as ItemGetAllOrderType;

            setSelectCategory(newValue);

            // 選択された並び順をsetSearchStateに反映
            setSearchState((prevState) => ({
              ...prevState,
              orderBy: newValue, // 並び替えを適用
              currentPage: 0, // ページリセット
            }));
          }}
          label="並び替え"
        >
          <MenuItem value="" sx={{ color: 'grey' }}>
            <Typography color="text.primary">指定なし</Typography>
          </MenuItem>
          <MenuItem value="sell_price">
            <Typography color="text.primary">販売価格（昇順）</Typography>
          </MenuItem>
          <MenuItem value="-sell_price">
            <Typography color="text.primary">販売価格（降順）</Typography>
          </MenuItem>
          <MenuItem value="buy_price">
            <Typography color="text.primary">買取価格（昇順）</Typography>
          </MenuItem>
          <MenuItem value="-buy_price">
            <Typography color="text.primary">買取価格（降順）</Typography>
          </MenuItem>
          <MenuItem value="products_stock_number">
            <Typography color="text.primary">総在庫数（昇順）</Typography>
          </MenuItem>
          <MenuItem value="-products_stock_number">
            <Typography color="text.primary">総在庫数（降順）</Typography>
          </MenuItem>
          <MenuItem value="display_name">
            <Typography color="text.primary">名前（昇順）</Typography>
          </MenuItem>
          <MenuItem value="-display_name">
            <Typography color="text.primary">名前（降順）</Typography>
          </MenuItem>
          <MenuItem value="id">
            <Typography color="text.primary">型番（昇順）</Typography>
          </MenuItem>
          <MenuItem value="-id">
            <Typography color="text.primary">型番（降順）</Typography>
          </MenuItem>
        </Select>
      </FormControl>

      {/* <SimpleButtonWithIcon
        icon={<WindowIcon />}
        iconSize={16}
        iconColor="primary.main"
        disabled={true}
      >
        ※表示切替
      </SimpleButtonWithIcon> */}
    </Box>
  );
};
