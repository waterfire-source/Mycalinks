import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useEffect, useRef, useState } from 'react';
import { PurchaseReceptionDetailModal } from '@/feature/purchaseReception/components/modals/DetailModal';
import { useTransaction } from '@/feature/transaction/hooks/useTransaction';
import { useStore } from '@/contexts/StoreContext';
import { useScanner } from '@/hooks/useScanner';
import { useAlert } from '@/contexts/AlertContext';
export const PurchaseReceptionScanButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchTransaction, transaction } = useTransaction();
  const { store } = useStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setAlertState } = useAlert();

  const { setIsScanning, isScanning } = useScanner(async (code) => {
    console.log('code: ', code);
    if (!code) return;
    // バーコードからは頭が3333で合計16桁の数字が渡ってくる。取引IDが12345の場合は 3333000000000012345 というようなフォーマット
    const isValidFormat = /^3333\d{12}$/.test(code);
    if (!isValidFormat) {
      setAlertState({
        message: '不正なバーコードが入力されました。',
        severity: 'error',
      });
      return;
    }
    // これを12345に変換する
    const transactionId = Number(code.slice(10));
    try {
      const res = await fetchTransaction(store.id, transactionId);
      if (res === undefined) {
        setAlertState({
          message: '有効なバーコードではありません。',
          severity: 'error',
        });
        return;
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      setAlertState({
        message: 'スキャンに失敗しました',
        severity: 'error',
      });
    } finally {
      setIsScanning(false);
    }
  });

  // ボタン以外をクリックされたらスキャンモードを解除
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsScanning(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setIsScanning]);

  return (
    <>
      <SecondaryButton
        ref={buttonRef}
        onClick={() => setIsScanning((prev) => !prev)}
      >
        {isScanning ? 'キャンセル' : 'スキャンで検索'}
      </SecondaryButton>
      {transaction && (
        <PurchaseReceptionDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={transaction}
          onConfirmClick={() => {}}
        />
      )}
    </>
  );
};
