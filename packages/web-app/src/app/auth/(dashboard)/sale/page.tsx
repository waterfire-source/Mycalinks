'use client';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import theme from '@/theme';
import { DesktopSalePage } from '@/app/auth/(dashboard)/sale/components/DesktopSalePage';
import MobileSalePage from '@/app/auth/(dashboard)/sale/components/MobileSalePage';
import { SaleCartProvider } from '@/contexts/SaleCartContext';
import { specialTheme } from '@/theme/specialTheme';

export default function SalePage() {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <SaleCartProvider>
      <ThemeProvider theme={specialTheme}>
        {isMobile ? <MobileSalePage /> : <DesktopSalePage />}
      </ThemeProvider>
    </SaleCartProvider>
  );
}
