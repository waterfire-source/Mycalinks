import {
  useEffect,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ConsignmentItemTableRow } from '@/feature/consign/components/register/searchModal/contents/table/ItemTableRow';
import {
  ConsignmentItemType,
  ConsignmentProductSearchType,
} from '@/feature/consign/components/register/searchModal/type';
import { ProductAddButton } from '@/feature/item/components/modals/components/ProductAddButton';

interface Props {
  searchState: ItemSearchState;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  allSearchResults: ConsignmentItemType[];
  hasMore: boolean;
  enableManagementNumber: boolean;
  selectedSpecialtyId?: number;
  handleAdd: (
    product: ConsignmentProductSearchType,
    products: ConsignmentProductSearchType[],
    consignmentCount: number,
    consignmentPrice: number,
  ) => Promise<void>;
}

export const ConsignmentItemsTable = ({
  searchState,
  setSearchState,
  allSearchResults,
  hasMore,
  enableManagementNumber,
  selectedSpecialtyId,
  handleAdd,
}: Props) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (!tableContainerRef.current || searchState.isLoading) return;
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

  return (
    <TableContainer
      component={Paper}
      ref={tableContainerRef}
      sx={{
        borderRadius: 1,
        overflow: 'auto',
        height: '100%',
        width: '100%',
      }}
    >
      <Table
        stickyHeader
        sx={{
          tableLayout: 'fixed',
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <TableHead>
          <TableRow>
            {[
              { label: '商品画像', width: '15%' },
              { label: '商品', width: '30%' },
              { label: '状態', width: '10%' },
              { label: '委託価格', width: '15%' },
              { label: '現在庫', width: '10%' },
              { label: '委託数', width: '15%' },
              { label: '', width: '10%' },
            ].map(({ label, width }) => (
              <TableCell
                key={label}
                sx={{
                  width, // 各列の幅を適用
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
          {allSearchResults.length > 0 ? (
            allSearchResults.map((item) => (
              <ConsignmentItemTableRow
                key={item.id}
                item={item}
                handleAdd={handleAdd}
                enableManagementNumber={enableManagementNumber}
                selectedSpecialtyId={selectedSpecialtyId}
              />
            ))
          ) : !searchState.isLoading ? (
            <TableRow sx={{ width: '100%', height: '80px', overflow: 'auto' }}>
              <TableCell
                colSpan={7}
                sx={{ width: '100%', height: '100%', overflow: 'auto' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'column',
                  }}
                >
                  <ProductAddButton />
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
          {searchState.isLoading && (
            <TableRow sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
              <TableCell colSpan={7}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    flexDirection: 'column',
                  }}
                >
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    読み込み中...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
