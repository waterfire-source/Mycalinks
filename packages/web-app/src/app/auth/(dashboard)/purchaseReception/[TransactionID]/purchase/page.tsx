'use client';

import React from 'react';

import { Box, useMediaQuery } from '@mui/material';
import theme from '@/theme';
import { MobilePurchaseAppreciatePage } from '@/app/auth/(dashboard)/purchaseReception/[TransactionID]/purchase/components/MobilePurchaseAppreciatePage';
import { DesktopPurchaseAppreciatePage } from '@/app/auth/(dashboard)/purchaseReception/[TransactionID]/purchase/components/DesktopPurchaseAppreciatePage';

const PurchaseAppreciatePage: React.FC = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return isMobile ? (
    <Box width={'100vw'} height={'100%'}>
      <MobilePurchaseAppreciatePage />
    </Box>
  ) : (
    <DesktopPurchaseAppreciatePage />
  );
};

export default PurchaseAppreciatePage;
