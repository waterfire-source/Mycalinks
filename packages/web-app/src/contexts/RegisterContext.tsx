'use client';

import { useRegisters } from '@/app/hooks/useRegisters';
import { Register as PrismaRegister } from '@prisma/client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Loader from '@/components/common/Loader';
import { LockScreen } from '@/components/layouts/LockScreen';
import { useSession } from 'next-auth/react';
import { PosRunMode } from '@/types/next-auth';

export interface Register extends PrismaRegister {
  isLock?: boolean;
}

interface RegisterContextProps {
  register: Register | null;
  setRegister: (register: Register) => void;
  resetRegister: () => Promise<Register[]>;
  registers: Register[];
}

const RegisterContext = createContext<RegisterContextProps | undefined>(
  undefined,
);

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
  const [register, setRegister] = useState<Register | null>(null);
  const { registers, fetchRegisters } = useRegisters();
  const { data: session } = useSession();

  const resetRegister = async () => {
    return await fetchRegisters();
  };

  useEffect(() => {
    if (!session) return;

    const mode = session.user.mode;

    if (registers.length === 0) return;

    // ストアモードの場合はセッションからレジを特定
    if (mode === PosRunMode.sales) {
      const registerId = Number(session.user.register_id);
      const targetRegister = registers.find((r) => r.id === registerId);
      if (targetRegister) {
        setRegister({ ...targetRegister });
      }
    }

    // 管理モードの場合はヘッダでレジを選択、選択したレジIDは localStorage に保存
    if (mode === PosRunMode.admin) {
      const selectedRegisterId = Number(
        localStorage.getItem('selectedRegisterId'),
      );
      const selectedRegister = registers.find(
        (r) => r.id === selectedRegisterId,
      );

      if (selectedRegister) {
        setRegister({ ...selectedRegister });
      } else {
        const fallback = registers[0];
        // 合致しない場合は初期値として最初のレジを設定
        if (fallback) {
          setRegister({ ...fallback });
          localStorage.setItem('selectedRegisterId', String(fallback.id));
        }
      }
    }
  }, [registers, session]);

  const handleUnlock = () => {
    // 認証成功でロック解除
    localStorage.setItem('isLock', 'false');
    setRegister((prev) => (prev ? { ...prev, isLock: false } : prev));
  };

  if (!register && session?.user.register_id) {
    return <Loader />;
  }

  if (register?.isLock) {
    // ロック中画面を表示
    return <LockScreen handleUnlock={handleUnlock} />;
  }

  return (
    <RegisterContext.Provider
      value={{ register, setRegister, resetRegister, registers }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
};
