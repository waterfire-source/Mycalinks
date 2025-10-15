'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import { DiscountModal } from '@/components/modals/discount/DiscountModal';
import { TransactionKind } from '@prisma/client';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { useStore } from '@/contexts/StoreContext';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import {
  calculatePurchaseDiscountPrice,
  getTotalItemCount,
} from '@/feature/purchase/hooks/usePurchaseCart';
import { PurchaseAccountModal } from '@/feature/purchase/components/modals/PurchaseAccountModal';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { PATH } from '@/constants/paths';
import { TemporaryHoldModal } from '@/components/modals/sale+purchase/TemporaryHoldModal';
import { useAlert } from '@/contexts/AlertContext';
import { HelpIcon } from '@/components/common/HelpIcon';

export const PurchaseDetailsCard = ({
  isAddCartLoading,
  memo,
  setMemo,
  isError,
}: {
  isAddCartLoading: boolean;
  memo: string;
  setMemo: (memo: string) => void;
  isError: boolean;
}) => {
  const { state, applyGlobalDiscount, getCartTotalItemCount, resetCart } =
    usePurchaseCartContext();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  // お会計モーダルの表示状態
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // 一時保留モーダルの表示状態
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);

  // 全体割増モーダルの表示状態
  const [isGlobalDiscountModalOpen, setIsGlobalDiscountModalOpen] =
    useState(false);

  const { createDraftAppraisedPurchaseTransaction, isLoadingTransaction } =
    usePurchaseTransaction();

  const handleCreateTransaction = async () => {
    // cartsをマッピング
    const mappedCarts = state.carts
      .map((cart) =>
        cart.variants.map((variant) => ({
          product_id: cart.productId,
          item_count: variant.itemCount,
          unit_price: variant.unitPrice,
          discount_price: calculatePurchaseDiscountPrice({
            discountAmount: variant.individualDiscount?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
          original_unit_price:
            cart.originalSpecificPurchasePrice ??
            cart.originalPurchasePrice ??
            0,
          sale_id: variant.sale?.id,
          sale_discount_price: calculatePurchaseDiscountPrice({
            discountAmount: variant.sale?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
        })),
      )
      .flat();

    const transactionRequest: TransactionAPI['create']['request'] = {
      id: state.id,
      store_id: store.id,
      customer_id: state.customer?.id,
      transaction_kind: TransactionKind.buy,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: state.receivedPrice,
      change_price: state.changePrice,
      discount_price: state.discountPrice,
      tax: state.tax,
      carts: mappedCarts,
      description: memo === '' ? undefined : memo,
    };

    const transactionId =
      await createDraftAppraisedPurchaseTransaction(transactionRequest);

    if (!transactionId) {
      setAlertState({
        message: '買取の保存に失敗しました。',
        severity: 'error',
      });
      return;
    }

    if (transactionId) {
      resetCart();
    }
    setIsHoldModalOpen(false);
    // ページを更新するためにhrefを変更(router.pushだとページが更新されない)
    window.location.href = PATH.PURCHASE;
  };

  const { ePosDev } = useEposDevice();

  const [isEstimateDone, setIsEstimateDone] = useState(false);

  const handleClickEstimate = async () => {
    // レシート印刷
    // カートの配列、商品コード、商品数、単価
    const mappedCarts = state.carts
      .map((cart) =>
        cart.variants.map((variant) => ({
          product_id: cart.productId,
          item_count: variant.itemCount,
          unit_price: variant.unitPrice,
          discount_price: calculatePurchaseDiscountPrice({
            discountAmount: variant.individualDiscount?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
          original_unit_price:
            cart.originalSpecificPurchasePrice ??
            cart.originalPurchasePrice ??
            0,
          sale_id: variant.sale?.id,
          sale_discount_price: calculatePurchaseDiscountPrice({
            discountAmount: variant.sale?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
        })),
      )
      .flat();

    const transactionRequest: TransactionAPI['create']['request'] = {
      id: state.id,
      store_id: store.id,
      customer_id: state.customer?.id,
      transaction_kind: TransactionKind.buy,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: state.receivedPrice,
      change_price: state.changePrice,
      discount_price: state.discountPrice,
      tax: state.tax,
      carts: mappedCarts,
      description: memo,
    };

    const res =
      await createDraftAppraisedPurchaseTransaction(transactionRequest);

    if (res && ePosDev) {
      ePosDev.printReceipt(res.id, store.id);
      setIsEstimateDone(true);
    }
  };

  useEffect(() => {
    setIsEstimateDone(false);
  }, [state.carts, state.totalPrice]);

  const { accountGroup } = useAccountGroupContext();
  // 買取で金額設定ができるかどうか
  const canSetDiscount = accountGroup?.set_transaction_manual_discount;
  // 清算ができるかどうか
  const canFinishTransaction = accountGroup?.finish_buy_transaction;

  return (
    <>
      <DiscountModal
        open={isGlobalDiscountModalOpen}
        onClose={() => setIsGlobalDiscountModalOpen(false)}
        onConfirm={applyGlobalDiscount}
        type="purchase"
      />
      <PurchaseAccountModal
        open={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
      />
      <Card
        sx={{ width: '100%', backgroundColor: 'grey.100', height: '100%' }}
        data-testid="purchase-details-card"
      >
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingX={2}
          sx={{
            backgroundColor: 'grey.700',
            color: 'text.secondary',
            width: '100%',
            height: '56px',
            borderBottomRightRadius: '0',
            borderBottomLeftRadius: '0',
          }}
        >
          <Typography variant="body1">お会計詳細</Typography>
          <Typography variant="body1">
            {state.carts.length}商品{getCartTotalItemCount().totalItemCount}点
          </Typography>
        </Stack>
        <CardContent
          sx={{
            backgroundColor: 'common.white',
            height: 'calc( 100% - 56px )',
          }}
        >
          <Stack
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
            sx={{
              overflowY: 'auto',
            }}
          >
            <Stack flexDirection="column" gap={2}>
              {/* 小計 */}
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  小計
                </Typography>
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  {state.subtotalPrice?.toLocaleString()}円
                </Typography>
              </Box>

              {/* 全体割増 */}
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  全体割増
                </Typography>
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  {Math.floor(Math.abs(state.discountPrice)).toLocaleString()}円
                </Typography>
              </Box>

              {/* ポイント利用 */}
              {/* <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  100ポイント利用
                </Typography>
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  0円
                </Typography>
              </Box> */}
              <Divider />

              {/* 合計 */}
              <Box display="flex" justifyContent="space-between">
                <Typography sx={{ color: 'text.primary' }}>合計</Typography>
                <Typography sx={{ color: 'text.primary' }}>
                  {state.totalPrice.toLocaleString()}円
                </Typography>
              </Box>

              <Box display="flex" justifyContent="flex-end">
                <Stack flexDirection="column" alignItems="flex-end" gap={1}>
                  <Typography sx={{ color: 'text.primary' }} variant="caption">
                    消費税{state.tax?.toLocaleString()}円
                  </Typography>
                  {/* <Typography sx={{ color: 'text.primary' }} variant="caption">
                    (⚪︎⚪︎⚪︎pt付与予定)
                  </Typography> */}
                </Stack>
              </Box>

              {/* 割増ボタン */}
              {canSetDiscount && (
                <SecondaryButtonWithIcon
                  sx={{ width: '100%', height: '50px' }}
                  onClick={() => setIsGlobalDiscountModalOpen(true)}
                >
                  割増
                </SecondaryButtonWithIcon>
              )}
              <Box display="flex" justifyContent="flex-end">
                <HelpIcon helpArchivesNumber={1121} />
              </Box>
            </Stack>

            <Stack flexDirection="column" gap={2}>
              <Stack flexDirection="row" gap={2}>
                <PrimaryButtonWithIcon
                  sx={{ width: '50%', height: '50px', minWidth: 0 }}
                  onClick={handleClickEstimate}
                  disabled={getTotalItemCount(state.carts) === 0}
                >
                  見積もり
                </PrimaryButtonWithIcon>
                {isEstimateDone ? (
                  <PrimaryButtonWithIcon
                    sx={{ width: '50%', height: '50px', minWidth: 0 }}
                    onClick={() => {
                      setIsSaleModalOpen(true);
                    }}
                    disabled={
                      getTotalItemCount(state.carts) === 0 ||
                      !canFinishTransaction ||
                      isAddCartLoading ||
                      isError
                    }
                    loading={isAddCartLoading}
                  >
                    清算
                  </PrimaryButtonWithIcon>
                ) : (
                  <SecondaryButtonWithIcon
                    sx={{ width: '50%', height: '50px', minWidth: 0 }}
                    onClick={() => {
                      setIsSaleModalOpen(true);
                    }}
                    disabled={
                      getTotalItemCount(state.carts) === 0 ||
                      !canFinishTransaction ||
                      isAddCartLoading
                    }
                    loading={isAddCartLoading}
                  >
                    清算
                  </SecondaryButtonWithIcon>
                )}
              </Stack>

              <SecondaryButtonWithIcon
                sx={{ width: '100%', height: '35px' }}
                onClick={() => setIsHoldModalOpen(true)}
                loading={isAddCartLoading}
                disabled={getTotalItemCount(state.carts) === 0}
              >
                一時保留
              </SecondaryButtonWithIcon>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* モーダル */}
      <TemporaryHoldModal
        open={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onPrimaryButtonClick={handleCreateTransaction}
        value={memo}
        setValue={setMemo}
        loading={isLoadingTransaction}
      />
    </>
  );
};
