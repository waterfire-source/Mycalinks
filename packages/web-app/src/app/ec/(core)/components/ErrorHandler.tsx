'use client';

import { useEffect } from 'react';
import { AlertService } from '@/utils/error/alertService';

interface ErrorHandlerProps {
  errors?: Array<{ message: string; severity: 'error' | 'success' }>;
}

export const ErrorHandler = ({ errors }: ErrorHandlerProps) => {
  useEffect(() => {
    if (errors && errors.length > 0) {
      const firstError = errors[0];
      AlertService.showAlert(firstError.message, firstError.severity);
    }
  }, [errors]);
  return null;
};
