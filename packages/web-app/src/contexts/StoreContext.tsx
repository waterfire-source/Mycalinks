'use client';

import { useStores } from '@/app/hooks/useStores';
import { Store } from '@prisma/client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import Loader from '@/components/common/Loader';
import { LocalStorageManager } from '@/utils/localStorage';

interface StoreContextProps {
  store: Store;
  setStore: (store: Store) => void;
  resetStore: () => void;
  stores: Store[];
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStoreState] = useState<Store | null>(null);
  const storeLocalStorageManager = useMemo(
    () => new LocalStorageManager('store'),
    [],
  );
  const setStore = useCallback(
    (store: Store) => {
      if (!store) return;
      setStoreState(store);
      storeLocalStorageManager.setItem({ storeId: store?.id });
    },
    [storeLocalStorageManager],
  );
  const { stores, fetchStores } = useStores();

  useEffect(() => {
    if (stores.length === 0 || stores === undefined) return;
    // localStorageにstoreIdがあればそのstoreIdを使用
    const storedStoreId = storeLocalStorageManager.getItem()?.storeId;
    const initialStore = stores.find((s) => s.id === Number(storedStoreId));
    if (initialStore) {
      setStoreState(initialStore);
      return;
    }
    // localStorageにstoreIdがなければ最初の店舗を使用
    setStore(stores[0]);
  }, [setStore, storeLocalStorageManager, stores]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const resetStore = () => {
    fetchStores();
  };

  if (!store) {
    return <Loader />;
  }

  return (
    <StoreContext.Provider value={{ store, setStore, resetStore, stores }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
