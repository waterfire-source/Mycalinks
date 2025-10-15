import { AlertState } from '@/contexts/AlertContext';

type AlertCallback = (alertState: AlertState) => void;
let alertCallback: AlertCallback | null = null;

export const AlertService = {
  // アラートコールバックを登録
  registerAlertCallback: (callback: AlertCallback) => {
    alertCallback = callback;
  },

  // アラートコールバックを解除
  unregisterAlertCallback: () => {
    alertCallback = null;
  },

  // アラートを表示
  showAlert: (message: string, severity: 'success' | 'error') => {
    if (alertCallback) {
      alertCallback({ message, severity });
    } else {
      console.warn('Alert callback is not registered');
    }
  },
};
