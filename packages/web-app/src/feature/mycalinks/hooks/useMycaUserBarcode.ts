import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaAppClient } from 'api-generator/app-client';
import { useCallback, useRef, useState } from 'react';
import { getAppHeaders } from '@/utils/appAuth';
import moment from 'moment';

export const useMycaUserBarcode = () => {
  const { handleError } = useErrorAlert();
  const apiClient = useRef(
    new MycaAppClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      HEADERS: async () => {
        const headers = await getAppHeaders();
        return headers;
      },
    }),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [barcodeInfo, setBarcodeInfo] = useState<{
    value: string;
    exp: moment.Moment;
  }>({
    value: '',
    exp: moment(),
  });

  // バーコード情報を取得する
  const getBarcodeToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.current.mycaUser.getMycaUserBarcode();
      if (res.barcode) {
        const exp = res.barcode.slice(8, 18);

        setBarcodeInfo({
          value: res.barcode,
          exp: moment.unix(parseInt(exp)),
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return { isLoading, barcodeInfo, getBarcodeToken };
};
