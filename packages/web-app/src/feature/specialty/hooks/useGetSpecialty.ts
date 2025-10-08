import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useCallback, useMemo, useState } from 'react';
import { getSpecialtyApi } from 'api-generator';
import { z } from 'zod';
import dayjs from 'dayjs';
type SpecialtyResponse = z.infer<typeof getSpecialtyApi.response>;
type GetSpecialtyParams = z.infer<typeof getSpecialtyApi.request.query>;
export type Specialties = SpecialtyResponse['specialties'];
export const useGetSpecialty = () => {
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { store } = useStore();
  const [specialties, setSpecialties] = useState<Specialties>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchSpecialty = useCallback(
    async (params?: GetSpecialtyParams) => {
      try {
        setIsLoading(true);
        const res = await apiClient.product.getSpecialty({
          storeId: store.id,
          id: params?.id,
          kind: params?.kind,
        });
        const sortedSpecialties = res.specialties
          .map((e) => ({
            ...e,
            created_at: e.created_at
              ? dayjs(e.created_at).toDate()
              : dayjs().toDate(),
            updated_at: e.updated_at
              ? dayjs(e.updated_at).toDate()
              : dayjs().toDate(),
          }))
          .sort((a, b) => {
            const kindA = a.kind === 'NORMAL' ? 1 : 0;
            const kindB = b.kind === 'NORMAL' ? 1 : 0;
            if (kindA !== kindB) {
              return kindA - kindB;
            }
            return (a.order_number || 0) - (b.order_number || 0);
          });

        setSpecialties(sortedSpecialties);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, store.id],
  );
  return { fetchSpecialty, specialties, isLoading };
};
