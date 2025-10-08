'use client';
import { StoreProvider } from '@/contexts/StoreContext';

interface Props {
  children: React.ReactNode;
}

export default function SetupStoreLayout({ children }: Props) {
  return <StoreProvider>{children}</StoreProvider>;
}
