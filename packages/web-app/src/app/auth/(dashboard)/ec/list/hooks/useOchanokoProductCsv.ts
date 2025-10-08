import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

interface Props {
  storeId: number;
}

interface OchanokoProductCsvResponse {
  fileUrl: string;
  chunkCount: number;
}

export const useOchanokoProductCsv = ({ storeId }: Props) => {
  const apiClient = useRef(
    new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    }),
  );
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const createProductCsv = useCallback(
    async (
      productIds: number[],
    ): Promise<OchanokoProductCsvResponse | null> => {
      try {
        const response =
          await apiClient.current.ochanoko.createOchanokoProductCsv({
            storeId: storeId,
            requestBody: {
              productIds: productIds,
            },
          });

        setAlertState({
          message: `おちゃのこ在庫作成用のCSVを生成しました（${productIds.length}件）`,
          severity: 'success',
        });

        return {
          fileUrl: response.fileUrl,
          chunkCount: response.chunkCount,
        };
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [storeId, setAlertState, handleError],
  );

  return { createProductCsv };
};
