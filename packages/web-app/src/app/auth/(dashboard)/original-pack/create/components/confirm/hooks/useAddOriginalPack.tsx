import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { useAlert } from '@/contexts/AlertContext';
import { useAddOriginalPackApi } from '@/feature/originalPack/hooks/useAddOriginalPack';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

type FormDataType = {
  additionalStockNumber: number;
};

export const useAddOriginalPack = (itemId: number) => {
  const { addOriginalPack: add } = useAddOriginalPackApi();
  const { setAlertState } = useAlert();
  const { data } = useSession();

  const [form, setForm] = useState<FormDataType>({ additionalStockNumber: 1 });
  const [isLoading, setIsLoading] = useState(false);

  const handleAdditionalStockNumberChange = (value: number) => {
    setForm({ additionalStockNumber: value });
  };

  const { enclosedProducts } = useEnclosedProductContext();

  const addOriginalPack = async (onSuccess: () => void) => {
    setIsLoading(true);
    try {
      await add({
        itemID: itemId,
        additionalStockNumber: form.additionalStockNumber,
        products: enclosedProducts.map((p) => ({
          productID: p.id,
          itemCount: p.item_count ?? 0,
        })),
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      setAlertState({ message: '補充に失敗しました', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    handleAdditionalStockNumberChange,
    addOriginalPack,
    isLoading,
  };
};
