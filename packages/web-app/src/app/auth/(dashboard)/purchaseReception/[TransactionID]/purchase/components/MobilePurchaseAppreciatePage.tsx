'use client';

import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import {
  TransactionCart,
  useTransactionCart,
} from '@/feature/purchaseReception/hooks/useTransactionCart';
import theme from '@/theme';
import { MonetizationOn as MonetizationOnIcon } from '@mui/icons-material';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { MobileItemSearchSection } from '@/components/common/MobileItemSearchSection';

export const MobilePurchaseAppreciatePage: React.FC = () => {
  const params = useParams();
  const transactionId = Number(params.TransactionID);

  const {
    cartItems,
    setCartItems,
    addToCart,
    isLoading: isTransactionCartLoading,
  } = useTransactionCart(transactionId);

  const handleAddToCart = (
    productId: number,
    row: BackendItemAPI[0]['response']['200']['items'][0],
    registerCount: number,
  ) => {
    const selectedProduct = row.products.find(
      (product) => product.id === productId,
    );

    if (!selectedProduct) {
      return;
    }

    const unitPriceValue =
      selectedProduct.specific_buy_price ?? selectedProduct.buy_price ?? 0;

    const newCartItem: Omit<
      TransactionCart['transaction_cart_items'][0],
      'cart_item_id'
    > = {
      item_count: registerCount,
      unit_price: unitPriceValue,
      discount_price: 0,
      rarity: row.rarity,
      expansion: row.expansion,
      cardnumber: row.cardnumber,
      product_details: {
        id: selectedProduct.id,
        display_name: selectedProduct.display_name,
        displayNameWithMeta: selectedProduct.displayNameWithMeta,
        image_url: selectedProduct.image_url,
        specific_buy_price: selectedProduct.specific_buy_price,
        buy_price: selectedProduct.buy_price,
        product_code: selectedProduct.product_code,
        conditionDisplayName: selectedProduct.condition_option_display_name,
      },
      productGenreName: row.genre_display_name,
      productCategoryName: row.category_display_name,
    };

    addToCart(newCartItem);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 2,
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Stack
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Stack direction={'row'} gap={0}>
          <MonetizationOnIcon sx={{ color: theme.palette.grey[700] }} />
          <Typography variant="body1">買取</Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 2,
          padding: 1,
        }}
      >
        <MobileItemSearchSection onRegister={handleAddToCart} height="300px" />
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '100%',
            border: '1px solid',
            borderColor: 'grey.500',
            borderRadius: '4px',
          }}
        >
          {/* 査定内容 */}
          {/* <PurchaseCartCardContainer
            cartItems={cartItems}
            setCartItems={setCartItems}
            isLoading={isTransactionCartLoading}
            customer={undefined}
            transactionId={transactionId}
          /> */}
        </Box>
      </Stack>
    </Box>
  );
};
