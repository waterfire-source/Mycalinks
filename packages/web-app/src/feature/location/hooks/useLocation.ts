import { CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import {
  createOrUpdateLocationApi,
  getLocationApi,
  releaseLocationApi,
} from 'api-generator';
import { MycaPosApiClient } from 'api-generator/client';
import { useMemo, useState } from 'react';
import z from 'zod';

export type LocationResponse = z.infer<typeof getLocationApi.response>;
export type getLocationRequest = z.infer<typeof getLocationApi.request.query>;

export type createLocationRequest = z.infer<
  typeof createOrUpdateLocationApi.request.body
>;

export type releaseRequestBody = z.infer<
  typeof releaseLocationApi.request.body
>;

export type Location = LocationResponse['locations'][number];

export const useLocation = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [locations, setLocations] = useState<Location[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const mycaPosApiClient = useMemo(() => {
    return new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });
  }, [store.id]);

  const getLocation = async (request: getLocationRequest) => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.location.getLocation({
        storeId: store.id,
        ...request,
      });

      if (res instanceof CustomError) throw res;

      const converted = res.locations.map((l) => ({
        ...l,
        created_at: l.created_at ? new Date(l.created_at) : new Date(),
        updated_at: l.updated_at ? new Date(l.updated_at) : new Date(),
        finished_at: l.finished_at ? new Date(l.finished_at) : null,
      }));

      setLocations(converted);

      // APIレスポンスからtotalCountを取得
      setTotalCount(res.totalCount);

      return converted;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (request: createLocationRequest) => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.location.createOrUpdateLocation({
        storeId: store.id,
        requestBody: request,
      });

      if (res instanceof CustomError) throw res;

      return res;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const releaseLocation = async (
    locationId: number,
    requestBody: releaseRequestBody,
  ) => {
    try {
      setLoading(true);
      const res = await mycaPosApiClient.location.releaseLocation({
        storeId: store.id,
        locationId,
        requestBody: requestBody,
      });

      if (res instanceof CustomError) throw res;

      return res;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    getLocation,
    createLocation,
    releaseLocation,
    locations,
    totalCount,
    loading,
  };
};
