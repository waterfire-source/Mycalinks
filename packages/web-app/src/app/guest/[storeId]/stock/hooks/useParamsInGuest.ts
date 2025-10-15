import { useParams } from 'next/navigation';
import { decodeStockParams } from '@/app/guest/[storeId]/stock/base64';

export const useParamsInGuest = () => {
  const params = useParams();
  const encodedParams = params.storeId as string;
  const {
    storeId,
    printerSerialNumber,
  }: { storeId: number; printerSerialNumber: string } =
    decodeStockParams(encodedParams);

  return {
    encodedParams,
    storeId,
    printerSerialNumber,
  };
};
