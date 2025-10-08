import { Metadata } from 'next';
import { Suspense } from 'react';
import type { Viewport } from 'next';
import ECLayout from '@/app/ec/(core)/components/layouts/ECLayout';
import { CircularProgress } from '@mui/material';
import { EcStoreProvider } from '@/app/ec/(core)/contexts/EcStoreContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'EC Mall | マイカリンクス',
  description: 'Trading card game marketplace',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EcStoreProvider>
      <ECLayout>
        <Suspense
          fallback={<CircularProgress sx={{ color: 'white' }} size={20} />}
        >
          {children}
        </Suspense>
        {/* gtagが設定されている場合はスクリプトを設置する */}
        {Boolean(process.env.NEXT_PUBLIC_GTAG) && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG}`}
              strategy="afterInteractive"
              async
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GTAG}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </ECLayout>
    </EcStoreProvider>
  );
}
