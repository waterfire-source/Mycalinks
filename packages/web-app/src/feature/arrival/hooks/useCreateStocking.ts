import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { useCallback } from 'react';

interface Props {
  plannedDate: string;
  supplierID: number;
  products: ArrivalProductSearchType[];
  isTaxIncluded: boolean;
}
export const useCreateStocking = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { data: session } = useSession();
  const staffAccountID = session?.user.id;
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const createStocking = useCallback(
    async ({ plannedDate, supplierID, products, isTaxIncluded }: Props) => {
      // 仕入れを作成
      setIsLoading(true);
      try {
        const res = await clientAPI.stocking.createStocking({
          store_id: store.id,
          staff_account_id: Number(staffAccountID),
          planned_date: plannedDate,
          supplier_id: supplierID,
          stocking_products: products.map((product) => {
            const arrivalCount = product.arrivalCount ?? 0;
            const arrivalPrice = isTaxIncluded
              ? product.arrivalPrice ?? 0
              : null;
            const arrivalPriceWithoutTax = isTaxIncluded
              ? null
              : product.arrivalPrice ?? 0;
            return {
              product_id: product.id,
              planned_item_count: arrivalCount,
              unit_price: arrivalPrice,
              unit_price_without_tax: arrivalPriceWithoutTax,
            };
          }),
        });
        if (res instanceof CustomError) {
          throw new Error(`${res.status}: ${res.message}`);
        }
      } catch (e) {
        console.error(e);
        setAlertState({
          message: '仕入れの作成に失敗しました',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [clientAPI.stocking, setAlertState, staffAccountID, store.id],
  );

  return {
    createStocking,
    isLoading,
  };
};
