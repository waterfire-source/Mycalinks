import '@/app/globals.css';
import { Inter } from 'next/font/google';
import NextAuthProvider from '@/providers/NextAuth';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { AlertProvider } from '@/contexts/AlertContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MycaPOSシステム',
  robots: {
    index: false,
    googleBot: {
      index: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== 'development') {
    console.log = () => {};
  }
  return (
    <html lang="ja">
      <body>
        <Script src="/epos/sdk/epos-2.27.0.js" strategy="beforeInteractive" />
        <NextAuthProvider>
          <AlertProvider>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </AppRouterCacheProvider>
          </AlertProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
