import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
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
  setSearchState: (value: SetStateAction<ProductSearchState>) => void;
}
export const ProductSortSelect = ({ sx, setSearchState }: Props) => {
  const [sort, setSort] = useState<ItemGetAllOrderType>(
    ItemGetAllOrderType.SellPriceAsc,
  );
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSort(event.target.value as ItemGetAllOrderType);
    setSearchState((prevState) => ({
      ...prevState,
      orderBy: event.target.value as ProductSearchState['orderBy'],
    }));
  };

  return (
    <Select
      size="small"
      value={sort}
      onChange={handleSortChange}
      sx={{ width: '200px', backgroundColor: 'common.white', ...sx }}
    >
      <MenuItem value={ItemGetAllOrderType.SellPriceAsc}>
        販売価格の昇順
      </MenuItem>
      <MenuItem value={ItemGetAllOrderType.SellPriceDesc}>
        販売価格の降順
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
