'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { SaleAccountModal } from '@/feature/sale/components/modals/SaleAccountModal';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  calculateDiscountPrice,
  getTotalItemCount,
} from '@/feature/sale/hooks/useSaleCart';
import { DiscountModal } from '@/components/modals/discount/DiscountModal';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { TransactionKind } from '@prisma/client';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { useStore } from '@/contexts/StoreContext';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { PATH } from '@/constants/paths';
import { TemporaryHoldModal } from '@/components/modals/sale+purchase/TemporaryHoldModal';
import { PointInput } from '@/feature/sale/components/cards/PointInput';
import { CustomerType } from '@/feature/customer/hooks/useCustomer';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  isAddCartLoading: boolean;
  memo: string;
  setMemo: (memo: string) => void;
  customer: CustomerType | undefined;
  resetCustomer: () => void;
  isReservationDeposit: boolean;
  isReservationReceive: boolean;
}
export const SaleDetailsCard = ({
  isAddCartLoading,
  memo,
  setMemo,
  customer,
  resetCustomer,
  isReservationDeposit,
  isReservationReceive,
}: Props) => {
  const { ePosDev } = useEposDevice();
  const { state, applyGlobalDiscount, getCartTotalItemCount, resetCart } =
    useSaleCartContext();
  const { store } = useStore();

  // お会計モーダルの表示状態
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // 全体割引モーダルの表示状態
  const [isGlobalDiscountModalOpen, setIsGlobalDiscountModalOpen] =
    useState(false);

  // 一時保留モーダルの表示状態
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);

  const { createDraftSellTransaction, isLoading } = useSellTransactions();

  const handleCreateTransaction = async () => {
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
        })),
      )
      .flat();

    const transactionRequest: TransactionAPI['create']['request'] = {
      id: state.id,
      store_id: store.id,
      customer_id: state.customer?.id,
      transaction_kind: TransactionKind.sell,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: state.receivedPrice,
      change_price: state.changePrice,
      discount_price: state.discountPrice,
      point_discount_price: state.point ?? 0,
      tax: state.tax,
      set_deals: state.availableSetDeals?.map((deal) => ({
        set_deal_id: deal.setDealID,
        apply_count: deal.applyCount,
        total_discount_price: deal.totalDiscountPrice,
      })),
      carts: mappedCarts,
      description: memo === '' ? undefined : memo,
    };

    const transactionId = await createDraftSellTransaction(transactionRequest);

    if (transactionId) {
      resetCart();
      resetCustomer();
    }
    // クエリパラメーターも削除したい
    setIsHoldModalOpen(false);
    // ページを更新するためにhrefを変更(router.pushだとページが更新されない)
    window.location.href = PATH.SALE.root;
  };

  // 手動値引きの権限があるか
  const { accountGroup } = useAccountGroupContext();
  const hasManualDiscount = accountGroup?.set_transaction_manual_discount;

  return (
    <>
      <Card
        sx={{ width: '100%', backgroundColor: 'grey.100', height: '100%' }}
        data-testid="payment-details-card"
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
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="subtotal-container"
              >
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  小計
                </Typography>
                <Typography
                  sx={{ color: 'text.primary' }}
                  variant="body2"
                  data-testid="subtotal-amount"
                >
                  {state.subtotalPrice?.toLocaleString()}円
                </Typography>
              </Box>
              {/* セット割引 */}
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
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      maxWidth: '100%',
                    }}
                  >
                    {/* セール名とアイコン */}
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        width: '60%',
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
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0}
                          sx={{ width: '100%' }}
                        >
                          <Typography
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {deal.displayName}
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{
                              flexShrink: 0,
                              padding: 0,
                              marginLeft: 0,
                            }}
                          >
                            <HelpOutlineIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </Box>

                    {/* 割引金額 */}
                    <Typography>
                      {Math.abs(
                        state.setDealDiscountPrice ?? 0,
                      ).toLocaleString()}
                      円
                    </Typography>
                  </Box>
                );
              })}
              {/* 全体割引 */}
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="discount-container"
              >
                <Typography sx={{ color: 'text.primary' }} variant="body2">
                  全体割引
                </Typography>
                <Typography
                  sx={{ color: 'text.primary' }}
                  variant="body2"
                  data-testid="discount-amount"
                >
                  {Math.abs(state.discountPrice).toLocaleString()}円
                </Typography>
              </Box>
              {/* 予約受け取り時の受領済み前金 */}
              {isReservationReceive && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  data-testid="discount-container"
                >
                  <Typography sx={{ color: 'text.primary' }} variant="body2">
                    受領済み前金
                  </Typography>
                  <Typography
                    sx={{ color: 'text.primary' }}
                    variant="body2"
                    data-testid="discount-amount"
                  >
                    {state.carts
                      .reduce(
                        (sum, cart) =>
                          sum +
                          cart.variants.reduce(
                            (vSum, v) =>
                              vSum +
                              Math.abs(v.reservationPrice ?? 0) * v.itemCount,
                            0,
                          ),
                        0,
                      )
                      .toLocaleString()}
                    円
                  </Typography>
                </Box>
              )}
              {/* ポイント利用 */}
              {state.point && (
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ color: 'text.primary' }} variant="body2">
                    ポイント利用
                  </Typography>
                  <Typography sx={{ color: 'text.primary' }} variant="body2">
                    {state.point.toLocaleString()}PT
                  </Typography>
                </Box>
              )}
              <Divider />
              {/* 合計 */}
              <Box
                display="flex"
                justifyContent="space-between"
                data-testid="total-container"
              >
                <Typography sx={{ color: 'text.primary' }}>合計</Typography>
                <Typography
                  sx={{ color: 'text.primary' }}
                  data-testid="total-amount"
                >
                  {state.totalPrice.toLocaleString()}円
                </Typography>
              </Box>
              {/* 税金 */}
              <Box
                display="flex"
                justifyContent="flex-end"
                data-testid="tax-container"
              >
                <Stack flexDirection="column" alignItems="flex-end" gap={1}>
                  <Typography
                    sx={{ color: 'text.primary' }}
                    variant="caption"
                    data-testid="tax-amount"
                  >
                    内消費税{state.tax?.toLocaleString()}円
                  </Typography>
                  {/* <Typography sx={{ color: 'text.primary' }} variant="caption">
                    (⚪︎⚪︎⚪︎pt付与予定)
                  </Typography> */}
                </Stack>
              </Box>
              {/* 割引ボタン */}
              {hasManualDiscount && !isReservationDeposit && (
                <SecondaryButtonWithIcon
                  sx={{ width: '100%', height: '50px' }}
                  onClick={() => setIsGlobalDiscountModalOpen(true)}
                >
                  割引
                </SecondaryButtonWithIcon>
              )}
              <Box display="flex" justifyContent="flex-end">
                <HelpIcon helpArchivesNumber={1121} />
              </Box>
              {/* ポイント利用 */}
              {customer && !isReservationDeposit && (
                <PointInput customer={customer} />
              )}
              {customer && !isReservationDeposit && (
                <Box display="flex" justifyContent="flex-end">
                  <HelpIcon helpArchivesNumber={2400} />
                </Box>
              )}
            </Stack>

            <Stack flexDirection="column" gap={2}>
              {/* 支払いへ進む */}
              <PrimaryButtonWithIcon
                sx={{ width: '100%', height: '50px', minWidth: 0 }}
                onClick={() => {
                  if (ePosDev?.devices.display) {
                    ePosDev.displayPrice(state.totalPrice);
                  }
                  setIsSaleModalOpen(true);
                }}
                disabled={
                  getTotalItemCount(state.carts) === 0 ||
                  isLoading ||
                  isAddCartLoading
                }
                loading={isLoading || isAddCartLoading}
                data-testid="proceed-to-payment-button"
              >
                支払いへ進む
              </PrimaryButtonWithIcon>

              <SecondaryButtonWithIcon
                sx={{ width: '100%', height: '35px' }}
                onClick={() => setIsHoldModalOpen(true)}
                loading={isLoading || isAddCartLoading}
                disabled={
                  getTotalItemCount(state.carts) === 0 || isReservationDeposit
                }
                data-testid="hold-transaction-button"
              >
                一時保留
              </SecondaryButtonWithIcon>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* モーダル */}
      <DiscountModal
        open={isGlobalDiscountModalOpen}
        onClose={() => setIsGlobalDiscountModalOpen(false)}
        onConfirm={applyGlobalDiscount}
        type="sale"
      />
      <SaleAccountModal
        open={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
        }}
        resetCustomer={resetCustomer}
        isReservationDeposit={isReservationDeposit}
      />
      <TemporaryHoldModal
        open={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onPrimaryButtonClick={handleCreateTransaction}
        value={memo}
        setValue={setMemo}
        loading={isLoading}
      />
    </>
  );
};
