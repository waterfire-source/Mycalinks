'use client';
import { useEffect } from 'react';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useAppAuth } from '@/providers/useAppAuth';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUserId } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await getUserId();
      if (!userId) {
        router.push(PATH.LOGIN);
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}
