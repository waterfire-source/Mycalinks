// FormWrapper.tsx
import { useEffect, useState } from 'react';
import { Elements } from '@mul-pay/mptoken-react-js';
import { MultiPayment } from '@mul-pay/mptoken-js';
import Card from '@/app/auth/test/card';

// const apiKey = import.meta.env.VITE_MULPAY_API_KEY || '';
// const pubKey = import.meta.env.VITE_MULPAY_PUB_KEY || '';
const apiKey =
  'ODcwOTQ5NjQyMjUwNDFlZWRiZDVmMDc3NjE0MmJmZmQ4MDZlYTcyYmRjNDUwN2QyMDA4MjUyZjczY2RlY2YxMXRzaG9wMDAwNzE3MjI=';
const pubKey =
  'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAyw5X4a/ZnCnCWmcFf7FLKgS6N2sdbvg0RvaL/yp+dGWhpTzX6JVm8OKM1DFug9kBz3QHAOflfxaqNRuzRd6StBiEUkeW16bJ74+zPeqNgthsOcBVfvDe8xkLZTA0ikS0PPlPcDMLz6XAuacunFh8c4wY+9k8kkQaKIEoTNASUIADZOASrBIGiWQToPT2aQtPZapLov036TdjipG6VM15mP8+KYU2GARAz8V5KfGrIE8vCraHsypI86ldIPNiE1zvB+wFIztg+/YSWUyvJkLE59YqYmdhaydvbHUalNiNxjK5xMzlpwFS0r+DKrGe28Sc2yjbyZhHMPabQQ3JWQLJ77YViAJChjPqHp3rJXYxePScuL17fKIoyEcgQO+BUZ1QMHzokYK/7jglzoHsrp9bty6I8T7PHlq6b+td/lmaukNgmbTc7pBGsRSxCSjxjyhbImuAvVSJd2DVly9jH9o7SFw9ohCYu+Zpo15EGtlOIzkDN8qXRnWXxSYs/rRDLSxlAgMBAAE=';
const merchantIds = {
  googlePayMerchantId: '01234567890123456789',
};

export default function FormWrapper() {
  const [mulpayPromise, setMulpayPromise] =
    useState<Promise<MultiPayment | null> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMulpayModule = async () => {
      try {
        const { loadMulpay } = await import('@mul-pay/mptoken-js');
        if (isMounted) {
          const promise = loadMulpay(apiKey, pubKey, merchantIds, true, false);
          setMulpayPromise(promise);
        }
      } catch (error) {
        console.error('Failed to load mulpay module', error);
      }
    };

    loadMulpayModule();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Elements multiPayment={mulpayPromise}>
      <Card />
    </Elements>
  );
}
