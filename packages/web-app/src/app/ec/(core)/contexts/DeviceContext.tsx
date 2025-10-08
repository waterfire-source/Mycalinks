'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export type DeviceType = 'mobile' | 'desktop';
export type ViewMode = 'mobile' | 'desktop' | 'auto';

interface DeviceContextType {
  deviceType: DeviceType;
  viewMode: ViewMode;
  isDesktop: boolean;
  isMobile: boolean;
  setViewMode: (mode: ViewMode) => void;
  actualDeviceType: DeviceType;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider = ({ children }: DeviceProviderProps) => {
  const theme = useTheme();
  const isDesktopDevice = useMediaQuery(theme.breakpoints.up('md')); // 768px以上をデスクトップとする
  const [viewMode, setViewMode] = useState<ViewMode>('auto');

  // 実際のデバイス判定
  const actualDeviceType: DeviceType = isDesktopDevice ? 'desktop' : 'mobile';

  // 表示用のデバイス判定（手動切り替え対応）
  const deviceType: DeviceType =
    viewMode === 'auto'
      ? actualDeviceType
      : viewMode === 'desktop'
      ? 'desktop'
      : 'mobile';

  // 便利なbooleanフラグ
  const isDesktop = deviceType === 'desktop';
  const isMobile = deviceType === 'mobile';

  // LocalStorageから設定を復元
  useEffect(() => {
    const savedViewMode = localStorage.getItem(
      'ec-view-mode',
    ) as ViewMode | null;
    if (
      savedViewMode &&
      ['mobile', 'desktop', 'auto'].includes(savedViewMode)
    ) {
      setViewMode(savedViewMode);
    }
  }, []);

  // viewMode変更時にLocalStorageに保存
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('ec-view-mode', mode);
  };

  const value: DeviceContextType = {
    deviceType,
    viewMode,
    isDesktop,
    isMobile,
    setViewMode: handleSetViewMode,
    actualDeviceType,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
