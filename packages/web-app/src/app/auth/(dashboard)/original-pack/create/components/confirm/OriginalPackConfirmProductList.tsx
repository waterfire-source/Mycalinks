import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';
import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { Typography } from '@mui/material';
import { palette } from '@/theme/palette';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ItemText } from '@/feature/item/components/ItemText';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';

export const OriginalPackConfirmProductList = () => {
  const { enclosedProducts, handleSetEnclosedProducts } =
    useEnclosedProductContext();
  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');
  const { getLocalStorageItem } = useSaveLocalStorageOriginalPack();

  const columns: ColumnDef<EnclosedProduct>[] = [
    {
      header: '商品画像',
      key: 'image_url',
      render: (product) => <ItemImage imageUrl={product.image_url} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => <ItemText text={product.displayNameWithMeta} />,
      sx: {
        maxWidth: '150px',
      },
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (product) => (
        <Typography>
          {product.mean_wholesale_price?.toLocaleString()}円
        </Typography>
      ),
    },
    {
      header: '販売価格',
      key: 'sell_price',
      render: (product) => (
        <Typography>
          {product.actual_sell_price === null
            ? '-'
            : `${product.actual_sell_price.toLocaleString()}円`}
        </Typography>
      ),
    },
    {
      header: '在庫数',
      key: 'stock_number',
      render: (product) => (
        <Typography>
          {product.is_infinite_stock
            ? '∞'
            : `${product.stock_number.toLocaleString()} → ${
                product.stock_number - (product.item_count ?? 0)
              }`}
        </Typography>
      ),
    },
    {
      header: isReplenishment ? '補充数' : '封入数',
      key: 'item_count',
      render: (product) => (
        <Typography>{product.item_count?.toLocaleString()}</Typography>
      ),
    },
  ];
  const SortOption = {
    MEAN_WHOLESALE_PRICE_ASC: 'mean_wholesale_price_asc',
    MEAN_WHOLESALE_PRICE_DESC: 'mean_wholesale_price_desc',
    STOCK_NUMBER_ASC: 'stock_number_asc',
    STOCK_NUMBER_DESC: 'stock_number_desc',
    ITEM_COUNT_ASC: 'item_count_asc',
    ITEM_COUNT_DESC: 'item_count_desc',
  } as const;
  type SortOption = (typeof SortOption)[keyof typeof SortOption];
  const [sort, setSort] = useState<SortOption>(
    SortOption.MEAN_WHOLESALE_PRICE_ASC,
  );
  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSort(e.target.value as SortOption);
  };
  const sortedEnclosedProducts = [...enclosedProducts].sort((a, b) => {
    switch (sort) {
      case SortOption.MEAN_WHOLESALE_PRICE_ASC:
        return (a.mean_wholesale_price ?? 0) - (b.mean_wholesale_price ?? 0);
      case SortOption.MEAN_WHOLESALE_PRICE_DESC:
        return (b.mean_wholesale_price ?? 0) - (a.mean_wholesale_price ?? 0);
      case SortOption.STOCK_NUMBER_ASC:
        return a.stock_number - b.stock_number;
      case SortOption.STOCK_NUMBER_DESC:
        return b.stock_number - a.stock_number;
      case SortOption.ITEM_COUNT_ASC:
        return (a.item_count ?? 0) - (b.item_count ?? 0);
      case SortOption.ITEM_COUNT_DESC:
        return (b.item_count ?? 0) - (a.item_count ?? 0);
    }
  });

  // オリパ編集の場合、封入商品をローカルのoriginalPackProductsから取得
  useEffect(() => {
    if (!id) return;
    const data = getLocalStorageItem(Number(id) ?? 0);
    handleSetEnclosedProducts(data as EnclosedProduct[]);
  }, [id]);

  return (
    <Stack
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        backgroundColor: palette.common.white,
        borderRadius: '4px',
        height: '100%',
        overflow: 'scroll',
      }}
    >
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        px="12px"
        py="8px"
        gap="12px"
        borderBottom="1px solid"
        borderColor="grey.300"
      >
        <Typography>並び替え</Typography>
        <Select
          size="small"
          sx={{ width: '150px' }}
          value={sort}
          onChange={handleSortChange}
        >
          <MenuItem value={SortOption.MEAN_WHOLESALE_PRICE_ASC}>
            仕入れ値昇順
          </MenuItem>
          <MenuItem value={SortOption.MEAN_WHOLESALE_PRICE_DESC}>
            仕入れ値降順
          </MenuItem>
          <MenuItem value={SortOption.STOCK_NUMBER_ASC}>在庫数昇順</MenuItem>
          <MenuItem value={SortOption.STOCK_NUMBER_DESC}>在庫数降順</MenuItem>
          <MenuItem value={SortOption.ITEM_COUNT_ASC}>封入数昇順</MenuItem>
          <MenuItem value={SortOption.ITEM_COUNT_DESC}>封入数降順</MenuItem>
        </Select>
      </Stack>
      <CustomTable<EnclosedProduct>
        columns={columns}
        rows={sortedEnclosedProducts}
        rowKey={(item) => item.id}
      />
    </Stack>
  );
};
