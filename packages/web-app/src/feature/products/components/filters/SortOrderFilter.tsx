import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';
import { useState } from 'react';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';

interface Props {
  setProductSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
  formControlSx?: SxProps<Theme>;
}

const ProductGetAllOrderType = {
  ActualSellPriceAsc: 'actual_sell_price',
  ActualSellPriceDesc: '-actual_sell_price',
  ActualBuyPriceAsc: 'actual_buy_price',
  ActualBuyPriceDesc: '-actual_buy_price',
  SellPriceUpdatedAtAsc: 'sell_price_updated_at',
  SellPriceUpdatedAtDesc: '-sell_price_updated_at',
  BuyPriceUpdatedAtAsc: 'buy_price_updated_at',
  BuyPriceUpdatedAtDesc: '-buy_price_updated_at',
  StockNumberAsc: 'stock_number',
  StockNumberDesc: '-stock_number',
  IdAsc: 'id',
  IdDesc: '-id',
} as const;

type ProductGetAllOrderType =
  (typeof ProductGetAllOrderType)[keyof typeof ProductGetAllOrderType];

export const SortOrderFilter = ({
  setProductSearchState,
  formControlSx,
}: Props) => {
  const [selectValue, setSelectValue] = useState<string>('not');
  // 型チェック関数
  const isValidOrderBy = (value: string): value is ProductGetAllOrderType => {
    const values = Object.values(ProductGetAllOrderType);
    return values.includes(value as ProductGetAllOrderType);
  };

  const handleOrderByChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectValue(value);
    
    setProductSearchState((prev) => ({
      ...prev,
      orderBy:
        value === 'not'
          ? undefined
          : isValidOrderBy(value)
          ? (value as ProductGetAllOrderType)
          : undefined,
      resetPage: true,
    }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        ...formControlSx,
      }}
    >
      <Typography
        sx={{
          whiteSpace: 'nowrap',
        }}
      >
        並び替え
      </Typography>
      <FormControl size="small" sx={{ minWidth: 100 }}>
        <InputLabel sx={{ color: 'black' }} shrink>
          並び替え
        </InputLabel>
        <Select
          value={selectValue}
          onChange={handleOrderByChange}
          label="並び替え"
        >
          <MenuItem value="not">なし</MenuItem>
          <MenuItem value={ProductGetAllOrderType.ActualSellPriceAsc}>
            販売価格昇順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.ActualSellPriceDesc}>
            販売価格降順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.ActualBuyPriceAsc}>
            買取価格昇順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.ActualBuyPriceDesc}>
            買取価格降順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.SellPriceUpdatedAtAsc}>
            販売価格更新日昇順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.SellPriceUpdatedAtDesc}>
            販売価格更新日降順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.BuyPriceUpdatedAtAsc}>
            買取価格更新日昇順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.BuyPriceUpdatedAtDesc}>
            買取価格更新日降順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.StockNumberAsc}>
            在庫数昇順
          </MenuItem>
          <MenuItem value={ProductGetAllOrderType.StockNumberDesc}>
            在庫数降順
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};