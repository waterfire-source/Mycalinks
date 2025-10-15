'use client';
import { useAppAuth } from '@/providers/useAppAuth';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUserId } = useAppAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await getUserId();
      if (!userId) return;
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}
