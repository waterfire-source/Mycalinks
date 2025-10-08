import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';

const FLOW_KEY = 'password-reset-flow-state';
type FlowState = 'idle' | 'requested' | 'authenticated' | 'completed';

export const usePasswordResetFlow = () => {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // クライアントのみでlocalStorageにアクセス
    const savedState =
      typeof window !== 'undefined'
        ? (localStorage.getItem(FLOW_KEY) as FlowState | null)
        : null;
    if (savedState) setFlowState(savedState);
    setInitialized(true);
  }, []);

  const updateFlowState = (newState: FlowState) => {
    setFlowState(newState);
    localStorage.setItem(FLOW_KEY, newState);
  };

  const startResetFlow = () => updateFlowState('requested');
  const markAsAuthenticated = () => updateFlowState('authenticated');
  const completeFlow = () => {
    updateFlowState('completed');
    localStorage.removeItem(FLOW_KEY);
  };

  const checkAccessFor = (page: 'signIn' | 'changePassword') => {
    if (!initialized) return false;
    switch (page) {
      case 'signIn':
        return flowState === 'requested';
      case 'changePassword':
        return flowState === 'authenticated';
      default:
        return false;
    }
  };

  const redirectIfInvalidAccess = (page: 'signIn' | 'changePassword') => {
    if (!checkAccessFor(page)) {
      router.replace(PATH.FORGET_PASSWORD.root);
      return true;
    }
    return false;
  };

  return {
    flowState,
    startResetFlow,
    markAsAuthenticated,
    completeFlow,
    checkAccessFor,
    redirectIfInvalidAccess,
    initialized,
  };
};
