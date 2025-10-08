import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { DetailComponent } from '@/app/auth/(dashboard)/stock/components/detailModal/DetailComponent';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Product_Wholesale_Price_History } from '@prisma/client';
import dayjs from 'dayjs';

interface Props {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  originalWholesalePrices?: Array<Product_Wholesale_Price_History>;
  onCancelSpecialPrice?: () => void;
  loading?: boolean;
  fetchProducts: () => Promise<void>;
  fetchAllProducts?: () => Promise<void>;
}

export const PurchaseDetail = ({
  detailData,
  originalWholesalePrices,
  onCancelSpecialPrice,
  loading,
  fetchProducts,
  fetchAllProducts,
}: Props) => {
  // 選択された仕入れ方法に基づいてデータを絞り込む
  const filteredWholesalePrices = originalWholesalePrices?.sort((a, b) => {
    return new Date(b.arrived_at).getTime() - new Date(a.arrived_at).getTime();
  });

  return (
    <Grid container spacing={1} sx={{ height: '100%' }}>
      <Grid item xs={4} sx={{ height: '100%' }}>
        <DetailComponent
          detailData={detailData}
          fetchProducts={fetchProducts}
          onCancelSpecialPrice={onCancelSpecialPrice}
          loading={loading}
          fetchAllProducts={fetchAllProducts}
        />
      </Grid>
      <Grid item xs={8} sx={{ height: '100%' }}>
        <Box
          sx={{
            borderTop: '4px solid #b82a2a',
            bgcolor: 'white',
            mt: 2,
          }}
        >
          <Box>
            <TableContainer
              sx={{
                maxHeight: '550px',
                boxShadow: '0px 4px 10px rgba(128, 128, 128, 0.2)',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>仕入れ値</TableCell>
                    <TableCell>仕入れ日時</TableCell>
                    <TableCell>仕入れ数</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWholesalePrices &&
                  filteredWholesalePrices.length > 0 ? (
                    filteredWholesalePrices.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell>{option.unit_price} 円</TableCell>
                        <TableCell>
                          {dayjs(option.arrived_at).format('YYYY/MM/DD')}
                        </TableCell>
                        <TableCell>{option.item_count}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        表示するデータがありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
