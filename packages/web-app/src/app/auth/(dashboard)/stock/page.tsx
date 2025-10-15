'use client';

import { MobileStockPageContent } from '@/app/auth/(dashboard)/stock/components/MobileStockPageContent';
import { StockPageContent } from '@/app/auth/(dashboard)/stock/components/StockPageContent';
import theme from '@/theme';
import { useMediaQuery } from '@mui/material';

export default function StockPage() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (isMobile) {
    return <MobileStockPageContent />;
  }

  return <StockPageContent />;
}
