import React from 'react';
import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableFooter,
  TablePagination,
  CircularProgress,
  TableBody,
  Typography,
} from '@mui/material';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { PurchaseSearchResultTableBody } from '@/feature/purchaseReception/components/tables/PurchaseSearchResultTableBody';
import { ProductAddButton } from '@/feature/item/components/modals/components/ProductAddButton';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
interface Props {
  items: BackendItemAPI[0]['response']['200']['items'][0][];
  quantities: {
    [productId: number]: number;
  };
  prices: {
    [productId: number]: number;
  };
  selectedSpecialty: Specialties[number] | null;
  specialties: Specialties;
  resultCount: number;
  onQuantityChange: (index: number, quantity: number) => void;
  onPriceChange: (index: number, price: number) => void;
  currentPage: number;
  itemsPerPage: number;
  isLoading: boolean;
  onAddToCart: (
    productId: number,
    row: BackendItemAPI[0]['response']['200']['items'][0],
  ) => void;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newSize: number) => void;
  isCreateSpecialtyProductLoading: boolean;
}

export const PurchaseSearchResultTable: React.FC<Props> = ({
  items,
  quantities,
  prices,
  selectedSpecialty,
  specialties,
  resultCount,
  onQuantityChange,
  onPriceChange,
  currentPage,
  itemsPerPage,
  isLoading,
  onAddToCart,
  handlePageChange,
  handlePageSizeChange,
  isCreateSpecialtyProductLoading,
}) => {
  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          position: 'relative',
          overflowY: 'auto',
          borderRadius: '4px 4px 0 0',
          border: '1px solid',
          borderColor: 'divider',
          flexGrow: 1,
          boxShadow: 0,
        }}
      >
        <Table
          stickyHeader
          sx={{
            height: '100%',
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              {[
                { label: '商品画像', width: '15%' },
                { label: '商品', width: '25%' },
                { label: '状態', width: '10%' },
                { label: '現在庫', width: '10%' },
                { label: '査定額', width: '15%' },
                { label: '数量', width: '15%' },
                { label: '', width: '10%' },
              ].map(({ label, width }) => (
                <TableCell
                  key={label}
                  sx={{
                    width,
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '16px 8px',
                    zIndex: 1,
                    position: 'sticky',
                    top: 0,
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      flexDirection: 'column',
                      py: 4,
                    }}
                  >
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      読み込み中...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : items.length > 0 ? (
            <PurchaseSearchResultTableBody
              items={items}
              quantities={quantities}
              prices={prices}
              onQuantityChange={onQuantityChange}
              onPriceChange={onPriceChange}
              onAddToCart={onAddToCart}
              selectedSpecialty={selectedSpecialty}
              isCreateSpecialtyProductLoading={isCreateSpecialtyProductLoading}
            />
          ) : (
            <TableBody>
              <TableRow sx={{ width: '100%', height: '80px' }}>
                <TableCell colSpan={6}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      flexDirection: 'column',
                      py: 4,
                    }}
                  >
                    <ProductAddButton />
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row-reverse',
          border: '1px solid',
          borderTop: 'none',
          borderColor: 'divider',
          backgroundColor: 'white',
        }}
      >
        <TableFooter>
          <TableRow>
            <TablePagination
              component="div"
              labelRowsPerPage="表示件数:"
              rowsPerPageOptions={[30, 50, 100, 200]}
              count={resultCount}
              rowsPerPage={itemsPerPage}
              page={currentPage}
              onPageChange={(event, newPage) => handlePageChange(newPage)}
              onRowsPerPageChange={(event) =>
                handlePageSizeChange(parseInt(event.target.value, 10))
              }
              sx={{
                '.MuiTablePagination-toolbar': {
                  padding: 0,
                },
              }}
            />
          </TableRow>
        </TableFooter>
      </Box>
    </>
  );
};
