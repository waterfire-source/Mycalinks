import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import { Store } from '@prisma/client';
import dayjs from 'dayjs';
import { useEffect } from 'react';

// Props の型を定義
interface Props {
  store: Store;
}

// 商品データの型定義
type Product = BackendProductAPI[0]['response']['200']['products'][0];

export const OutOfStockTodayCard = ({ store }: Props) => {
  const today = dayjs().startOf('day').format('YYYY-MM-DD');

  const { searchState, setSearchState, fetchProducts } = useStockSearch(
    store.id,
    {
      itemPerPage: 30, // 1ページあたりのアイテム数
      currentPage: 0, // 初期ページ
      stockChangeDateGte: today, // デフォルトで今日の日付を入れる
    },
  );

  useEffect(() => {
    fetchProducts();
  }, [searchState.stockChangeDateGte]);

  return (
    <Card sx={{ border: '1px solid #ccc', height: '100%' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Typography>本日在庫切れになった在庫一覧</Typography>
          </Box>
        }
        sx={{ borderBottom: '1px solid #ccc' }}
      />

      {/* カードコンテンツ */}
      <CardContent>
        <TableContainer sx={{ maxHeight: '420px', overflowY: 'auto' }}>
          {searchState.searchResults.length > 0 ? (
            <Table size="small">
              <TableBody>
                {searchState.searchResults
                  .filter((product: Product) => product.stock_number === 0)
                  .map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <ItemImage imageUrl={product.image_url} />
                      </TableCell>
                      <TableCell>{product.displayNameWithMeta}</TableCell>
                      <TableCell>
                        {product.condition_option_display_name}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <Typography color="textSecondary" sx={{ p: 2 }}>
              本日在庫切れになった商品はありません
            </Typography>
          )}
        </TableContainer>
      </CardContent>
    </Card>
  );
};
