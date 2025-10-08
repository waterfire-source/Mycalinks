import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
} from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { ItemText } from '@/feature/item/components/ItemText';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ConditionChip } from '@/feature/products/components/ConditionChip';

const StyledTableCell = styled(TableCell)(() => ({
  textAlign: 'center',
}));

interface BundleSetTableProps {
  products: CountableProductType[];
  isLoading: boolean;
}

const BundleSetTable: React.FC<BundleSetTableProps> = ({
  products,
  isLoading,
}) => {
  return (
    <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell>商品画像</StyledTableCell>
            <StyledTableCell>商品名</StyledTableCell>
            <StyledTableCell>状態</StyledTableCell>
            <StyledTableCell>販売価格</StyledTableCell>
            <StyledTableCell>在庫数</StyledTableCell>
            <StyledTableCell>封入数</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: 'white' }}>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 2,
                  }}
                >
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  '& .MuiTableCell-root': 'inherit',
                  '&:hover': {
                    '& .MuiTableCell-root': 'grey.100',
                  },
                  backgroundColor: 'inherit',
                }}
              >
                <StyledTableCell>
                  <ItemImage imageUrl={product.image_url} height={80} />
                </StyledTableCell>
                <StyledTableCell sx={{ width: '40%' }}>
                  <ItemText text={product.displayNameWithMeta} wrap={true} />
                </StyledTableCell>
                <StyledTableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ConditionChip condition={product.condition.displayName} />
                  </Box>
                </StyledTableCell>
                <StyledTableCell>
                  {/* TODO actual_sell_priceを利用する */}
                  {product.sell_price !== null
                    ? `${
                        product.specific_sell_price
                          ? product.specific_sell_price.toLocaleString()
                          : product.sell_price.toLocaleString()
                      }円`
                    : '-'}
                </StyledTableCell>
                <StyledTableCell>
                  {product.real_stock_number
                    ? `${product.real_stock_number.toLocaleString()}`
                    : '-'}
                </StyledTableCell>
                <StyledTableCell>{product.stock_number}</StyledTableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BundleSetTable;
