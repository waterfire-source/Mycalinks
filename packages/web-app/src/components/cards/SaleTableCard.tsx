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
  IconButton,
  Tooltip,
  Box,
  Zoom,
  Typography,
} from '@mui/material';
import { Add, Remove, Delete, LocalOffer } from '@mui/icons-material';
import { TableData } from '@/types/TableData';
import NumericTextField from '@/components/inputFields/NumericTextField';
import Image from 'next/image';
import NoImg from '@/components/common/NoImg';
import theme from '@/theme';

interface Props {
  data: TableData[];
  onUpdateQuantity?: (id: number, newQuantity: number) => void;
  onDeleteRow?: (id: number) => void;
  onOpenDiscountModal?: (id: number) => void; // 割引モーダルを開く関数
  onUpdateUnitPrice: (id: number, newUnitPrice: number) => void;
}

const SaleTableCard: React.FC<Props> = ({
  data,
  onUpdateQuantity,
  onDeleteRow,
  onOpenDiscountModal,
  onUpdateUnitPrice,
}) => {
  const handleIncrement = (id: number) => {
    if (!onUpdateQuantity) return;
    const row = data.find((row) => row.id === id);
    if (row) {
      const currentQuantity = data
        .filter((item) => item.productId === row.productId && item.id !== id)
        .reduce((sum, item) => sum + item.quantity, 0);

      const totalQuantity = currentQuantity + row.quantity;

      if (totalQuantity < row.stockNumber) {
        onUpdateQuantity(id, row.quantity + 1);
      }
    }
  };

  const handleDecrement = (id: number) => {
    if (!onUpdateQuantity) return;
    const row = data.find((row) => row.id === id);
    if (row) {
      const newQuantity = row.quantity - 1;
      if (newQuantity <= 0) {
        if (onDeleteRow) onDeleteRow(id);
      } else {
        onUpdateQuantity(id, newQuantity);
      }
    }
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (onUpdateQuantity && newQuantity >= 0) {
      const row = data.find((row) => row.id === id);
      // 在庫数を超える場合は変更できないようにしてる
      if (row && newQuantity <= row.stockNumber) {
        onUpdateQuantity(id, newQuantity);
      }
    }
  };

  const handleUnitPriceChange = (id: number, newUnitPrice: number) => {
    const row = data.find((row) => row.id === id);
    if (row) {
      if (newUnitPrice == 0) {
        onUpdateUnitPrice(id, 0);
      }
      onUpdateUnitPrice(id, newUnitPrice);
    }
  };

  const handleDelete = (id: number) => {
    if (onDeleteRow) onDeleteRow(id);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ height: '100%', overflow: 'auto', boxShadow: 3 }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: '5%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              No.
            </TableCell>
            <TableCell
              sx={{
                width: '5%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              画像
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              区分
            </TableCell>
            <TableCell
              sx={{
                width: '20%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              商品名
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              単価
            </TableCell>
            <TableCell
              sx={{
                width: '5%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              数量
            </TableCell>
            <TableCell
              sx={{
                width: '15%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              割引額
            </TableCell>
            <TableCell
              sx={{
                width: '8%',
                backgroundColor: theme.palette.grey[700] + '!important',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              総額
            </TableCell>
            {onDeleteRow && (
              <TableCell
                sx={{
                  width: '8%',
                  backgroundColor: theme.palette.grey[700] + '!important',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                削除
              </TableCell>
            )}
            {onOpenDiscountModal && (
              <TableCell
                sx={{
                  width: '9%',
                  backgroundColor: theme.palette.grey[700] + '!important',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                割引
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                backgroundColor: index % 2 === 0 ? 'common.white' : 'grey.100',
              }}
            >
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {index + 1}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.imageUrl ? (
                  <Tooltip
                    title={
                      <Box
                        sx={{
                          width: 142,
                          aspectRatio: '0.71',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          src={row.imageUrl}
                          alt="product"
                          width={142}
                          height={200}
                        />
                      </Box>
                    }
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        src={row.imageUrl}
                        alt="product"
                        width={30}
                        height={30}
                      />
                    </Box>
                  </Tooltip>
                ) : (
                  <NoImg />
                )}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.category}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.displayNameWithMeta}
              </TableCell>

              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                <Tooltip
                  title={
                    row.sale ? (
                      <Typography>
                        {row.sale.displayName}
                        <br />
                        割引額：
                        {row.sale.discountAmount?.includes('%')
                          ? `${100 - parseFloat(row.sale.discountAmount)}%`
                          : `${
                              row.sale.discountAmount?.startsWith('-')
                                ? row.sale.discountAmount.slice(1)
                                : row.sale.discountAmount
                            }円`}
                        <br />
                        個数制限：
                        {row.sale.allowedItemCount === -1
                          ? '無し'
                          : `${row.sale.allowedItemCount}個まで`}
                      </Typography>
                    ) : null
                  }
                  arrow
                  TransitionComponent={Zoom}
                >
                  <Box>
                    <NumericTextField
                      value={row.unitPrice}
                      onChange={(newUnitPrice: number) =>
                        handleUnitPriceChange(row.id, newUnitPrice)
                      }
                      sx={{
                        width: '100px',
                        '& .MuiInputBase-input': {
                          color: row.sale?.id ? 'red' : 'inherit',
                        },
                      }}
                      suffix="円"
                      suffixSx={{
                        color: row.sale?.id ? 'red' : 'inherit',
                      }}
                    />
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell
                sx={{
                  color: 'text.primary',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <IconButton
                  onClick={() => handleDecrement(row.id)}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <NumericTextField
                  value={row.quantity}
                  onChange={(newQuantity: number) =>
                    handleQuantityChange(row.id, newQuantity)
                  }
                  sx={{ width: '80px' }}
                />
                <IconButton
                  onClick={() => handleIncrement(row.id)}
                  size="small"
                >
                  <Add />
                </IconButton>
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {/* sallの場合discountの割引量は負の数なので */}
                {(
                  (Math.abs(row.discount) +
                    Math.abs(row.sale?.discountPrice ?? 0)) *
                  row.quantity
                ).toLocaleString()}
                円
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {(
                  (row.unitPrice -
                    (Math.abs(row.discount) +
                      Math.abs(row.sale?.discountPrice ?? 0))) *
                  row.quantity
                ).toLocaleString()}
                円
              </TableCell>
              {onDeleteRow && (
                <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                  <IconButton onClick={() => handleDelete(row.id)} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              )}
              {onOpenDiscountModal && (
                <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                  <IconButton
                    onClick={() => onOpenDiscountModal(row.id)}
                    size="small"
                  >
                    <LocalOffer />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SaleTableCard;
