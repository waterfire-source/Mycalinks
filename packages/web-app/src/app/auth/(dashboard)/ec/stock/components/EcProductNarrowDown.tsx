import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
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
import React, { useEffect } from 'react';

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
}

export const EcProductNarrowDown = ({ searchState, setSearchState }: Props) => {
  const { category, fetchCategoryList } = useCategory(false, true);
  const { store } = useStore();
  useEffect(() => {
    fetchCategoryList();
  }, [store.id, fetchCategoryList]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      itemCategoryId:
        event.target.value === 'all' ? null : Number(event.target.value),
    }));
  };

  const handleStateChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      conditionOptionId:
        event.target.value === 'all' ? null : Number(event.target.value),
    }));
  };

  const isValidOrderBy = (value: string): value is ProductGetAllOrderType => {
    const values = Object.values(ProductGetAllOrderType);
    return values.includes(value as ProductGetAllOrderType);
  };

  const handleOrderByChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      orderBy:
        event.target.value === 'not'
          ? undefined
          : isValidOrderBy(event.target.value)
          ? (event.target.value as ProductGetAllOrderType)
          : undefined, // 不正な値は `undefined` にする
    }));
  };

  const handleMycalinksEcEnabled = (event: SelectChangeEvent<string>) => {
    let isEnabled: boolean | undefined;
    if (event.target.value === 'enabled') {
      isEnabled = true;
    } else if (event.target.value === 'disabled') {
      isEnabled = false;
    } else {
      isEnabled = undefined;
    }
    setSearchState((prev) => ({
      ...prev,
      mycalinksEcEnabled: isEnabled,
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
      <Box display="flex" gap={2}>
        {/* 商品カテゴリ */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }}>商品カテゴリ</InputLabel>
          <Select
            value={
              searchState.itemCategoryId !== null
                ? String(searchState.itemCategoryId)
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
        {/* 状態 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }}>状態</InputLabel>
          <Select
            value={
              searchState.conditionOptionId !== null
                ? String(searchState.conditionOptionId)
                : 'all'
            }
            onChange={handleStateChange}
            label="状態"
          >
            <MenuItem value="all">すべて</MenuItem>
            {category?.itemCategories
              .filter((item) => item.condition_options !== undefined)
              .flatMap((item) =>
                item.condition_options.map((condition) => (
                  <MenuItem key={condition.id} value={condition.id}>
                    {condition.display_name}
                  </MenuItem>
                )),
              )}
          </Select>
        </FormControl>
        {/* マイカリンクスEC表示状態で絞り込み */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          {/* 
            valueの意味:
            - 'all' : すべての商品を表示
            - 'enabled' : 出品中の商品のみ
            - 'disabled' : 未出品の商品のみ
            searchState.mycalinksEcEnabled の値によって切り替え
          */}
          <Select
            value={
              searchState.mycalinksEcEnabled === undefined ||
              searchState.mycalinksEcEnabled === null
                ? 'all'
                : searchState.mycalinksEcEnabled
                ? 'enabled'
                : 'disabled'
            }
            // onChangeの挙動:
            // ''（すべて）を選択した場合はundefinedをセット
            // それ以外はそのままイベントを渡す
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                handleMycalinksEcEnabled({
                  target: { value: 'all' },
                } as SelectChangeEvent<string>);
              } else {
                handleMycalinksEcEnabled(e);
              }
            }}
            displayEmpty
          >
            {/* メニューの意味:
                - すべての商品を表示: フィルタなし
                - 出品中の商品のみ: mycalinksEcEnabled=true
                - 未出品の商品のみ: mycalinksEcEnabled=false
            */}
            <MenuItem value="all">すべての商品を表示</MenuItem>
            <MenuItem value="enabled">出品中の商品のみ</MenuItem>
            <MenuItem value="disabled">未出品の商品のみ</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
        {/* 並び替え */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ color: 'black' }}>並び替え</InputLabel>
          <Select
            value={
              searchState.orderBy !== undefined ? searchState.orderBy : 'not'
            }
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
      </Stack>
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
