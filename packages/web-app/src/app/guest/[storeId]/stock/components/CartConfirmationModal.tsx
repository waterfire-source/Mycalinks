import { useState, useEffect, useMemo } from 'react';
import { useGuestOrderCart } from '@/contexts/GuestOrderCartContext';
import { TransactionKind } from '@prisma/client';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { calculateDiscountPrice } from '@/feature/sale/hooks/useSaleCart';

import { useParamsInGuest } from '@/app/guest/[storeId]/stock/hooks/useParamsInGuest';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  open: boolean;
  onClose: () => void;
  onOrderComplete: (receptionNumber: number) => void;
}

export const CartConfirmationModal: React.FC<Props> = ({
  open,
  onClose,
  onOrderComplete,
}: Props) => {
  const {
    cartItems,
    clearCart,
    addToCart,
    removeFromCart,
    totalQuantity,
    totalPrice,
  } = useGuestOrderCart();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const { createDraftSellTransactionByGuest } = useSellTransactions();
  const { storeId } = useParamsInGuest();
  const { ePosDev } = useEposDevice();

  const [isLoading, setIsLoading] = useState(false);

  // カートの変更時に quantities を更新
  useEffect(() => {
    const initialQuantities: { [key: string]: number } = {};
    cartItems.forEach((product) => {
      initialQuantities[product.id] = product.quantity || 0;
    });
    setQuantities(initialQuantities);
  }, [cartItems]);

  // カートの商品チェック
  const isOrderValid = useMemo(() => {
    return cartItems.length > 0;
  }, [cartItems]);

  // 数量変更時の処理（在庫数を超えないように制御）
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = cartItems.find((p) => p.id === productId);
    if (!product) return;

    // 0にしようとしたらその商品をカートから削除する
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    // 0以上、在庫以下に制限
    const validatedQuantity = Math.min(
      Math.max(0, newQuantity),
      product.stockNumber,
    );

    setQuantities((prev) => ({ ...prev, [productId]: validatedQuantity }));

    if (product) {
      addToCart(
        productId,
        validatedQuantity,
        product.price,
        product.displayName,
        product.imageUrl,
        product.conditionName,
        product.stockNumber,
      );
    }
  };

  // 販売保留処理
  const handleOrder = async () => {
    if (!isOrderValid) return;

    // cartsをマッピング
    const mappedCarts = cartItems
      .map((product) => ({
        product_id: Number(product.id),
        item_count: product.quantity,
        unit_price: product.price,
        discount_price: calculateDiscountPrice({
          discountAmount: '0',
          unitPrice: product.price,
        }),
        original_unit_price: product.price ?? 0,
        sale_id: null,
        sale_discount_price: calculateDiscountPrice({
          discountAmount: '0',
          unitPrice: product.price,
        }),
      }))
      .flat();

    const transactionRequest: TransactionAPI['create']['request'] = {
      id: null,
      store_id: Number(storeId),
      transaction_kind: TransactionKind.sell,
      total_price: totalPrice,
      tax: null,
      discount_price: 0,
      subtotal_price: null,
      payment_method: null,
      recieved_price: null,
      change_price: null,
      asDraft: true,
      carts: mappedCarts,
    };

    try {
      setIsLoading(true);
      const res = await createDraftSellTransactionByGuest(transactionRequest);
      if (res && res.reception_number) {
        clearCart(); // カートをクリア
        onOrderComplete(res.reception_number); // モーダルを閉じる
        //印刷
        if (ePosDev && res.purchaseReceptionNumberForStaffReceiptCommand) {
          await ePosDev.printWithCommand(
            res.purchaseReceptionNumberForStaffReceiptCommand,
            Number(storeId),
          );
        }
      }
    } catch (error) {
      console.error('取引作成エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="カート"
      width="70%"
      height="90%"
      actionButtonText="注文する"
      cancelButtonText="在庫検索に戻る"
      onActionButtonClick={handleOrder}
      onCancelClick={onClose}
      isAble={isOrderValid}
      loading={isLoading}
    >
      {cartItems.length === 0 ? (
        <Typography variant="body1">カートに商品がありません</Typography>
      ) : (
        <>
          {/* 合計金額・点数の表示 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: '16px',
              marginBottom: '8px',
            }}
          >
            <Typography variant="h6">
              合計 {totalQuantity.toLocaleString()} 点{' '}
              {totalPrice.toLocaleString()} 円
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {cartItems.map((product) => (
              <Grid item xs={12} key={product.id}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid',
                    borderRadius: '8px',
                    p: 2,
                    boxShadow: 3,
                    height: '120px',
                    justifyContent: 'space-between',
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={2}>
                      <ItemImage imageUrl={product.imageUrl} height={100} />
                    </Grid>

                    {/* 商品情報 */}
                    <Grid item xs={8}>
                      <ItemText text={product.displayName} />
                      <Typography
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'nowrap',
                          gap: '8px',
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {product.conditionName}
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            whiteSpace: 'normal',
                            color: 'primary.main',
                            fontWeight: 'bold',
                          }}
                        >
                          {product.price.toLocaleString()} 円
                        </Box>
                      </Typography>
                    </Grid>

                    {/* 数量と操作ボタン */}
                    <Grid item xs={2}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="flex-end"
                      >
                        <IconButton
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              Math.max(0, quantities[product.id] - 1),
                            )
                          }
                          size="small"
                          disabled={quantities[product.id] <= 0}
                        >
                          <Remove fontSize="inherit" />
                        </IconButton>
                        <NumericTextField
                          value={quantities[product.id]}
                          onChange={(value) =>
                            handleQuantityChange(product.id, Number(value))
                          }
                          InputProps={{
                            inputProps: {
                              style: { textAlign: 'right', width: '80px' },
                              min: 0,
                              max: product.stockNumber,
                            },
                          }}
                          size="small"
                        />
                        <IconButton
                          onClick={() =>
                            handleQuantityChange(
                              product.id,
                              Math.min(
                                quantities[product.id] + 1,
                                product.stockNumber,
                              ),
                            )
                          }
                          size="small"
                        >
                          <Add fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </CustomModalWithIcon>
  );
};
