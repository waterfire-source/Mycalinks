'use client';

import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import { Header } from '@/app/ec/(core)/components/layouts/Header';
import { AlertProvider } from '@/contexts/AlertContext';
import { HeaderProvider } from '@/app/ec/(core)/contexts/HeaderContext';
import { EcLoadingProvider } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { CartProvider } from '@/app/ec/(core)/contexts/CartContext';
import {
  DeviceProvider,
  useDevice,
} from '@/app/ec/(core)/contexts/DeviceContext';
import { ViewModeSwitcher } from '@/app/ec/(core)/components/ViewModeSwitcher';

const ECLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useDevice();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: isDesktop ? 2 : 7, // デスクトップは下部パディング小さく
        }}
      >
        {children}
      </Box>

      {/* デバッグ用表示切替ボタン */}
      <ViewModeSwitcher />
    </Box>
  );
};

export default function ECLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlertProvider>
      <CartProvider>
        <DeviceProvider>
          <EcLoadingProvider>
            <HeaderProvider>
              <ECLayoutInner>{children}</ECLayoutInner>
            </HeaderProvider>
          </EcLoadingProvider>
        </DeviceProvider>
      </CartProvider>
    </AlertProvider>
  );
}
