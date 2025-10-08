import { useCallback, useRef } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { Shipping_Method } from '@prisma/client';

interface Props {
  storeId: number;
}

interface ShippingMethodResponse {
  shippingMethods: Array<
    Shipping_Method & {
      regions?: Array<{
        region_handle: string;
        fee: number;
      }> | null;
      weights?: Array<{
        display_name: string;
        weight_gte: number;
        weight_lte: number;
        regions: Array<{
          region_handle: string;
          fee: number;
        }>;
      }> | null;
    }
  >;
}

export const useGetShippingMethod = ({ storeId }: Props) => {
  const { setAlertState } = useAlert();
  const api = useRef(createClientAPI());

  const getShippingMethods = useCallback(async () => {
    try {
      const response = await api.current.ec.listShippingMethod({
        store_id: storeId,
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        throw response;
      }
      return response as ShippingMethodResponse;
    } catch (error) {
      setAlertState({
        message: '配送方法の取得に失敗しました',
        severity: 'error',
      });
      throw error;
    }
  }, [storeId, setAlertState]);

  return {
    getShippingMethods,
  };
};
