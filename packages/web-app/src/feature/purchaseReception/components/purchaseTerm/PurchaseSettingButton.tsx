import { useStore } from '@/contexts/StoreContext';
import { PurchaseSettingDialog } from '@/feature/purchaseReception/components/purchaseTerm/PurchaseSettingDialog';
import { usePurchaseTerm } from '@/feature/purchaseReception/hooks/usePurchaseTerm';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

export const PurchaseSettingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { store } = useStore();
  const {
    term,
    setTerm,
    defaultTerm,
    fetchTerms,
    updateTerm,
    isUpdateLoading,
  } = usePurchaseTerm(store.id);
  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);
  // 買取規約が設定されていない場合はモーダルを常に開いている状態にする
  useEffect(() => {
    if (term === '') {
      setIsOpen(true);
    }
    // fetchしたタイミングだけ呼ばれれば良い。termの変更には依存しないようにする
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTerms]);
  return (
    <>
      <Button variant="text" onClick={() => setIsOpen(true)}>
        買取規約
      </Button>
      <PurchaseSettingDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        term={term}
        setTerm={setTerm}
        defaultTerm={defaultTerm}
        updateTerm={updateTerm}
        isUpdateLoading={isUpdateLoading}
      />
    </>
  );
};
