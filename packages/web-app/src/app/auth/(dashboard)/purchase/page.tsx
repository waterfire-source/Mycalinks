'use client';
import DesktopPurchasePage from '@/app/auth/(dashboard)/purchase/components/DesktopPurchasePage';
import { PurchaseCartProvider } from '@/contexts/PurchaseCartContext';
import { specialTheme } from '@/theme/specialTheme';
import { ThemeProvider } from '@emotion/react';

export default function PurchasePage() {
  return (
    <ThemeProvider theme={specialTheme}>
      <PurchaseCartProvider>
        <DesktopPurchasePage />
      </PurchaseCartProvider>
    </ThemeProvider>
  );
}
