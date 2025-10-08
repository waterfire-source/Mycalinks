'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// LoadingContext用の型定義
interface LoadingContextProps {
  isEcLoading: boolean;
  setIsEcLoading: (loading: boolean) => void;
}

// デフォルト値
const defaultContext: LoadingContextProps = {
  isEcLoading: false,
  setIsEcLoading: () => {}, // ダミー関数
};

// Contextの作成
const EcLoadingContext = createContext<LoadingContextProps>(defaultContext);

// Provider コンポーネント
export const EcLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isEcLoading, setIsEcLoadingState] = useState(false);

  const setIsEcLoading = (loading: boolean) => {
    setIsEcLoadingState(loading);
  };

  return (
    <EcLoadingContext.Provider value={{ isEcLoading, setIsEcLoading }}>
      {children}
    </EcLoadingContext.Provider>
  );
};

// カスタムフック
export const useEcLoading = () => {
  const context = useContext(EcLoadingContext);
  if (context === undefined) {
    throw new Error('useEcLoading must be used within an EcLoadingProvider');
  }
  return context;
};
