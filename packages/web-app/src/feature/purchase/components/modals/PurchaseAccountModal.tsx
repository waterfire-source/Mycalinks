import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Typography, Stack, Divider, Checkbox } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { TransactionKind, TransactionPaymentMethod } from '@prisma/client';
import NumericTextField from '@/components/inputFields/NumericTextField';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { useSession } from 'next-auth/react';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { calculatePurchaseDiscountPrice } from '@/feature/purchase/hooks/usePurchaseCart';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { usePurchaseTransaction } from '@/feature/transaction/hooks/usePurchaseTransaction';
import { PurchasePaymentSummaryModal } from '@/feature/purchase/components/modals/PurchasePaymentSummaryModal';
import { PriceEditConfirmationModal } from '@/feature/purchase/components/modals/PriceEditConfirmationModal';
import { useFetchTransactionDetails } from '@/feature/transaction/hooks/useFetchTransactionDetails';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { useItems } from '@/feature/item/hooks/useItems';
import { useAddPoint } from '@/feature/transaction/hooks/useAddPoint';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PurchaseAccountModal: React.FC<Props> = ({ open, onClose }) => {
  const { state, changePaymentMethod, changeCashReceived, resetCart } =
    usePurchaseCartContext();

  const { store } = useStore();
  const { register } = useRegister();

  const { fetchAddPoint, addPoint } = useAddPoint();
  const [disableGivePoint, setDisableGivePoint] = useState<boolean>(false);

  // レジの支払い方法（買取）を配列化
  const availablePaymentMethods = register?.buy_payment_method
    .split(',')
    .map((m) => m.trim())
    .filter((m): m is TransactionPaymentMethod =>
      Object.values(TransactionPaymentMethod).includes(
        m as TransactionPaymentMethod,
      ),
    );

  const paymentMethodOptions: {
    method: TransactionPaymentMethod;
    label: string;
  }[] = [
    { method: TransactionPaymentMethod.cash, label: '現金' },
    { method: TransactionPaymentMethod.bank, label: '銀行振込' },
  ];

  const isPaymentMethodInvalid = availablePaymentMethods?.length === 0;

  const { createPurchaseTransaction, isLoadingTransaction } =
    usePurchaseTransaction();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const { ePosDev } = useEposDevice();

  const [transactionId, setTransactionId] = useState<number | null>(null);

  const { transaction, fetchTransactionData } = useFetchTransactionDetails(
    transactionId ?? 0,
  );
  const { getItems } = useItems();
  const [zeroPriceItems, setZeroPriceItems] = useState<
    ItemAPIRes['getAll']['items']
  >([]);
  // 取引完了後のモーダルの開閉状況
  const [isPaymentSummaryModalOpen, setIsPaymentSummaryModalOpen] =
    useState(false);

  const [
    isPriceEditConfirmationModalOpen,
    setIsPriceEditConfirmationModalOpen,
  ] = useState(false);

  // 販売価格が0円の商品があるか確認
  const checkSalePrice = async () => {
    const itemIds =
      transaction?.transaction_carts
        .map((cart) => cart.product_details?.item_id)
        .filter((itemId) => itemId !== undefined) || [];

    const returnedItems = await getItems(store.id, itemIds, true);

    if (returnedItems) {
      const filteredItems = returnedItems.filter(
        (item) =>
          item.sell_price === 0 && !item.infinite_stock && !item.is_buy_only,
      );
      setZeroPriceItems(filteredItems);
    }
  };

  const handleCreateTransaction = async () => {
    let receivedPrice = state.receivedPrice;

    if (state.paymentMethod !== TransactionPaymentMethod.bank) {
      receivedPrice = 0;
      changeCashReceived(0);
    }

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
      staff_account_id: Number(staffAccountID),
      customer_id: state.customer?.id,
      register_id: register?.id,
      transaction_kind: TransactionKind.buy,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: receivedPrice,
      change_price: state.changePrice,
      discount_price: state.discountPrice,
      tax: state.tax,
      carts: mappedCarts,
      disableGivePoint: disableGivePoint,
    };

    const res = await createPurchaseTransaction(transactionRequest);

    if (res) {
      //キャッシュドロワーを自動で開く 現金会計だった時のみ
      if (
        ePosDev?.devices.printer &&
        (state.paymentMethod == TransactionPaymentMethod.cash ||
          (state.paymentMethod == TransactionPaymentMethod.bank &&
            receivedPrice !== 0))
      ) {
        ePosDev.openDrawer();
      }

      // レシート印刷
      if (ePosDev) {
        ePosDev.printReceipt(res, store.id);
      }
      setTransactionId(res);
    }
  };

  // モーダルを閉じるときに必ずtransactionIdを初期化
  const handleClose = () => {
    setTransactionId(null);
    resetCart();
    setIsPaymentSummaryModalOpen(false);
    setIsPriceEditConfirmationModalOpen(false);
    setDisableGivePoint(false);
    onClose();
  };

  const handlePaymentSummaryModalClose = async () => {
    if (zeroPriceItems.length > 0) {
      setIsPaymentSummaryModalOpen(false);
      setIsPriceEditConfirmationModalOpen(true);
    } else {
      handleClose();
    }
  };

  // transactionIdが変更されたら取引情報を取得
  useEffect(() => {
    if (transactionId) {
      fetchTransactionData();
    }
  }, [transactionId, fetchTransactionData]);

  // 取引情報が取得できたら価格が0円の商品があるか確認し，サマリーモーダルを開く
  useEffect(() => {
    (async () => {
      if (transaction) {
        await checkSalePrice();
        setIsPaymentSummaryModalOpen(true);
      }
    })();
  }, [transaction]);

  // 付与予定ポイント取得
  useEffect(() => {
    if (
      store &&
      state.totalPrice &&
      state.customer?.id &&
      state.paymentMethod
    ) {
      fetchAddPoint(
        store.id,
        state.customer?.id,
        state.totalPrice,
        TransactionKind.buy,
        state.paymentMethod,
      );
    }
  }, [
    store,
    fetchAddPoint,
    state.customer?.id,
    state.totalPrice,
    state.paymentMethod,
  ]);

  return (
    <>
      {transactionId ? (
        <>
          {isPriceEditConfirmationModalOpen && (
            <PriceEditConfirmationModal
              open={isPriceEditConfirmationModalOpen}
              onClose={handleClose}
              transactionId={transactionId || 0}
              zeroPriceItems={zeroPriceItems}
              carts={state.carts}
              setIsPaymentSummaryModalOpen={setIsPaymentSummaryModalOpen}
            />
          )}
          {isPaymentSummaryModalOpen && (
            <PurchasePaymentSummaryModal
              open={isPaymentSummaryModalOpen}
              onClose={handlePaymentSummaryModalClose}
              transactionId={transactionId}
              zeroPriceItems={zeroPriceItems}
            />
          )}
        </>
      ) : (
        <CustomModalWithHeader
          open={open}
          // キャンセルボタンを押さないと閉じれないように
          onClose={() => {}}
          isShowCloseIcon={false}
          title={'お会計詳細'}
          width="70%"
          innerSx={{ padding: 0 }}
          dataTestId="payment-modal"
        >
          <Stack flexDirection="row" width="100%">
            <Stack flexDirection="column" width="50%" gap={2} p={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="payment-subtotal-container"
              >
                <Typography variant="body1">小計</Typography>
                <Typography
                  variant="body1"
                  data-testid="payment-subtotal-amount"
                >
                  {state.subtotalPrice?.toLocaleString()}円
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="payment-discount-container"
              >
                <Typography variant="body1">全体割増</Typography>
                <Typography
                  variant="body1"
                  data-testid="payment-discount-amount"
                >
                  {Math.abs(state.discountPrice).toLocaleString()}円
                </Typography>
              </Box>
              {/* <Box display="flex" justifyContent="space-between">
                <Typography variant="body1">100ポイント利用</Typography>
                <Typography variant="body1">0円</Typography>
              </Box>
              <Divider /> */}
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="payment-total-container"
              >
                <Typography sx={{ color: 'text.primary' }} variant="body1">
                  合計
                </Typography>
                <Typography
                  sx={{ color: 'text.primary' }}
                  variant="body1"
                  data-testid="payment-total-amount"
                >
                  {state.totalPrice.toLocaleString()}円
                </Typography>
              </Box>

              <Box
                display="flex"
                justifyContent="flex-end"
                data-testid="payment-tax-container"
              >
                <Stack flexDirection={'column'} alignItems="flex-end" gap={1}>
                  <Typography
                    sx={{ color: 'text.primary' }}
                    variant="caption"
                    data-testid="payment-tax-amount"
                  >
                    内消費税{state.tax?.toLocaleString()}円
                  </Typography>
                  {state.customer?.id && (
                    <>
                      <Typography
                        sx={{ color: 'text.primary' }}
                        variant="body1"
                      >
                        付与ポイント：
                        {addPoint
                          ? `${addPoint.pointAmount}` + 'pt'
                          : 'データ取得中...'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          sx={{
                            '& .MuiSvgIcon-root': { color: 'primary.main' },
                          }}
                          checked={disableGivePoint}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setDisableGivePoint(e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography variant="body1">
                          ポイントを付与しない
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Divider orientation="vertical" flexItem />

            <Stack
              flexDirection="column"
              width="50%"
              p={2}
              gap={2}
              data-testid="payment-method-container"
            >
              <Typography sx={{ color: 'primary.main' }} variant="body1">
                支払い方法
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexFlow: 'wrap' }}>
                {isPaymentMethodInvalid && (
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ mt: -1, mb: 1 }}
                    data-testid="payment-method-error"
                  >
                    このレジに支払い方法が登録されていません。
                  </Typography>
                )}
                {paymentMethodOptions
                  .filter(
                    ({ method }) => availablePaymentMethods?.includes(method),
                  )
                  .map(({ method, label }) => {
                    const isSelected = state.paymentMethod === method;
                    const ButtonComponent = isSelected
                      ? PrimaryButtonWithIcon
                      : SecondaryButtonWithIcon;

                    return (
                      <ButtonComponent
                        key={method}
                        onClick={() => changePaymentMethod(method)}
                        sx={{ minWidth: '0px' }}
                      >
                        {label}
                      </ButtonComponent>
                    );
                  })}
              </Box>

              <Typography sx={{ color: 'text.primary' }} variant="body1">
                一部お渡し現金
              </Typography>
              <NumericTextField
                sx={{ width: '100%' }}
                suffix="円"
                value={state.receivedPrice ?? 0}
                onChange={changeCashReceived}
                disabled={state.paymentMethod !== TransactionPaymentMethod.bank}
                size="small"
                dataTestId="payment-received-input"
              />
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="payment-change-container"
              >
                <Typography variant="body1">振込み金額</Typography>
                <Typography variant="body1" data-testid="payment-change-amount">
                  {state.paymentMethod === TransactionPaymentMethod.bank
                    ? (
                        state.totalPrice - (state.receivedPrice ?? 0)
                      ).toLocaleString()
                    : '0'}
                  円
                </Typography>
              </Box>
              <PrimaryButtonWithIcon
                sx={{ width: '100%', height: '50px' }}
                onClick={handleCreateTransaction}
                loading={isLoadingTransaction}
                disabled={!state.paymentMethod || isPaymentMethodInvalid}
                data-testid="payment-confirm-button"
              >
                確定
              </PrimaryButtonWithIcon>
              <SecondaryButtonWithIcon
                sx={{ width: '100%', height: '30px' }}
                onClick={() => onClose()}
                data-testid="payment-cancel-button"
              >
                キャンセル
              </SecondaryButtonWithIcon>
            </Stack>
          </Stack>
        </CustomModalWithHeader>
      )}
    </>
  );
};
