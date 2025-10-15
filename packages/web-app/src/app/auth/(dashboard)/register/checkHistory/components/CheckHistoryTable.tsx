import React from 'react';
import { Typography } from '@mui/material';
import { RegisterSettlementKind } from '@prisma/client';
import dayjs from 'dayjs';
import {
  InfiniteScrollCustomTable,
  ColumnDef,
} from '@/components/tables/InfiniteScrollCustomTable';
import { PrintCloseReceiptButton } from '@/app/auth/(dashboard)/register/checkHistory/components/PrintCloseReceiptButton';
import type { RegisterAPIRes } from '@/api/frontend/register/api';
type RegisterSettlementRow =
  RegisterAPIRes['listRegisterSettlement']['settlements'][0];

interface CheckHistoryTableProps {
  rows: RegisterSettlementRow[];
  isLoading: boolean;
  registerMap: Map<number, string>;
  accountMap: Map<number, string>;
  onRowClick: (row: RegisterSettlementRow) => void;
}

export const CheckHistoryTable: React.FC<CheckHistoryTableProps> = ({
  rows,
  isLoading,
  registerMap,
  accountMap,
  onRowClick,
}) => {
  const columns: ColumnDef<RegisterSettlementRow>[] = [
    {
      header: '点検日時',
      render: (row) => (
        <Typography>
          {row.created_at
            ? dayjs(row.created_at).format('YYYY/MM/DD HH:mm:ss')
            : '-'}
        </Typography>
      ),
      sx: { width: '10%', minWidth: 100 },
    },
    {
      header: '点検区分',
      render: (row) => {
        const kindLabels: Record<RegisterSettlementKind, string> = {
          [RegisterSettlementKind.OPEN]: '開店時',
          [RegisterSettlementKind.MIDDLE]: '中間',
          [RegisterSettlementKind.CLOSE]: '閉店時',
        };
        return <Typography>{kindLabels[row.kind] ?? '-'}</Typography>;
      },
      sx: { width: '10%', minWidth: 80 },
    },
    {
      header: '対象レジ',
      render: (row) => {
        if (row.register_id == null) {
          return <Typography>全て</Typography>;
        }
        return (
          <Typography>{registerMap.get(row.register_id) ?? '-'}</Typography>
        );
      },
      sx: { width: '10%', minWidth: 80 },
    },
    {
      header: '担当者',
      render: (row) => (
        <Typography>{accountMap.get(row.staff_account_id) ?? '-'}</Typography>
      ),
      sx: { width: '10%', minWidth: 80 },
    },
    {
      header: '点検時現金',
      render: (row) => (
        <Typography>
          {row.actual_cash_price != null
            ? `${row.actual_cash_price.toLocaleString()} 円`
            : '-'}
        </Typography>
      ),
      sx: { width: '15%', minWidth: 100 },
    },
    {
      header: '過不足',
      render: (row) => {
        const value = row.difference_price;
        let color: string | undefined = undefined;

        if (value != null) {
          if (value >= 1) {
            color = 'secondary.main';
          } else if (value <= -1) {
            color = 'primary.main';
          }
        }

        return (
          <Typography sx={{ color }}>
            {value != null ? `${value.toLocaleString()} 円` : '-'}
          </Typography>
        );
      },
      sx: { width: '15%', minWidth: 80 },
    },
    {
      header: '',
      render: (row) => (
        <PrintCloseReceiptButton settlement={row} title="再印刷" />
      ),
      sx: { width: '10%', minWidth: 60 },
    },
  ];

  return (
    <InfiniteScrollCustomTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      onRowClick={onRowClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        '& .MuiTableContainer-root': {
          flex: 1,
          overflow: 'auto',
        },
        '& .MuiTable-root': {
          tableLayout: 'fixed',
        },
        '& .MuiTableHead-root': {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'white',
        },
        '& .MuiTableRow-root': {
          height: '60px',
          cursor: 'pointer',
        },
      }}
    />
  );
};
