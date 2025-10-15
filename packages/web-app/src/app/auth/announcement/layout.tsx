'use client';

import { Stack } from '@mui/material';
import { Header } from '@/components/layouts/header/Header';
import { Sidebar } from '@/components/layouts/SideBar';
import { useState } from 'react';
import { StoreProvider } from '@/contexts/StoreContext';
import { RegisterProvider } from '@/contexts/RegisterContext';
import { LabelPrinterHistoryProvider } from '@/contexts/LabelPrinterContext';
import { AccountGroupProvider } from '@/contexts/AccountGroupProvider';
import { ConfirmationModalProvider } from '@/contexts/ConfirmationModalContext';
import { RoutingProvider } from '@/providers/RoutingProvider';
import { EposDeviceProvider } from '@/contexts/EposDeviceContext';
import { TaskProgressContextProvider } from '@/contexts/TaskProgressContext';
import { StoreEventContextProvider } from '@/contexts/StoreEventContext';

type Props = {
  children: React.ReactNode;
};

export default function AnnouncementLayout({ children }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StoreProvider>
        <StoreEventContextProvider>
          <EposDeviceProvider>
            <RegisterProvider>
              <LabelPrinterHistoryProvider>
                <ConfirmationModalProvider>
                  <AccountGroupProvider>
                    <RoutingProvider>
                      <TaskProgressContextProvider>
                        <Header setIsOpen={setIsOpen} />
                        <Stack
                          direction="row"
                          sx={{ flex: 1, overflow: 'auto' }}
                        >
                          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                          {children}
                        </Stack>
                      </TaskProgressContextProvider>
                    </RoutingProvider>
                  </AccountGroupProvider>
                </ConfirmationModalProvider>
              </LabelPrinterHistoryProvider>
            </RegisterProvider>
          </EposDeviceProvider>
        </StoreEventContextProvider>
      </StoreProvider>
    </main>
  );
}
