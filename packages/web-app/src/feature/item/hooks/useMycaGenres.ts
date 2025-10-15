import { createClientAPI } from '@/api/implement';
import { MycaAppGenre } from 'backend-core';
import { useCallback, useMemo, useState } from 'react';

export const useMycaGenres = () => {
  const [genres, setGenres] = useState<MycaAppGenre[]>([]);
  const clientAPI = useMemo(() => createClientAPI(), []);

  const fetchMycaGenres = useCallback(async () => {
    const clientAPI = createClientAPI();

    const response = await clientAPI.mycaApp.getGenres();
    setGenres(response);
  }, [clientAPI]);

  return {
    genres,
    fetchMycaGenres,
  };
};
