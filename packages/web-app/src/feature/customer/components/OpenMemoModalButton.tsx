import React, { useCallback, useEffect, useState } from 'react';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomerMemoModal } from '@/feature/customer/components/CustomerMemoModal';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  customerId: number;
  storeId: number;
}

export const OpenMemoModalButton = ({ customerId, storeId }: Props) => {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAlertState } = useAlert();

  const { customer, fetchCustomerByCustomerID, updateMemo } = useCustomer();

  useEffect(() => {
    fetchCustomerByCustomerID(storeId, customerId);
  }, [customerId, storeId, fetchCustomerByCustomerID]);

  useEffect(() => {
    if (customer) {
      setMemo('memo' in customer ? customer.memo ?? '' : '');
    }
  }, [customer]);

  useEffect(() => {
    if (customer && 'memo' in customer && open) {
      setMemo(customer.memo ?? '');
    }
  }, [customer, open]);

  const onConfirm = useCallback(async () => {
    setIsLoading(true);
    const response = await updateMemo(storeId, memo);
    if (response instanceof CustomError) {
      setIsLoading(false);
      return;
    }
    setAlertState({
      message: 'メモを更新しました。',
      severity: 'success',
    });
    setIsLoading(false);
    fetchCustomerByCustomerID(storeId, customerId);
    setOpen(false);
  }, [
    memo,
    storeId,
    customerId,
    updateMemo,
    fetchCustomerByCustomerID,
    setAlertState,
  ]);

  return (
    <>
      <SecondaryButton onClick={() => setOpen(true)}>
        メモを表示
      </SecondaryButton>
      <CustomerMemoModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        memo={memo}
        setMemo={setMemo}
        isLoading={isLoading}
      />
    </>
  );
};
