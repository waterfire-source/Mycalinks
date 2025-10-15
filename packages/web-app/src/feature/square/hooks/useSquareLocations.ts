import { SquareAPIRes } from '@/api/frontend/square/api';
import { useListSquareLocations } from '@/feature/square/hooks/useListSquareLocations';
import { useCallback, useState } from 'react';

export const useSquareLocations = () => {
  const { listSquareLocations } = useListSquareLocations();
  const [locations, setLocations] = useState<
    SquareAPIRes['listSquareLocations']['locations']
  >([]);
  const fetchLocations = useCallback(async () => {
    try {
      const res = await listSquareLocations();
      setLocations(res.locations);
    } catch (error) {
      console.error(error);
    }
  }, [listSquareLocations]);
  return { locations, fetchLocations };
};
