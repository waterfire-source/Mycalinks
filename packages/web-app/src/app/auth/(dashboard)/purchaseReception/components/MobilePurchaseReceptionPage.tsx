import { useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  CircularProgress,
  Link,
} from '@mui/material';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import theme from '@/theme';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useStore } from '@/contexts/StoreContext';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { formatTime } from '@/utils/day';
import { PATH } from '@/constants/paths';

const StyledTableCell = styled(TableCell)(
  ({ theme, width }: { theme: any; width?: string }) => ({
    backgroundColor: theme.palette.grey[500],
    padding: 2,
    color: theme.palette.common.white,
    width: width || 'auto',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
);

const BodyTableCell = styled(TableCell)(() => ({
  textAlign: 'center',
  padding: '8px',
  wordBreak: 'break-word',
}));

export const MobilePurchaseReceptionPage = () => {
  const { store } = useStore();
  const {
    fetchUnassessedTransactions,
    unassessedTransactions,
    isLoadingUnassessed,
  } = usePurchaseTransaction();

  useEffect(() => {
    if (store.id) {
      // 未査定の取引データを取得
      fetchUnassessedTransactions(store.id);
    }
  }, [fetchUnassessedTransactions, store.id]);

  return (
    <Stack
      flexDirection={'column'}
      gap={1}
      width={'100%'}
      height={'100%'}
      padding={'10px'}
    >
      <Stack
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Stack direction={'row'} gap={0}>
          <MonetizationOnIcon sx={{ color: theme.palette.grey[700] }} />
          <Typography variant="body1">買取</Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.500',
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          overflowY: 'auto',
        }}
      >
        <TableContainer component={Paper} sx={{ height: '100%' }}>
          <Table sx={{ height: '100%' }} stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell width="20%" theme={theme}>
                  買取番号
                </StyledTableCell>
                <StyledTableCell width="35%" theme={theme}>
                  お客様
                </StyledTableCell>
                <StyledTableCell width="20%" theme={theme}>
                  受付時間
                </StyledTableCell>
                <StyledTableCell width="25%" theme={theme}></StyledTableCell>
              </TableRow>
            </TableHead>
            {isLoadingUnassessed ? (
              <TableBody sx={{ height: '100%' }}>
                <TableRow
                  sx={{
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : unassessedTransactions.length === 0 ? (
              <TableBody sx={{ height: '100%' }}>
                <TableRow
                  sx={{
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.primary">
                      取引データがありません。
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {unassessedTransactions.map((row, index) => (
                  <TableRow key={index}>
                    <BodyTableCell>{row.id}</BodyTableCell>
                    <BodyTableCell>{row.customer_name}</BodyTableCell>
                    <BodyTableCell>{formatTime(row.created_at)}</BodyTableCell>
                    <BodyTableCell>
                      <Link
                        href={PATH.PURCHASE_RECEPTION.transaction.purchase(
                          row.id,
                        )}
                      >
                        <PrimaryButton sx={{ padding: 0.5 }}>
                          査定
                        </PrimaryButton>
                      </Link>
                    </BodyTableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
};
