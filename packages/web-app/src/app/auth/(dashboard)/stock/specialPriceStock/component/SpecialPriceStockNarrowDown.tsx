import { CategoryFilter } from '@/feature/products/components/filters/CategoryFilter';
import { SortOrderFilter } from '@/feature/products/components/filters/SortOrderFilter';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Box, Stack } from '@mui/material';

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
}

export const SpecialPriceStockNarrowDown = ({ setSearchState }: Props) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      sx={{ m: 1 }}
      gap={2}
    >
      <Stack direction="row" spacing={1}>
        {/* 商品カテゴリ */}
        <CategoryFilter setProductSearchState={setSearchState} />
      </Stack>

      {/* 並び替え */}
      <SortOrderFilter setProductSearchState={setSearchState} />
    </Box>
  );
};

const ProductGetAllOrderType = {
  ActualSellPriceAsc: 'actual_sell_price', // 実際販売価格の昇順
  ActualSellPriceDesc: '-actual_sell_price', // 実際販売価格の降順
  ActualBuyPriceAsc: 'actual_buy_price', // 実際買取価格の昇順
  ActualBuyPriceDesc: '-actual_buy_price', // 実際買取価格の降順
  SellPriceUpdatedAtAsc: 'sell_price_updated_at', // 販売価格の最終更新日時の昇順
  SellPriceUpdatedAtDesc: '-sell_price_updated_at', // 販売価格の最終更新日時の降順
  BuyPriceUpdatedAtAsc: 'buy_price_updated_at', // 買取価格の最終更新日時の昇順
  BuyPriceUpdatedAtDesc: '-buy_price_updated_at', // 買取価格の最終更新日時の降順
  StockNumberAsc: 'stock_number', // 在庫数の昇順
  StockNumberDesc: '-stock_number', // 在庫数の降順
  IdAsc: 'id', // IDの昇順
  IdDesc: '-id', // IDの降順
} as const;
type ProductGetAllOrderType =
  (typeof ProductGetAllOrderType)[keyof typeof ProductGetAllOrderType];
