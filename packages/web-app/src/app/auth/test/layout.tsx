import { EposDeviceProvider } from '@/contexts/EposDeviceContext';
import { StoreProvider } from '@/contexts/StoreContext';

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <EposDeviceProvider>{children}</EposDeviceProvider>
    </StoreProvider>
  );
}
