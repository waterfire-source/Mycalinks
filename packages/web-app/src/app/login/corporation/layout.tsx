'use client';
import { AlertProvider } from '@/contexts/AlertContext';
import { Card, Stack } from '@mui/material';
import Image from 'next/image';

interface Props {
  children: React.ReactNode;
}
export default function LoginLayout({ children }: Props) {
  return (
    <AlertProvider>
      <Stack
        width="100%"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Card
          sx={{
            minWidth: '80%',
            minHeight: '50vh',
            maxHeight: '90vh',
            maxWidth: '80%',
            overflowY: 'scroll',
            px: 2,
          }}
        >
          <Stack py={5}>
            <Stack alignItems="center" justifyContent="start" pb={3}>
              <Image
                src="https://static.mycalinks.io/pos/store/1/setting/logo/shopMycaLogo.png"
                alt="Mycalinks"
                height={40}
                width={160}
                priority
              />
            </Stack>
            {children}
          </Stack>
        </Card>
      </Stack>
    </AlertProvider>
  );
}
