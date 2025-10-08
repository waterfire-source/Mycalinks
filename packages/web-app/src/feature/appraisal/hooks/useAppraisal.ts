import { useState, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { MycaPosApiClient } from 'api-generator/client';
import { z } from 'zod';
import {
  createAppraisalApi,
  getAppraisalApi,
  inputAppraisalResultApi,
  cancelAppraisalApi,
  updateAppraisalApi,
} from '@api-defs/appraisal/def';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { CustomError } from '@/api/implement';

// 型定義（store_idを除外）
type GetAppraisalRequest = Omit<
  z.infer<typeof getAppraisalApi.request.params>,
  'store_id'
> &
  z.infer<typeof getAppraisalApi.request.query>;
type CreateAppraisalRequest = Omit<
  z.infer<typeof createAppraisalApi.request.params>,
  'store_id'
> &
  z.infer<typeof createAppraisalApi.request.body>;
type InputAppraisalResultRequest = Omit<
  z.infer<typeof inputAppraisalResultApi.request.params>,
  'store_id'
> &
  z.infer<typeof inputAppraisalResultApi.request.body>;
type CancelAppraisalRequest = Omit<
  z.infer<typeof cancelAppraisalApi.request.params>,
  'store_id'
>;
type UpdateAppraisalRequest = Omit<
  z.infer<typeof updateAppraisalApi.request.params>,
  'store_id'
> &
  z.infer<typeof updateAppraisalApi.request.body>;

export const useAppraisal = () => {
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const { store } = useStore();

  const [appraisalResult, setAppraisalResult] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const getAppraisal = useCallback(
    async (request: GetAppraisalRequest) => {
      setIsLoading(true);
      try {
        const response = await mycaPosApiClient.appraisal.getAppraisal({
          storeId: store.id,
          id: request.id,
          deleted: request.deleted,
          finished: request.finished,
          take: request.take,
          skip: request.skip,
        });

        if (response instanceof CustomError) throw response;

        setAppraisalResult(response);
        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState, mycaPosApiClient],
  );

  const createAppraisal = useCallback(
    async (request: CreateAppraisalRequest) => {
      setIsLoading(true);
      try {
        const response = await mycaPosApiClient.appraisal.createAppraisal({
          storeId: store.id,
          requestBody: {
            description: request.description,
            shipping_fee: request.shipping_fee,
            insurance_fee: request.insurance_fee,
            handling_fee: request.handling_fee,
            other_fee: request.other_fee,
            appraisal_fee: request.appraisal_fee,
            products: request.products,
          },
        });
        if (response instanceof CustomError) throw response;

        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState, mycaPosApiClient],
  );

  const inputAppraisalResult = useCallback(
    async (request: InputAppraisalResultRequest): Promise<any> => {
      setIsLoading(true);
      try {
        const response = await mycaPosApiClient.appraisal.inputAppraisalResult({
          storeId: store.id,
          appraisalId: request.appraisal_id,
          requestBody: {
            products: request.products,
          },
        });

        if (response instanceof CustomError) throw response;

        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState, mycaPosApiClient],
  );

  const cancelAppraisal = useCallback(
    async (request: CancelAppraisalRequest): Promise<any> => {
      setIsLoading(true);
      try {
        console.log(request);
        const response = await mycaPosApiClient.appraisal.cancelAppraisal({
          storeId: store.id,
          appraisalId: request.appraisal_id,
        });

        if (response instanceof CustomError) throw response;

        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState, mycaPosApiClient],
  );

  const updateAppraisal = useCallback(
    async (request: UpdateAppraisalRequest): Promise<any> => {
      setIsLoading(true);
      try {
        const response = await mycaPosApiClient.appraisal.updateAppraisal({
          storeId: store.id,
          appraisalId: request.appraisal_id,
          requestBody: {
            shipping_fee: request.shipping_fee,
            insurance_fee: request.insurance_fee,
            handling_fee: request.handling_fee,
            other_fee: request.other_fee,
            description: request.description,
          },
        });

        return response;
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [setAlertState, mycaPosApiClient],
  );

  return {
    appraisalResult,
    getAppraisal,
    createAppraisal,
    inputAppraisalResult,
    cancelAppraisal,
    updateAppraisal,
    isLoading,
  };
};
