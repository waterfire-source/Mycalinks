import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ApiError } from 'api-generator/client';
import { useCallback } from 'react';

export const useErrorAlert = () => {
  const { setAlertState } = useAlert();
  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        const errorMessage =
          typeof error.body === 'object' && error.body?.error
            ? error.body.error
            : `${error.status}: ${error.message}`;

        setAlertState({
          message: errorMessage,
          severity: 'error',
        });
      } else if (error instanceof CustomError) {
        setAlertState({
          message: error.message,
          severity: 'error',
        });
      } else if (error instanceof Error) {
        setAlertState({
          message: error.message,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: '予期せぬエラーが発生しました: ' + String(error),
          severity: 'error',
        });
      }
    },
    [setAlertState],
  );
  return { handleError };
};
