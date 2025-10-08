'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import theme from '@/theme';
import { useStore } from '@/contexts/StoreContext';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { useTransaction } from '@/feature/transaction/hooks/useTransaction';
import BarcodeScanner from '@/app/auth/(dashboard)/sale/components/BarcodeScanner';
import Grey500whiteButton from '@/components/buttons/grey500whiteButton';
import { MobileItemSearchSection } from '@/components/common/MobileItemSearchSection';
import { SaleCartCardContainer } from '@/feature/sale/components/cards/SaleCartCardContainer';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { SaleCartItem } from '@/feature/sale/hooks/useSaleCart';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

const MobileSalePage = () => {
  const { store } = useStore();
  const { addProducts } = useSaleCartContext();

  const searchParams = useSearchParams();

  const transactionID: string | undefined =
    searchParams.get('transactionID') ?? undefined;

  const { transaction, fetchTransaction } = useTransaction();

  useEffect(() => {
    if (transactionID) {
      fetchTransaction(store.id, parseInt(transactionID));
    }
  }, [fetchTransaction, store.id, transactionID]);

  const { products, listProductsByProductIDs } = useProducts();

  useEffect(() => {
    if (transaction) {
      const productIDs = transaction.transaction_carts.map(
        (cart) => cart.product_id,
      );
      listProductsByProductIDs(store.id, productIDs);
    }
  }, [listProductsByProductIDs, store.id, transaction]);

  // 一度実行されたかを記録するフラグ
  const hasExecuted = useRef(false);

  const addTransactionItems = useCallback(async () => {
    if (!transaction || !products || hasExecuted.current) return;
    hasExecuted.current = true;

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const cart of transaction.transaction_carts) {
      if (!productMap.has(cart.product_id)) continue;
      const product = productMap.get(cart.product_id)!;
      await addProducts({
        newProduct: {
          productId: cart.product_id,
          imageUrl: product.image_url ?? '',
          displayName: product.displayNameWithMeta ?? '',
          conditionName: product.is_special_price_product
            ? '特価在庫'
            : product.condition_option_display_name ?? '',
          stockNumber: product.stock_number ?? 0,
          originalSalePrice: product.sell_price ?? 0,
          originalSpecificSalePrice: product.specific_sell_price ?? 0,
        },
        itemCount: cart.item_count,
        unitPrice: cart.unit_price,
        isUnique: true, // 既存の行との結合を禁止
      });
    }
  }, [transaction, products, addProducts]);

  useEffect(() => {
    if (!transaction || !products || hasExecuted.current) return;
    addTransactionItems();
  }, [transaction, products, addTransactionItems]);

  // モード切替
  const [isSearchMode, setIsSearchMode] = useState(false);

  const { setAlertState } = useAlert();

  const handleBarcodeDetected = async (barcode: string) => {
    const clientAPI = createClientAPI();

    try {
      const response = await clientAPI.product.listProducts({
        storeID: store.id,
        code: BigInt(barcode),
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        return;
      }

      if (response.products.length === 1) {
        const item = response.products[0];

        if (
          !item.sell_price ||
          item.stock_number === null ||
          item.stock_number === 0
        ) {
          setAlertState({
            message:
              '必要な情報がデータベースに登録されていないため、追加できません。',
            severity: 'error',
          });
        } else {
          const newProduct: Omit<SaleCartItem, 'variants'> = {
            productId: item.id,
            imageUrl: item.image_url ?? '',
            displayName: item.display_name,
            conditionName: item.condition_option_display_name ?? '',
            stockNumber: item.stock_number,
            originalSalePrice: item.sell_price,
            originalSpecificSalePrice: item.specific_sell_price,
          };

          await addProducts({
            newProduct: newProduct,
            itemCount: 1,
            unitPrice: item.specific_sell_price ?? item.sell_price,
          });
        }
      } else {
        setAlertState({
          message: '商品が見つかりませんでした。',
          severity: 'error',
        });
      }
    } catch (error) {
      setAlertState({
        message: '予期せぬエラーが発生しました。',
        severity: 'error',
      });
    }
  };

  const handleAddToCart = async (
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

    // infinite_stock が true の場合は在庫制限なしで追加可能
    const stockNumber = row.infinite_stock
      ? 1
      : selectedProduct.stock_number ?? 0;

    const newProduct = {
      productId: selectedProduct.id,
      imageUrl: row.image_url ?? '',
      displayName: row.display_name ?? '',
      conditionName: selectedProduct.condition_option_display_name ?? '',
      stockNumber: stockNumber, // 在庫数の代わりに無限
      originalSalePrice: selectedProduct.sell_price ?? 0,
      originalSpecificSalePrice: selectedProduct.specific_sell_price ?? 0,
      infinite_stock: row.infinite_stock,
    };

    await addProducts({
      newProduct: newProduct,
      itemCount: registerCount,
      unitPrice: unitPriceValue,
    });
  };

  return (
    <Stack
      flexDirection={'column'}
      gap={1}
      width={'100%'}
      height={'100%'}
      padding={'10px'}
      sx={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Stack
        flexDirection={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        width={'100%'}
        height={'36px'}
      >
        <Stack direction={'row'} gap={0}>
          <ShoppingCartIcon sx={{ color: theme.palette.grey[700] }} />
          <Typography variant="body1">販売</Typography>
        </Stack>
        <Grey500whiteButton onClick={() => setIsSearchMode((prev) => !prev)}>
          {isSearchMode ? '検索モードへ' : 'スキャンモードへ'}
        </Grey500whiteButton>
      </Stack>

      <Box
        sx={{
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isSearchMode ? (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'grey.500',
            }}
          >
            <BarcodeScanner
              onBarcodeDetected={handleBarcodeDetected}
              detectionCooldown={2000}
            />
          </Box>
        ) : (
          <MobileItemSearchSection
            onRegister={handleAddToCart}
            height="400px"
            isStockRestriction={true}
          />
        )}
      </Box>

      <SaleCartCardContainer
        transactionID={transactionID}
        customer={undefined}
      />
    </Stack>
  );
};

export default MobileSalePage;
