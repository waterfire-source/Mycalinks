import { AdvertisementAPI } from '@/api/frontend/advertisement/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { AppAdvertisementKind, AppAdvertisementStatus } from '@prisma/client';
import { useCallback, useState } from 'react';

export interface AdvertisementState {
  id?: number;
  virtualStatus?: AppAdvertisementStatus;
  kind?: AppAdvertisementKind;
}

export const useAdvertisement = (storeId: number) => {
  const { setAlertState } = useAlert();
  const [searchState, setSearchState] = useState<AdvertisementState>({
    id: undefined,
    virtualStatus: undefined,
    kind: undefined,
  });
  const [results, setResults] =
    useState<AdvertisementAPI['getAppAdvertisement']['response']>();
  const [isLoading, setIsLoading] = useState(false);
  const fetchAdvertisement = useCallback(async () => {
    const clientAPI = createClientAPI();
    setIsLoading(true);
    try {
      const response = await clientAPI.advertisement.getAppAdvertisement({
        storeId: storeId,
        id: searchState.id,
        virtualStatus: searchState.virtualStatus,
        kind: searchState.kind,
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        return response;
      }

      setResults(response);
      return response;
    } catch (error) {
      setAlertState({
        message: '取得中にエラーが発生しました。',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    storeId,
    setAlertState,
    searchState.id,
    searchState.kind,
    searchState.virtualStatus,
  ]);
  return {
    results,
    isLoading,
    searchState,
    fetchAdvertisement,
    setSearchState,
  };
};
