import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Tooltip,
  IconButton,
  Checkbox,
} from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { TransactionKind, TransactionPaymentMethod } from '@prisma/client';
import NumericTextField from '@/components/inputFields/NumericTextField';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { CustomModalWithHeader } from '@/components/modals/CustomModalWithHeader';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { SalePaymentSummaryModal } from '@/feature/sale/components/modals/SalePaymentSummaryModal';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { useSession } from 'next-auth/react';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { calculateDiscountPrice } from '@/feature/sale/hooks/useSaleCart';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { useAddPoint } from '@/feature/transaction/hooks/useAddPoint';
import { useGetCustomerReservationReceptionReceipt } from '@/feature/booking';

interface Props {
  open: boolean;
  onClose: () => void;
  resetCustomer: () => void;
  isReservationDeposit: boolean;
}

export const SaleAccountModal: React.FC<Props> = ({
  open,
  onClose,
  resetCustomer,
  isReservationDeposit,
}) => {
  const { state, changePaymentMethod, changeCashReceived } =
    useSaleCartContext();

  const { store } = useStore();
  const { register } = useRegister();

  const { fetchAddPoint, addPoint } = useAddPoint();
  const [disableGivePoint, setDisableGivePoint] = useState<boolean>(false);
  const receivedAmountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // モーダルが開いたときにフォーカスを設定
    if (open) {
      setTimeout(() => {
        // 現金の場合はinputにフォーカス、それ以外の場合もフォーカスを試みる
        receivedAmountInputRef.current?.focus();
        // inputが選択可能な状態なら全選択
        receivedAmountInputRef.current?.select();
      }, 100);
    }
  }, [open]);

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
        TransactionKind.sell,
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

  // レジの支払い方法（販売）を配列化
  const availablePaymentMethods = register?.sell_payment_method
    ?.split(',')
    .map((m) => m.trim())
    .filter((m): m is TransactionPaymentMethod =>
      Object.values(TransactionPaymentMethod).includes(
        m as TransactionPaymentMethod,
      ),
    );

  // 表示用のラベル定義
  const allPaymentMethodOptions: {
    method: TransactionPaymentMethod;
    label: string;
  }[] = [
    { method: TransactionPaymentMethod.cash, label: '現金' },
    { method: TransactionPaymentMethod.square, label: 'カード' },
    { method: TransactionPaymentMethod.paypay, label: 'QR決済' },
    { method: TransactionPaymentMethod.felica, label: '電子マネー' },
    { method: TransactionPaymentMethod.bank, label: '銀行振込' },
  ];
  const paymentMethodOptions = isReservationDeposit
    ? allPaymentMethodOptions.filter(
        (opt) => opt.method === TransactionPaymentMethod.cash,
      )
    : allPaymentMethodOptions;

  const isPaymentMethodInvalid = availablePaymentMethods?.length === 0;
  const isTotalExceedingReceivedPrice = !!(
    state.receivedPrice && state.totalPrice > state.receivedPrice
  );

  const {
    createDraftSellTransaction,
    createSellTransaction,
    cancelDraftSellTransaction,
  } = useSellTransactions();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const { ePosDev } = useEposDevice();
  const { getCustomerReservationReceptionReceipt } =
    useGetCustomerReservationReceptionReceipt();
  const [transactionId, setTransactionId] = useState<number | null>(null);

  // 取引完了後のモーダルの開閉状況
  const [isPaymentSummaryModalOpen, setIsPaymentSummaryModalOpen] =
    useState(false);

  //会計処理途中キャンセル関数
  const cancelablePaymentMethods: Array<TransactionPaymentMethod> = [
    TransactionPaymentMethod.felica,
    TransactionPaymentMethod.paypay,
    TransactionPaymentMethod.square,
  ];

  // 会計中のローディング状態
  const [isLoading, setIsLoading] = useState(false);

  // 予約票印刷
  const handleReceiptOutput = async (productId: number) => {
    const res = await getCustomerReservationReceptionReceipt(
      store.id,
      productId,
    );
    if (ePosDev && res && res.receiptCommand) {
      await ePosDev.printWithCommand(res.receiptCommand, store.id);
    }
  };

  const handleCreateTransaction = async () => {
    let recievedPrice = state.receivedPrice;
    let changePrice = state.changePrice;

    if (!staffAccountID || Number.isNaN(Number(staffAccountID))) {
      return;
    }

    if (
      state.paymentMethod == TransactionPaymentMethod.cash &&
      !state.receivedPrice
    ) {
      recievedPrice = state.totalPrice;
      changePrice = 0;
      changeCashReceived(state.totalPrice);
    }

    // cartsをマッピング
    const mappedCarts = state.carts
      .map((cart) =>
        cart.variants.map((variant) => ({
          product_id: cart.productId,
          item_count: variant.itemCount,
          unit_price: variant.unitPrice,
          discount_price: calculateDiscountPrice({
            discountAmount: variant.individualDiscount?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
          original_unit_price:
            cart.originalSpecificSalePrice ?? cart.originalSalePrice ?? 0,
          sale_id: variant.sale?.id,
          sale_discount_price: calculateDiscountPrice({
            discountAmount: variant.sale?.discountAmount ?? '0',
            unitPrice: variant.unitPrice,
          }),
          reservation_price: variant.reservationPrice,
          reservation_reception_product_id_for_deposit:
            variant.reservationReceptionProductIdForDeposit,
          reservation_reception_product_id_for_receive:
            variant.reservationReceptionProductIdForReceive,
        })),
      )
      .flat();

    const transactionRequest: TransactionAPI['create']['request'] = {
      id: state.id,
      store_id: store.id,
      staff_account_id: Number(staffAccountID),
      customer_id: state.customer?.id,
      register_id: register?.id,
      transaction_kind: TransactionKind.sell,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: recievedPrice,
      change_price: changePrice,
      discount_price: state.discountPrice,
      point_discount_price: state.point === undefined ? 0 : -state.point, // ポイント利用時はマイナス値を設定
      tax: state.tax,
      set_deals: state.availableSetDeals?.map((deal) => ({
        set_deal_id: deal.setDealID,
        apply_count: deal.applyCount,
        total_discount_price: deal.totalDiscountPrice,
      })),
      carts: mappedCarts,
      disableGivePoint: disableGivePoint,
    };

    setIsLoading(true);

    try {
      const draftTransactionId =
        await createDraftSellTransaction(transactionRequest);

      if (!draftTransactionId) {
        return;
      }

      setTransactionId(draftTransactionId);

      const res = await createSellTransaction({
        ...transactionRequest,
        id: draftTransactionId,
      });

      if (res) {
        //キャッシュドロワーを自動で開く 現金会計だった時のみ
        if (
          ePosDev?.devices.printer &&
          state.paymentMethod == TransactionPaymentMethod.cash
        ) {
          ePosDev.openDrawer();
        }

        setIsPaymentSummaryModalOpen(true);

        //カスタマーディスプレイに表示
        if (ePosDev && ePosDev.devices.display) {
          // お釣りが0円を下回る場合は0円を表示(paypay, カードなどはお預かり金額が0円になるため)
          const changePrice =
            (recievedPrice ?? 0) - state.totalPrice < 0
              ? 0
              : (recievedPrice ?? 0) - state.totalPrice;
          ePosDev.displayPrice(state.totalPrice, changePrice);
        }
        // レシート印刷
        //自動印刷設定がtrueになってたら印刷する
        if (ePosDev && register?.auto_print_receipt_enabled) {
          await ePosDev.printReceipt(draftTransactionId, store.id, 'receipt');
        }

        //予約票印刷（前金支払い時のみ：isReservationDeposit===true）
        // awaitで非同期にすることでレシート印刷が1件ずつ行われる
        if (isReservationDeposit) {
          for (const c of mappedCarts) {
            if (!c.reservation_reception_product_id_for_deposit) continue;
            await handleReceiptOutput(
              c.reservation_reception_product_id_for_deposit,
            );
          }
        }
        resetCustomer(); // 会計完了したら顧客を初期化
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setDisableGivePoint(false);
    }
  };

  // モーダルを閉じるときに必ずtransactionIdを初期化
  const handleClose = () => {
    setTransactionId(null);
    setIsPaymentSummaryModalOpen(false);
    onClose();
    setDisableGivePoint(false);
  };

  return (
    <>
      {isPaymentSummaryModalOpen && transactionId ? (
        <SalePaymentSummaryModal
          open={isPaymentSummaryModalOpen}
          onClose={handleClose}
          transactionId={transactionId}
        />
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
                <Typography variant="body1">全体割引</Typography>
                <Typography
                  variant="body1"
                  data-testid="payment-discount-amount"
                >
                  {Math.abs(state.discountPrice).toLocaleString()}円
                </Typography>
              </Box>
              <Box>
                {state.availableSetDeals?.map((deal) => {
                  // targetProducts から対応する cartItem の情報を取得
                  const targetProductsInfo = deal.targetProducts.map(
                    (product) => {
                      const cartItem = state.carts.find(
                        (item) => item.productId === product.productID,
                      );
                      return cartItem
                        ? cartItem.displayName
                        : `商品ID: ${product.productID}`;
                    },
                  );

                  return (
                    <Box
                      key={deal.setDealID}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {/* セール名とアイコン */}
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                          maxWidth: '50%',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <Tooltip
                          title={
                            <>
                              <Typography variant="body2" fontWeight="bold">
                                {deal.displayName} 適用
                              </Typography>
                              {targetProductsInfo.map((info, index) => (
                                <Typography key={index} variant="body2">
                                  {info}
                                </Typography>
                              ))}
                            </>
                          }
                          placement="top"
                          arrow
                        >
                          <Box display="flex" alignItems="center">
                            <Typography
                              sx={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {deal.displayName}
                            </Typography>
                            <IconButton
                              size="small"
                              sx={{ padding: 0, marginLeft: 1 }}
                            >
                              <HelpOutlineIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        </Tooltip>
                      </Box>
                      <Typography>
                        {Math.abs(
                          state.setDealDiscountPrice ?? 0,
                        ).toLocaleString()}
                        円
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              {state.point && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">ポイント利用</Typography>
                  <Typography variant="body1">
                    {state.point.toLocaleString()}PT
                  </Typography>
                </Box>
              )}
              <Divider />
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
                    sx={{ color: 'text.primary', mb: 1 }}
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
                      {/* チェックボックス */}
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

            <Stack flexDirection="column" width="50%" p={2} gap={2}>
              <Typography sx={{ color: 'primary.main' }} variant="body1">
                支払い方法
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 2, flexFlow: 'wrap' }}
                data-testid="payment-method-container"
              >
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

              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ color: 'text.primary' }} variant="body1">
                  お預かり金額
                </Typography>

                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{
                    transform: 'translateY(15px)',
                    fontWeight: 'bold',
                    opacity: isTotalExceedingReceivedPrice ? 1 : 0,
                  }}
                >
                  お支払い金額を下回っています
                </Typography>
              </Box>
              <NumericTextField
                sx={{ width: '100%' }}
                suffix="円"
                value={state.receivedPrice ?? 0}
                onChange={changeCashReceived}
                disabled={state.paymentMethod !== TransactionPaymentMethod.cash}
                size="small"
                dataTestId="payment-received-input"
                inputRef={receivedAmountInputRef}
                autoFocus
              />
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="payment-change-container"
              >
                <Typography variant="body1">お釣り</Typography>
                <Typography
                  variant="body1"
                  data-testid="payment-change-amount"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: 20,
                  }}
                >
                  {(state.changePrice ?? 0).toLocaleString()}円
                </Typography>
              </Box>
              <PrimaryButtonWithIcon
                sx={{
                  width: '100%',
                  height: '50px',
                }}
                onClick={handleCreateTransaction}
                loading={isLoading}
                disabled={
                  !state.paymentMethod ||
                  isPaymentMethodInvalid ||
                  isTotalExceedingReceivedPrice
                }
                data-testid="payment-confirm-button"
              >
                確定
              </PrimaryButtonWithIcon>
              <SecondaryButtonWithIcon
                sx={{
                  width: '100%',
                  height: '30px',
                }}
                onClick={() => {
                  onClose(), setDisableGivePoint(false);
                }}
                data-testid="payment-cancel-button"
              >
                キャンセル
              </SecondaryButtonWithIcon>
              {state.paymentMethod &&
                cancelablePaymentMethods.includes(state.paymentMethod) &&
                isLoading &&
                transactionId && (
                  <Box
                    display="grid"
                    justifyContent="space-between"
                    gap={2}
                    sx={{
                      gridTemplateColumns: 'repeat(1,1fr)',
                      marginTop: 2,
                    }}
                  >
                    <TertiaryButton
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => {
                        if (transactionId) {
                          cancelDraftSellTransaction({
                            store_id: store.id,
                            transaction_id: transactionId,
                          });
                        }

                        setTransactionId(null);
                      }}
                    >
                      端末会計をキャンセル
                    </TertiaryButton>
                  </Box>
                )}
            </Stack>
          </Stack>
        </CustomModalWithHeader>
      )}
    </>
  );
};
