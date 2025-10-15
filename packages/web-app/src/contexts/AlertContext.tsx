'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { AlertService } from '@/utils/error/alertService';

export interface AlertState {
  message: string | null;
  severity: 'success' | 'error';
}

export interface AlertContextProps {
  alertState: AlertState;
  setAlertState: React.Dispatch<React.SetStateAction<AlertState>>;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alertState, setAlertState] = useState<AlertState>({
    message: null,
    severity: 'success',
  });

  useEffect(() => {
    // コンポーネントのマウント時にAlertServiceにコールバックを登録
    AlertService.registerAlertCallback((newAlertState) => {
      setAlertState({
        message: newAlertState.message,
        severity: newAlertState.severity,
      });
    });

    // コンポーネントのアンマウント時にコールバックを解除
    return () => {
      AlertService.unregisterAlertCallback();
    };
  }, []);

  // alertState.message が存在する場合、5秒後に自動でアラートを閉じる
  useEffect(() => {
    if (alertState.message) {
      const timer = setTimeout(() => {
        setAlertState((prev) => ({ ...prev, message: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertState.message]);

  return (
    <AlertContext.Provider value={{ alertState, setAlertState }}>
      {alertState.message && (
        <Alert
          severity={alertState.severity}
          onClose={() => setAlertState({ message: null, severity: 'success' })}
          sx={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            width: 'auto',
            margin: '0 auto',
            zIndex: 1500,
            whiteSpace: 'pre-wrap',
          }}
        >
          <AlertTitle>
            {alertState.severity === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          {alertState.message}
        </Alert>
      )}
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextProps => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
