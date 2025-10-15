'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface SaleDetailsCardProps {
  subtotal: number;
  globalDiscountPrice: number;
  tax: number;
  total: number;
  handleOpenReturnModal: () => void;
}

const SaleDetailsCard: React.FC<SaleDetailsCardProps> = ({
  subtotal,
  globalDiscountPrice,
  tax,
  total,
  handleOpenReturnModal,
}) => (
  <Card sx={{ width: '300px', backgroundColor: 'grey.100' }}>
    <Typography
      sx={{
        backgroundColor: 'grey.700',
        color: 'text.secondary',
        padding: '16px',
        textAlign: 'center',
        borderBottomRightRadius: '0',
        borderBottomLeftRadius: '0',
      }}
    >
      お会計詳細
    </Typography>
    <CardContent sx={{ backgroundColor: 'common.white' }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography sx={{ color: 'text.primary' }}>小計</Typography>
        <Typography sx={{ color: 'text.primary' }}>
          {subtotal.toLocaleString()}円
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography sx={{ color: 'text.primary' }}>割引</Typography>
        <Typography sx={{ color: 'text.primary' }}>
          {globalDiscountPrice.toLocaleString()}円
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography sx={{ color: 'text.primary' }}>消費税</Typography>
        <Typography sx={{ color: 'text.primary' }}>
          {tax.toLocaleString()}円
        </Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography sx={{ color: 'text.primary' }}>合計</Typography>
        <Typography sx={{ color: 'text.primary' }}>
          {total.toLocaleString()}円
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" mb={1}>
        <PrimaryButton
          sx={{ width: '100%', color: 'text.secondary' }}
          onClick={handleOpenReturnModal}
          disabled={total <= 0}
        >
          返金
        </PrimaryButton>
      </Box>
    </CardContent>
  </Card>
);

export default SaleDetailsCard;
