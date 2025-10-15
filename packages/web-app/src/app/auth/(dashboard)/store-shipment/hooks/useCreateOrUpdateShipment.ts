import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useState } from 'react';

export const useCreateOrUpdateShipment = () => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();

  const [loading, setLoading] = useState(false);
};
