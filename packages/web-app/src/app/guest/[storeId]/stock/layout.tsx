import { AlertProvider } from '@/contexts/AlertContext';
import { EposDeviceProvider } from '@/contexts/EposDeviceContext';

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertProvider>
      <EposDeviceProvider>{children}</EposDeviceProvider>
    </AlertProvider>
  );
}
