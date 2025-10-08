import { useListStocking } from '@/feature/arrival/hooks/useListStocking';
import { ArrivalProductsCell } from '@/feature/arrival/manage/arrivalList/cell/Products';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Store } from '@prisma/client';
import { useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';

interface Props {
  store: Store;
}

export const ArrivalCard = ({ store }: Props) => {
  const router = useRouter();
  const { listStocking, stockings } = useListStocking();

  const listStockingWithQuery = useCallback(async () => {
    await listStocking({ status: 'NOT_YET' });
  }, [listStocking]);

  useEffect(() => {
    listStockingWithQuery();
  }, [listStocking, listStockingWithQuery]);

  return (
    <Card
      sx={{
        border: '1px solid #ccc',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* カードヘッダー */}
      <CardHeader
        title={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
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
              <Typography>入荷予定</Typography>
            </Box>
            <Typography
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={() => {
                router.push(PATH.ARRIVAL.root);
              }}
            >
              発注管理へ
            </Typography>
          </Box>
        }
        sx={{ borderBottom: '1px solid #ccc' }}
      />

      {/* カードコンテンツ */}
      <CardContent
        sx={{
          flex: 1, // 残りスペースを全て使用
          overflow: 'hidden',
          p: 0,
          '&:last-child': {
            pb: 0,
          },
        }}
      >
        <TableContainer
          sx={{
            height: '100%',
            overflowY: 'auto',
            // スクロールバーのカスタマイズ
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
          }}
        >
          {stockings.length > 0 ? (
            <Table size="small" stickyHeader>
              <TableBody>
                {stockings.map((stocking) => {
                  const formattedDate = dayjs(stocking.planned_date).format(
                    'MM/DD',
                  );
                  const isToday = dayjs(stocking.planned_date).isSame(
                    dayjs(),
                    'day',
                  ); // ✅ 本日の日付を判定

                  return (
                    <TableRow key={stocking.id}>
                      <TableCell
                        sx={{
                          width: '10%',
                          color: isToday ? 'red' : 'inherit',
                          p: 1,
                        }}
                      >
                        {formattedDate}
                      </TableCell>

                      <TableCell sx={{ width: '50%', p: 1 }}>
                        <ArrivalProductsCell
                          products={stocking.stocking_products}
                          hasMultipleStore={false}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          width: '40%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '0px',
                          p: 1,
                        }}
                      >
                        {stocking.supplier_name}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography color="textSecondary" sx={{ p: 2 }}>
              入荷予定はありません。
            </Typography>
          )}
        </TableContainer>
      </CardContent>
    </Card>
  );
};
