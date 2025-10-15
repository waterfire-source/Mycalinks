import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import {
  Select,
  MenuItem,
  SxProps,
  Theme,
  SelectChangeEvent,
} from '@mui/material';
import { SetStateAction, useState } from 'react';

interface Props {
  sx?: SxProps<Theme>;
  setSearchState: (value: SetStateAction<ItemSearchState>) => void;
}
export const ItemSortSelect = ({ sx, setSearchState }: Props) => {
  const [sort, setSort] = useState<ItemGetAllOrderType>(
    ItemGetAllOrderType.SellPriceAsc,
  );
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSort(event.target.value as ItemGetAllOrderType);
    setSearchState((prevState) => ({
      ...prevState,
      orderBy: event.target.value as ItemGetAllOrderType,
    }));
  };
  return (
    <Select
      size="small"
      value={sort}
      onChange={handleSortChange}
      sx={{ width: '150px', ...sx }}
    >
      <MenuItem value={ItemGetAllOrderType.SellPriceAsc}>
        販売価格の昇順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.SellPriceDesc}>
        販売価格の降順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.ProductsStockNumberAsc}>
        総在庫数の昇順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.ProductsStockNumberDesc}>
        総在庫数の降順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.DisplayNameAsc}>名前の昇順</MenuItem>
      <MenuItem value={ItemGetAllOrderType.DisplayNameDesc}>
        名前の降順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.IdAsc}>作成日昇順</MenuItem>
      <MenuItem value={ItemGetAllOrderType.IdDesc}>作成日降順</MenuItem>
    </Select>
  );
};
