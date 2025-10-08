// 現在使用していないコンポーネント
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CircularProgress,
} from '@mui/material';
import theme from '@/theme';
import { RegisterCashHistorySourceKind } from '@prisma/client';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { getRegisterCashHistoryDef } from '@/app/api/store/[store_id]/register/def';
import dayjs from 'dayjs';

type Props = {
  cashHistories: typeof getRegisterCashHistoryDef.response.history;
  isLoading: boolean;
};

export const CashTable = ({ cashHistories, isLoading }: Props) => {
  const colorDict = Object.assign({}, RegisterCashHistorySourceKind, {
    import: 'secondary.main',
    export: 'primary.main',
  });
  const sourceDict =
    mycaPosCommonConstants.displayNameDict.register.cashHistory.sourceKind;

  //tableのスタイル
  const tableHeaderCell = {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.text.secondary,
    textAlign: 'center',
  };

  return (
    <>
      <TableContainer sx={{ height: '100%', width: '100%' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '10%', ...tableHeaderCell }}>
                区分
              </TableCell>
              <TableCell sx={{ width: '15%', ...tableHeaderCell }}>
                金額
              </TableCell>
              <TableCell sx={{ width: '20%', ...tableHeaderCell }}>
                日時
              </TableCell>
              <TableCell sx={{ width: '15%', ...tableHeaderCell }}>
                担当者
              </TableCell>
              <TableCell sx={{ width: '40%', ...tableHeaderCell }}>
                理由
              </TableCell>
            </TableRow>
          </TableHead>
          {!isLoading ? (
            <TableBody>
              {cashHistories.map((row, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      color: colorDict[row.source_kind],
                      fontWeight: 'bold',
                      textAlign: 'center',
                      width: '10%',
                    }}
                  >
                    {sourceDict[row.source_kind]}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colorDict[row.source_kind],
                      textAlign: 'center',
                      width: '15%',
                    }}
                  >
                    {row.change_price.toLocaleString()}円
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      width: '20%',
                    }}
                  >
                    {dayjs(row.datetime).format('YYYY/MM/DD HH:mm')}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      width: '15%',
                    }}
                  >
                    {row.staff_display_name}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      width: '40%',
                    }}
                  >
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    height: '200px',
                    padding: 0,
                    border: 'none',
                  }}
                >
                  <CircularProgress sx={{ color: 'rgba(184, 42, 42, 1)' }} />
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </>
  );
};
