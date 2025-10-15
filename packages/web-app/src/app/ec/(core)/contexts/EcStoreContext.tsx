'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  useEcStore,
  GetEcStoreResponse,
} from '@/app/ec/(core)/hooks/useEcStore';

interface EcStoreContextType {
  stores: GetEcStoreResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshStores: () => Promise<void>;
}

const EcStoreContext = createContext<EcStoreContextType | undefined>(undefined);

interface EcStoreProviderProps {
  children: ReactNode;
}

export const EcStoreProvider = ({ children }: EcStoreProviderProps) => {
  const [stores, setStores] = useState<GetEcStoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getEcStore } = useEcStore();

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const storeData = await getEcStore();
      setStores(storeData);
    } catch (err) {
      setError('ストア情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const refreshStores = async () => {
    await fetchStores();
  };

  const value: EcStoreContextType = {
    stores,
    isLoading,
    error,
    refreshStores,
  };

  return (
    <EcStoreContext.Provider value={value}>{children}</EcStoreContext.Provider>
  );
};

export const useEcStoreContext = () => {
  const context = useContext(EcStoreContext);
  if (context === undefined) {
    throw new Error('useEcStoreContext must be used within an EcStoreProvider');
  }
  return context;
};
