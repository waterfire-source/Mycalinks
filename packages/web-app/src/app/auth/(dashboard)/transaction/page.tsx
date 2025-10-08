'use client';
import { Box, useMediaQuery } from '@mui/material';
import { TransactionContentsCard } from '@/app/auth/(dashboard)/transaction/components/TransactionContentsCard';
import MobileTransactionContentsCard from '@/app/auth/(dashboard)/transaction/components/MobileTransactionContentsCard';
import theme from '@/theme';

export default function TransactionPage() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box width={'100vw'} height={'100%'}>
      {isMobile ? (
        <MobileTransactionContentsCard />
      ) : (
        <TransactionContentsCard />
      )}
    </Box>
  );
}
