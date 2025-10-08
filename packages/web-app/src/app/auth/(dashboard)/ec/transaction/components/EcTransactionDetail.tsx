import { DetailCard } from '@/components/cards/DetailCard';
import { EcTransactionDetailContent } from '@/app/auth/(dashboard)/ec/transaction/components/EcTransactionDetailContent';
import { EcOrderByStoreInfoType } from '@/app/auth/(dashboard)/ec/transaction/type';
import { SetStateAction } from 'react';
import { ReturnTransactionModal } from '@/app/auth/(dashboard)/ec/transaction/components/ReturnTransactionModal';

interface Props {
  selectedTransaction: EcOrderByStoreInfoType | null;
  isReturnModalOpen: boolean;
  setIsReturnModalOpen: (value: SetStateAction<boolean>) => void;
  // handleClickReturn: (id: number) => void;
  // isLoading: boolean;
}

export const EcTransactionDetail = ({
  selectedTransaction,
  isReturnModalOpen,
  setIsReturnModalOpen, // handleClickReturn,
  // isLoading,
}: Props) => {
  const transactionID = selectedTransaction
    ? selectedTransaction.order.id
    : null;

  // 返品できるか
  // const { accountGroup } = useAccountGroupContext();
  // const canReturn = accountGroup?.create_transaction_return;

  return (
    <>
      <ReturnTransactionModal
        open={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={() => {
          // handleClickReturn(transactionID!);
        }}
        transactionId={transactionID}
      />
      <DetailCard
        title={`注文番号：${transactionID ?? ''}`}
        titleTextColor={'text.primary'}
        titleBackgroundColor={'common.white'}
        content={
          <EcTransactionDetailContent
            transactionID={transactionID}
            transaction={selectedTransaction}
          />
        }
        //返品処理は未実装のため一旦コメントアウト
        // bottomContent={
        //   transactionID ? (
        //     <SecondaryButtonWithIcon
        //       onClick={() => setIsReturnModalOpen(true)}
        //       disabled={isLoading}
        //     >
        //       返品
        //     </SecondaryButtonWithIcon>
        //   ) : (
        //     <></>
        //   )
        // }
      />
    </>
  );
};
