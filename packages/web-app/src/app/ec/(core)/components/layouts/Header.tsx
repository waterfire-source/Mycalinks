'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useDevice } from '@/app/ec/(core)/contexts/DeviceContext';
import { DesktopHeader } from '@/app/ec/(core)/components/layouts/DesktopHeader';
import { MobileHeader } from '@/app/ec/(core)/components/layouts/MobileHeader';

export const Header = () => {
  const { isDesktop } = useDevice();
  const [isDeviceReady, setIsDeviceReady] = useState(false);

  // デバイス判定が完了するまで待機
  useEffect(() => {
    // 少し遅延してからデバイス判定結果を使用（SSRとクライアントの差異を回避）
    const timer = setTimeout(() => {
      setIsDeviceReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // デバイス判定が完了していない場合はローディング表示
  if (!isDeviceReady) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  // デバイス判定の結果に基づいて適切なヘッダーを表示
  // nullや不明な状態の場合はモバイル版をデフォルトとする
  if (isDesktop === true) {
    return <DesktopHeader />;
  } else {
    return <MobileHeader />;
  }
};
