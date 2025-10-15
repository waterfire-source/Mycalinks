'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'next/navigation';
import theme from '@/theme';
import { useAssessmentStatus } from '@/feature/transaction/hooks/useAssessmentStatus';

const AssessmentStatusConfirmation: React.FC = () => {
  const { storeId } = useParams(); //取引IDを取得
  const { transactions, fetchAssessmentStatus, isLoading } =
    useAssessmentStatus(Number(storeId));

  useEffect(() => {
    fetchAssessmentStatus();
  }, [fetchAssessmentStatus]);

  const tableHeaderCell = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    textAlign: 'center',
    borderRight: `1px solid ${theme.palette.grey[300]}`,
  };

  const tableBodyCell = (isAssessed: boolean) => ({
    textAlign: 'center',
    fontWeight: 'bold' as const,
    color: isAssessed ? theme.palette.primary.main : '', // 査定済みの場合は文字色を白に
  });

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        gap: 4,
      }}
    >
      {/* ページタイトル */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          査定状況
        </Typography>
      </Box>

      {/* テーブル */}
      <TableContainer
        component={Paper}
        sx={{ height: '80%', maxHeight: '80vh' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderCell}>受付番号</TableCell>
              <TableCell sx={tableHeaderCell}>査定状況</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  本日の査定はまだありません。
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell sx={tableBodyCell(transaction.buy__is_assessed)}>
                    {transaction.reception_number}
                  </TableCell>
                  <TableCell sx={tableBodyCell(transaction.buy__is_assessed)}>
                    {transaction.buy__is_assessed ? '査定完了' : '査定中'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AssessmentStatusConfirmation;
