// FormWrapper.tsx
import { useEffect, useState } from 'react';
import { Elements } from '@mul-pay/mptoken-react-js';
import { MultiPayment } from '@mul-pay/mptoken-js';
import { GmoPaymentCard } from '@/app/register/gmo/components/payment/card';

const apiKey = process.env.NEXT_PUBLIC_POS_MULPAY_API_KEY;
const pubKey = process.env.NEXT_PUBLIC_POS_MULPAY_PUB_KEY;

export const PaymentInfoFormWrapper = ({
  setPaymentToken,
}: {
  setPaymentToken: (token: string, cardLast4: string) => void;
}) => {
  const [mulpayPromise, setMulpayPromise] =
    useState<Promise<MultiPayment | null> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMulpayModule = async () => {
      try {
        const { loadMulpay } = await import('@mul-pay/mptoken-js');

        if (isMounted && apiKey && pubKey) {
          // window.Multipaymentが存在する場合は、既存のインスタンスを利用
          if (window.Multipayment) {
            setMulpayPromise(Promise.resolve(window.Multipayment as any));
            return;
          }

          // 存在しない場合のみ新規初期化
          // 本番環境の場合は最後の引数をtrueにする
          const isProduction = true;
          const promise = loadMulpay(
            apiKey,
            pubKey,
            undefined,
            true,
            isProduction,
          );
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
      <GmoPaymentCard setPaymentToken={setPaymentToken} />
    </Elements>
  );
};
