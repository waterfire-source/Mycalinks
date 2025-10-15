'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GoogleAnalyticsIdMap } from '@/constants/googleAnalytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function PosGoogleAnalytics() {
  const pathname = usePathname();
  const [isGtagReady, setIsGtagReady] = useState(false);

  // 環境別のGoogle Analytics ID
  const getAnalyticsId = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const obj = GoogleAnalyticsIdMap.find((g) => g.hostname === hostname);
      if (obj) return obj.id;
    }
    return null;
  };

  const analyticsId = getAnalyticsId();

  // ページ遷移を検知してpage_viewを送信
  useEffect(() => {
    if (analyticsId && isGtagReady && typeof window.gtag !== 'undefined') {
      window.gtag('config', analyticsId, {
        page_path: pathname,
      });
    }
  }, [pathname, analyticsId, isGtagReady]);

  const handleGtagLoad = () => {
    setIsGtagReady(true);
  };

  if (!analyticsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        strategy="afterInteractive"
        onLoad={handleGtagLoad}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  );
}
