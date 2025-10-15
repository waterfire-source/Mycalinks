import { useState, useCallback } from 'react';
import { MycaPosApiClient, ApiError } from 'api-generator/client';
import { useAlert } from '@/contexts/AlertContext';

interface PaymentData {
  token: string;
  corporation: {
    name: string;
    ceo_name: string;
    head_office_address: string;
    phone_number: string;
  };
  account: {
    email: string;
  };
  card: {
    token: string;
  };
}

interface PaymentResponse {
  contract?: {
    status: string;
  };
  tds?: {
    redirectUrl: string;
  };
}

interface UseContractPaymentReturn {
  payContract: (data: PaymentData) => Promise<PaymentResponse | null>;
  isLoading: boolean;
}

export const useContractPayment = (): UseContractPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAlertState } = useAlert();

  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const payContract = useCallback(
    async (data: PaymentData): Promise<PaymentResponse | null> => {
      setIsLoading(true);
      try {
        const response = await apiClient.contract.payContract({
          requestBody: data,
        });

        return response;
      } catch (e) {
        console.error('契約支払い処理エラー:', e);
        if (e instanceof ApiError && e.body?.error) {
          setAlertState({
            message: e.body.error,
            severity: 'error',
          });
        } else {
          setAlertState({
            message: '送信中にエラーが発生しました。もう一度お試しください。',
            severity: 'error',
          });
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient.contract, setAlertState],
  );

  return {
    payContract,
    isLoading,
  };
};
