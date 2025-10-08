'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import theme from '@/theme';

interface CustomerCardProps {
  customer?: BackendCustomerAPI['0']['response']['200'] | null;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  return (
    <TableContainer component={Paper} sx={{ height: '100%', boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              会員番号
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              会員コード
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              会員名
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '15%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              誕生日
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '15%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              入会日
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              保有ポイント
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '15%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              ポイント有効期限
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '15%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
              }}
            >
              最終来店日
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customer ? (
            <TableRow>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {customer.myca_user_id ? (
                  customer.id
                ) : (
                  <Typography color="primary">非会員</Typography>
                )}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {customer.myca_user_id}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {customer.full_name}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {dayjs(customer.birthday).format('YYYY/MM/DD')}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {dayjs(customer.registration_date).format('YYYY/MM/DD')}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {customer.owned_point}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {dayjs(customer.point_exp).format('YYYY/MM/DD')}
              </TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: 'grey.100', height: '56px' }}
              >
                {dayjs(customer.lastUsedDate).format('YYYY/MM/DD')}
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ height: '56px' }}>
                <Typography sx={{ color: 'text.primary' }}>
                  会員情報が読み込まれていません
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
