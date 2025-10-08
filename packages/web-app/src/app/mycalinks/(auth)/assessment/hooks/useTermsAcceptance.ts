'use client';

import { createClientAPI, CustomError } from '@/api/implement';
import { useMemo, useState } from 'react';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export const useTermsAcceptance = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { handleError } = useErrorAlert();
  const [acceptTermsLoading, setAcceptTermsLoading] = useState(false);

  // 利用規約同意処理
  const acceptTerms = async (transactionId: number) => {
    setAcceptTermsLoading(true);
    try {
      const res = await clientAPI.mycalinksTransaction.putPosTransaction({
        transactionId,
        termAcceptedAt: new Date(),
      });

      if (res instanceof CustomError) {
        console.error('利用規約同意の処理に失敗しました:', res.message);
        throw res;
      }

      return res;
    } catch (error) {
      console.error('Terms acceptance error:', error);
      handleError(error);
      throw error;
    } finally {
      setAcceptTermsLoading(false);
    }
  };

  return {
    acceptTerms,
    acceptTermsLoading,
  };
};
