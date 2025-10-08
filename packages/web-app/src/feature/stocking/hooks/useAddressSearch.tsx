import { useCallback, useState } from 'react';
import { useAlert } from '@/contexts/AlertContext';

export const useAddressSearch = (zipCode: string) => {
  const { setAlertState } = useAlert();

  const [address, setAddress] = useState({
    prefecture: '',
    city: '',
    address2: '',
  });

  const handleAddressSearch = useCallback(async () => {
    try {
      const response = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipCode}`,
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setAlertState({
          message: `住所が見つかりませんでした。`,
          severity: 'error',
        });
        setAddress({
          prefecture: '',
          city: '',
          address2: '',
        });
        return;
      }

      const result = data.results[0];
      setAddress({
        prefecture: result.address1,
        city: result.address2,
        address2: result.address3,
      });
    } catch (error) {
      setAlertState({
        message: `${error}:住所検索に失敗しました。`,
        severity: 'error',
      });
    }
  }, [zipCode, setAlertState]);

  return { address, handleAddressSearch };
};
