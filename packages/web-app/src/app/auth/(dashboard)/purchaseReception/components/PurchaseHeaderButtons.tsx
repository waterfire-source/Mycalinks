'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import {
  NewPurchaseModalContainer,
  PurchaseReceptionFormData,
} from '@/feature/purchaseReception/components/modals/NewPurchaseModalContainer';
import { PurchaseNumberModalContainer } from '@/feature/purchaseReception/components/modals/PurchaseNumberModalContainer';
import { RegisterStatus, TransactionKind } from '@prisma/client';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { useStore } from '@/contexts/StoreContext';
import { CustomError } from '@/api/implement';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { CreateNoAccountQR } from '@/feature/purchaseReception/components/buttons/CreateNoAccountQR';
import { useRegister } from '@/contexts/RegisterContext';
import { HelpIcon } from '@/components/common/HelpIcon';

export const PurchaseHeaderButtons = () => {
  const [isNewPurchaseModalOpen, setNewPurchaseModalOpen] = useState(false);
  const [isPurchaseNumberModalOpen, setPurchaseNumberModalOpen] =
    useState(false);
  // 未査定関連
  const { createDraftUnappreciatedPurchaseTransaction } =
    usePurchaseTransaction();
  const { store } = useStore();
  const {
    customer,
    resetCustomer,
    fetchCustomerByMycaID,
    fetchCustomerByCustomerID,
  } = useCustomer();
  const [transactionId, setTransactionId] = useState<number>(0); //作成できた取引のID
  const { register } = useRegister();
  const isRegisterClose = register?.status === RegisterStatus.CLOSED;

  //会員情報読み取りモーダル
  const handleOpenNewPurchaseModal = () => {
    setNewPurchaseModalOpen(true);
  };
  const handleOpenPurchaseNumberModal = (
    number: number,
    transactionId: number,
  ) => {
    setPurchaseNumber(number);
    setTransactionId(transactionId);
    setPurchaseNumberModalOpen(true);
  };
  const handleClosePurchaseNumberModal = () => {
    setPurchaseNumberModalOpen(false);
    setPurchaseNumber(null);
    // 未査定の一覧を取得しなおす
    //TODO:これじゃ効かない→fetchUnassessedTransactions(store.id);
    window.location.reload();
  };

  const handleCloseNewPurchaseModal = () => {
    setNewPurchaseModalOpen(false);
    resetCustomer();
  };

  // 買取番号を保持
  const [purchaseNumber, setPurchaseNumber] = useState<number | null>(null);

  // 新規買取モーダー内で買取番号発行ボタンが押された後に実行されるローディング
  const [isNewPurchaseModalLoading, setIsNewPurchaseModalLoading] =
    useState(false);

  // 新規買取モーダル内で買取番号発行ボタンが押された後に実行される関数。
  const handleFormSubmit = async ({
    id_kind,
    id_number,
    parental_consent_image_url,
    description,
    parental_contact,
  }: PurchaseReceptionFormData) => {
    if (!store?.id) {
      return;
    }

    setIsNewPurchaseModalLoading(true);
    try {
      const res = await createDraftUnappreciatedPurchaseTransaction({
        id: null,
        store_id: store.id,
        customer_id: customer?.id,
        total_price: 0,
        subtotal_price: 0,
        tax: 0,
        discount_price: 0,
        carts: [],
        transaction_kind: TransactionKind.buy,
        payment_method: null,
        recieved_price: null,
        change_price: null,
        id_kind,
        id_number,
        parental_consent_image_url,
        description,
        parental_contact,
      });

      if (res && !(res instanceof CustomError) && res.reception_number) {
        handleCloseNewPurchaseModal();
        handleOpenPurchaseNumberModal(res.reception_number, res.id);
      }
    } catch (error) {
      console.error('買取受付作成時にエラーが発生しました:', error);
    } finally {
      setIsNewPurchaseModalLoading(false);
    }
  };

  // 買取受付できるか
  const { accountGroup } = useAccountGroupContext();
  const canPurchaseReception = accountGroup?.create_buy_reception;

  return (
    <Box
      sx={{
        width: '100%', //ここは要検討
        height: '20px',
      }}
    >
      {canPurchaseReception && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {/* TODO 買取署名機能をアプリでリリースするまでコメントアウト */}
          {/* <PurchaseReceptionScanButton /> */}
          <CreateNoAccountQR text="非会員向けQR発行" />
          <HelpIcon helpArchivesNumber={1284} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PrimaryButtonWithIcon
              icon={<ReceiptLongIcon />}
              onClick={handleOpenNewPurchaseModal}
              disabled={isRegisterClose}
            >
              新規買取受付
            </PrimaryButtonWithIcon>
            <HelpIcon helpArchivesNumber={1271} />
          </Box>
        </Box>
      )}

      {/* モーダル一覧 */}
      {/* 新規買取ボタンを押した際に表示されるモーダル */}
      <NewPurchaseModalContainer
        open={isNewPurchaseModalOpen}
        onClose={handleCloseNewPurchaseModal}
        onFormSubmit={handleFormSubmit}
        onFormSubmitLoading={isNewPurchaseModalLoading}
        customer={customer}
        // onBarcodeScan={handleScanCustomerButtonClick}
        fetchCustomerByMycaID={fetchCustomerByMycaID}
        fetchCustomerByCustomerID={fetchCustomerByCustomerID}
      />

      {/* 新規作成モーダルの買取番号発行を押した後に表示される買取番号の表示モーダル */}
      <PurchaseNumberModalContainer
        open={isPurchaseNumberModalOpen}
        onClose={handleClosePurchaseNumberModal}
        purchaseNumber={purchaseNumber!}
        transactionId={transactionId}
      />
    </Box>
  );
};
