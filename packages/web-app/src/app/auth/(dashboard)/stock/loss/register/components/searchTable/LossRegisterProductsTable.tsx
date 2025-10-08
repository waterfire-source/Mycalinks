import {
  LossRegisterItemType,
  LossRegisterProductType,
} from '@/app/auth/(dashboard)/stock/loss/register/components/LossProductType';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { LossRegisterProductTableRow } from '@/app/auth/(dashboard)/stock/loss/register/components/searchTable/LossRegisterProductTableRow';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';

interface Props {
  height: string;
  lossRegisterItems: LossRegisterItemType[];
  searchState: ItemSearchState;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  hasMore: boolean;
  setLossRegisterItems: Dispatch<SetStateAction<LossRegisterItemType[]>>;
  setLossProducts: Dispatch<SetStateAction<LossRegisterProductType[]>>;
}

export const LossRegisterProductsTable = ({
  height,
  lossRegisterItems,
  searchState,
  setSearchState,
  hasMore,
  setLossRegisterItems,
  setLossProducts,
}: Props) => {
  const tableRef = useRef<HTMLDivElement>(null);
  // スクロールハンドラ（テーブル下部までスクロールしたら商品を再取得）
  const handleScroll = useCallback((): void => {
    if (!tableRef.current || searchState.isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    // スクロールが下端に近づいたら次のページを読み込む
    if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore) {
      setSearchState((prev: ItemSearchState) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }, [searchState.isLoading, hasMore, setSearchState]);

  // スクロールイベントリスナーの設定
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScroll);
      return () => tableElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        flexGrow: 1,
        overflowY: 'scroll',
        height: height,
      }}
      ref={tableRef}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ width: '10%', minWidth: '80px', textAlign: 'center' }}
            >
              商品
            </TableCell>
            <TableCell sx={{ width: '25%', textAlign: 'left' }}>
              商品名
            </TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'left' }}>状態</TableCell>
            <TableCell
              sx={{ minWidth: '70px', width: '10%', textAlign: 'left' }}
            >
              在庫数
            </TableCell>
            <TableCell sx={{ width: '15%', textAlign: 'left' }}>
              ロス数
            </TableCell>
            <TableCell sx={{ width: '10%', textAlign: 'left' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lossRegisterItems.map((item) => (
            <LossRegisterProductTableRow
              key={item.id}
              item={item}
              setLossRegisterItems={setLossRegisterItems}
              setLossProducts={setLossProducts}
            />
          ))}
        </TableBody>
      </Table>
      {searchState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </TableContainer>
  );
};
