import { ProductEcOrderHistoryList } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ProductEcOrderHistory/ProductEcOrderHistoryList';
import { useStore } from '@/contexts/StoreContext';
import { useProductEcOrderHistory } from '@/feature/products/hooks/useGetProductEcOrderHistory';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';

interface Props {
  productId: number;
}

export const ProductEcOrderHistory = ({ productId }: Props) => {
  const { store } = useStore();
  const { searchState, setSearchState, fetchEcOrderHistory } =
    useProductEcOrderHistory(productId, store.id, {
      includesSummary: true, // サマリーを含めるかどうか
    });

  // 初回取得
  useEffect(() => {
    fetchEcOrderHistory();
  }, [fetchEcOrderHistory]);

  const isValidOrderBy = (value: string): value is OrderByType => {
    const values = Object.values(OrderByType);
    return values.includes(value as OrderByType);
  };

  const handleOrderByChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      orderBy:
        event.target.value === 'not'
          ? undefined
          : isValidOrderBy(event.target.value)
          ? (event.target.value as OrderByType)
          : undefined, // 不正な値は `undefined` にする
    }));
  };
  return (
    <Stack mr={1}>
      <Typography fontWeight="bold">EC販売履歴</Typography>
      <Stack
        sx={{
          backgroundColor: 'white',
          flex: 1,
          borderTop: '8px solid #b82a2a',
          height: 700,
        }}
        mt={1}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          mt={1}
          pr={1}
          spacing={1}
        >
          <Typography>並び替え</Typography>
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
              <MenuItem value={OrderByType.OrderedAt}>
                受注日時（販売日時）
              </MenuItem>
              <MenuItem value={OrderByType.TotalUnitPrice}>単価</MenuItem>
              <MenuItem value={OrderByType.ItemCount}>販売数</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <ProductEcOrderHistoryList
          productEcOrderHistoryInfo={searchState}
          setSearchState={setSearchState}
        />
        <Stack
          direction="row"
          sx={{
            height: 50,
            borderTop: '1px solid',
            borderTopColor: 'grey.300',
          }}
        ></Stack>
      </Stack>
    </Stack>
  );
};

const OrderByType = {
  OrderedAt: 'ordered_at', // 受注日時（販売日時）
  TotalUnitPrice: 'total_unit_price', //単価
  ItemCount: 'item_count', // 販売数
} as const;
type OrderByType = (typeof OrderByType)[keyof typeof OrderByType];
