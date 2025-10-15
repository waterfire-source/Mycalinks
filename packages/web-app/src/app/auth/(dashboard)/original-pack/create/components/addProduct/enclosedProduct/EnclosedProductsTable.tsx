import {
  useEffect,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { ColumnDef } from '@/components/tables/CustomTable';
import { InfiniteScrollCustomTable } from '@/components/tables/InfiniteScrollCustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { EnclosedProductAddButton } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/AddButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useSearchParams } from 'next/navigation';
import { ItemText } from '@/feature/item/components/ItemText';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';

interface Props {
  searchState: ItemSearchState;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  allSearchResults: EnclosedProduct[];
  setAllSearchResults: Dispatch<SetStateAction<EnclosedProduct[]>>;
  hasMore: boolean;
  isLoading: boolean;
  selectedProducts: EnclosedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<EnclosedProduct[]>>;
}

export const EnclosedProductsTable = ({
  searchState,
  setSearchState,
  allSearchResults,
  setAllSearchResults,
  hasMore,
  isLoading,
  selectedProducts,
  setSelectedProducts,
}: Props) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
      setSearchState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }, [searchState.isLoading, hasMore, setSearchState]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';

  return (
    <Box height="100%" overflow="scroll" ref={tableContainerRef}>
      <InfiniteScrollCustomTable<EnclosedProduct>
        columns={getColumns(
          allSearchResults,
          setAllSearchResults,
          selectedProducts,
          setSelectedProducts,
          isReplenishment,
        )}
        rows={allSearchResults}
        isLoading={isLoading || searchState.isLoading}
        rowKey={(item) => item.id}
        sx={{
          flex: 1,
          overflow: 'auto',
          height: 'auto',
        }}
      />
    </Box>
  );
};

const getColumns = (
  allSearchResults: EnclosedProduct[],
  setAllSearchResults: Dispatch<SetStateAction<EnclosedProduct[]>>,
  selectedProducts: EnclosedProduct[],
  setSelectedProducts: Dispatch<SetStateAction<EnclosedProduct[]>>,
  isReplenishment: boolean,
) => {
  const columns: ColumnDef<EnclosedProduct>[] = [
    {
      header: '商品画像',
      render: (product) => <ItemImage imageUrl={product.image_url} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => (
        <Stack>
          <ItemText
            text={product.displayNameWithMeta}
            sx={{ width: '150px' }}
          />
          <Typography>{getConditionDisplayName(product)}</Typography>
        </Stack>
      ),
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (product) => (
        <Typography>
          {product.average_wholesale_price?.toLocaleString()}円
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
            : product.stock_number.toLocaleString()}
        </Typography>
      ),
    },
    {
      header: isReplenishment ? '補充数' : '封入数',
      key: 'item_count',
      render: (product) => (
        <NumericTextField
          sx={{ width: '80px' }}
          value={product.item_count}
          onChange={(e) => {
            // 封入数を変更（在庫数を超えないように制限）
            const newValue = Math.min(
              e,
              product.is_infinite_stock ? Infinity : product.stock_number,
            );
            setAllSearchResults((prev) =>
              prev.map((p) =>
                p.id === product.id ? { ...p, item_count: newValue } : p,
              ),
            );
          }}
          max={product.is_infinite_stock ? undefined : product.stock_number}
        />
      ),
    },
    {
      header: '',
      key: 'add',
      render: (product) => (
        <EnclosedProductAddButton
          product={product}
          allSearchResults={allSearchResults}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      ),
    },
  ];
  return columns;
};
