import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaAppClient } from 'api-generator/app-client';
import { useCallback, useRef, useState } from 'react';
import { getAppHeaders } from '@/utils/appAuth';

export type GetAllStorePurchaseTableByMycaUserApiRequest = Parameters<
  MycaAppClient['purchaseTable']['getAllStorePurchaseTableByMycaUser']
>[0];

export type GetAllStorePurchaseTableByMycaUserResponse = Awaited<
  ReturnType<
    MycaAppClient['purchaseTable']['getAllStorePurchaseTableByMycaUser']
  >
>;

export const useGetPurchaseTableByMycaUser = () => {
  const { handleError } = useErrorAlert();
  const apiClient = useRef(
    new MycaAppClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      HEADERS: async () => {
        const headers = await getAppHeaders();
        return headers;
      },
    }),
  );

  const [purchaseTables, setPurchaseTables] = useState<
    GetAllStorePurchaseTableByMycaUserResponse['purchaseTables']
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPurchaseTableByMycaUser = useCallback(
    async (param: GetAllStorePurchaseTableByMycaUserApiRequest) => {
      setIsLoading(true);
      try {
        const res =
          await apiClient.current.purchaseTable.getAllStorePurchaseTableByMycaUser(
            {
              storeId: param.storeId || undefined,
              genreHandle: param.genreHandle || undefined,
            },
          );

        setPurchaseTables(res.purchaseTables);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError],
  );

  return {
    purchaseTables,
    isLoading,
    fetchPurchaseTableByMycaUser,
  };
};
