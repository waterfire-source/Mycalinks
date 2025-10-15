import { Metadata } from 'next';
import { Suspense } from 'react';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'マイページ | マイカリンクス',
  description: 'マイカリンクス会員証',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100svh',
        height: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        <Suspense
          fallback={
            <CircularProgress sx={{ color: 'primary.main' }} size={20} />
          }
        >
          {children}
        </Suspense>
      </Box>
    </Box>
  );
}
