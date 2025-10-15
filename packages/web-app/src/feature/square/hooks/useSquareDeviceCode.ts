import { useCallback } from 'react';
import { useCreateDeviceCode } from '@/feature/square/hooks/useCreateDeviceCode';
import { useState } from 'react';
import { SquareAPI } from '@/api/frontend/square/api';

export const useSquareDeviceCode = () => {
  const { createDeviceCode } = useCreateDeviceCode();
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const createSquareDeviceCode = useCallback(
    async (request: SquareAPI['createSquareTerminalDeviceCode']['request']) => {
      try {
        setIsLoading(true);
        const res = await createDeviceCode(request);
        setDeviceCode(res.square_device_code);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [createDeviceCode],
  );

  return { deviceCode, createSquareDeviceCode, isLoading };
};
