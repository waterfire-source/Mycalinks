import React, { useState, useMemo } from 'react';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
// import { ProductGetAllOrderType } from '@/app/api/store/[store_id]/product/api'; // import時にエラー吐かれたので一旦このファイルの中で定義(app/auth/(dashboard)/stock/components/NarrowDownComponent.tsxと同様の対応)
import { OriginalPackProduct } from '@/app/auth/(dashboard)/original-pack/page';
import { ItemText } from '@/feature/item/components/ItemText';

interface OriginalPackDisassemblyProductListProps {
  originalPackProducts: OriginalPackProduct[];
}
export const OriginalPackDisassemblyProductList: React.FC<
  OriginalPackDisassemblyProductListProps
> = ({ originalPackProducts }: OriginalPackDisassemblyProductListProps) => {
  // ソート用state
  const [selectedOrderType, setSelectedOrderType] = useState<
    ProductGetAllOrderType | 'not'
  >('not');
  // ソートハンドラ
  const isValidOrderBy = (value: string): value is ProductGetAllOrderType => {
    const values = Object.values(ProductGetAllOrderType);
    return values.includes(value as ProductGetAllOrderType);
  };
  const handleOrderByChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (isValidOrderBy(value)) {
      setSelectedOrderType(value);
    } else {
      setSelectedOrderType('not');
    }
  };

  const sortedProducts = useMemo(() => {
    if (!originalPackProducts) return [];

    const products = [...originalPackProducts];

    if (selectedOrderType === 'not') {
      return products;
    }

    return products.sort((a, b) => {
      switch (selectedOrderType) {
        case ProductGetAllOrderType.ActualSellPriceAsc:
          return (
            (a.sell_price ?? Number.MAX_VALUE) -
            (b.sell_price ?? Number.MAX_VALUE)
          );
        case ProductGetAllOrderType.ActualSellPriceDesc:
          return (
            (b.sell_price ?? Number.MIN_VALUE) -
            (a.sell_price ?? Number.MIN_VALUE)
          );
        case ProductGetAllOrderType.ActualBuyPriceAsc:
          return (
            (a.mean_wholesale_price ?? Number.MAX_VALUE) -
            (b.mean_wholesale_price ?? Number.MAX_VALUE)
          );
        case ProductGetAllOrderType.ActualBuyPriceDesc:
          return (
            (b.mean_wholesale_price ?? Number.MIN_VALUE) -
            (a.mean_wholesale_price ?? Number.MIN_VALUE)
          );
        case ProductGetAllOrderType.SellPriceUpdatedAtAsc:
          return (
            new Date(a.sell_price_updated_at ?? 0).getTime() -
            new Date(b.sell_price_updated_at ?? 0).getTime()
          );
        case ProductGetAllOrderType.SellPriceUpdatedAtDesc:
          return (
            new Date(b.sell_price_updated_at ?? 0).getTime() -
            new Date(a.sell_price_updated_at ?? 0).getTime()
          );
        case ProductGetAllOrderType.BuyPriceUpdatedAtAsc:
          return (
            new Date(a.buy_price_updated_at ?? 0).getTime() -
            new Date(b.buy_price_updated_at ?? 0).getTime()
          );
        case ProductGetAllOrderType.BuyPriceUpdatedAtDesc:
          return (
            new Date(b.buy_price_updated_at ?? 0).getTime() -
            new Date(a.buy_price_updated_at ?? 0).getTime()
          );
        case ProductGetAllOrderType.StockNumberAsc:
          return (
            (a.item_count ?? Number.MAX_VALUE) -
            (b.item_count ?? Number.MAX_VALUE)
          );
        case ProductGetAllOrderType.StockNumberDesc:
          return (
            (b.item_count ?? Number.MIN_VALUE) -
            (a.item_count ?? Number.MIN_VALUE)
          );
        case ProductGetAllOrderType.IdAsc:
          return (a.id ?? Number.MAX_VALUE) - (b.id ?? Number.MAX_VALUE);
        case ProductGetAllOrderType.IdDesc:
          return (b.id ?? Number.MIN_VALUE) - (a.id ?? Number.MIN_VALUE);
        default:
          return 0;
      }
    });
  }, [originalPackProducts, selectedOrderType]);

  // CustomTabTable 用のカラム定義
  const columns: ColumnDef<OriginalPackProduct>[] = [
    {
      header: '商品画像',
      render: (product) => (
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100%"
          minWidth={80}
        >
          <ItemImage imageUrl={product.image_url} />
        </Stack>
      ),
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => (
        <Stack
          alignItems="flex-start"
          justifyContent="center"
          height="100%"
          minWidth={240}
          flex={1}
        >
          <ItemText text={product.displayNameWithMeta} />
        </Stack>
      ),
    },
    {
      header: '状態',
      key: 'condition_option_display_name',
      render: (product) => (
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100%"
          minWidth={80}
        >
          {product.condition_option_display_name || '-'}
        </Stack>
      ),
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (
        product, // 仕入れ値は時期によって異なる可能性があり複数存在するため1プロダクトあたりの平均値を表示
      ) => (
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100%"
          minWidth={80}
        >
          {product.mean_wholesale_price
            ? `¥${product.mean_wholesale_price.toLocaleString()}`
            : '￥0'}
        </Stack>
      ),
    },
    {
      header: '販売価格',
      key: 'actual_sell_price',
      render: (product) => (
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100%"
          minWidth={80}
        >
          {product.actual_sell_price
            ? `¥${product.actual_sell_price?.toLocaleString()}`
            : '￥0'}
        </Stack>
      ),
    },
    {
      header: '封入数',
      key: 'item_count',
      render: (product) => (
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100%"
          minWidth={80}
        >
          {product.item_count}
        </Stack>
      ),
    },
  ];
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        width: '100%',
        overflowX: 'auto',
        flexDirection: 'column',
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          py: 1,
          px: 2,
          alignItems: 'center',
          justifyContent: 'end',
          backgroundColor: 'common.white',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.300',
        }}
      >
        {/* ソート */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id={'sort-filter-label'} sx={{ color: 'text.primary' }}>
              並び替え
            </InputLabel>
            <Select<string>
              labelId={'sort-label'}
              label={'並び替え'}
              value={selectedOrderType === 'not' ? '' : selectedOrderType}
              onChange={handleOrderByChange}
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
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          borderBottomRightRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      >
        <CustomTable<OriginalPackProduct>
          columns={columns}
          rows={sortedProducts || []}
          rowKey={(product) => product.id}
          sx={{
            height: '100%',
            '& .MuiTableContainer-root': {
              height: '100%',
              maxHeight: '100%',
            },
          }}
        />
      </Box>
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
