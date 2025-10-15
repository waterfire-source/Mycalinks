'use client';
import { AlertProvider } from '@/contexts/AlertContext';

interface Props {
  children: React.ReactNode;
}

export default function LoginLayout({ children }: Props) {
  return <AlertProvider>{children}</AlertProvider>;
}
