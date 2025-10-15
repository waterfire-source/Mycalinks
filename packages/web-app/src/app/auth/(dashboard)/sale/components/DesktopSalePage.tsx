'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { CustomerSmallCard } from '@/feature/customer/components/CustomerSmallCard';
import { SaleTableCard } from '@/feature/sale/components/cards/SaleTableCard';
import { SaleDetailsCard } from '@/feature/sale/components/cards/SaleDetailsCard';
import { ProductScanButtonContainer } from '@/feature/sale/components/scan/ProductScanButtonContainer';
import { OpenSaleDraftButton } from '@/feature/sale/components/OpenSaleDraftListButton';
import { useStore } from '@/contexts/StoreContext';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { useTransaction } from '@/feature/transaction/hooks/useTransaction';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { EditPointButton } from '@/feature/customer/components/EditPointButton';
import { OpenDrawerButton } from '@/feature/ePosDevice/components/OpenDrawerButton';

export const DesktopSalePage = () => {
  const { store } = useStore();
  const {
    customer,
    fetchCustomerByMycaID,
    fetchCustomerByCustomerID,
    resetCustomer,
  } = useCustomer();
  const {
    state,
    setTransactionID,
    setCustomer,
    addProducts,
    resetCart,
    applyGlobalDiscount,
  } = useSaleCartContext();
  const { transaction, fetchTransaction } = useTransaction();
  const { products, listProductsByProductIDs } = useProducts();
  const searchParams = useSearchParams();
  const customerID = searchParams.get('customerID') ?? undefined;
  const transactionID = searchParams.get('transactionID') ?? undefined;
  const [executedId, setExecutedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memo, setMemo] = useState<string>('');

  const isReservationDeposit = useMemo(() => {
    if (!transaction) return false;
    return transaction.transaction_carts.some(
      (cart) => !!cart.reservation_reception_product_id_for_deposit,
    );
  }, [transaction]);

  const isReservationReceive = useMemo(() => {
    if (!transaction) return false;
    return transaction.transaction_carts.some(
      (cart) => !!cart.reservation_reception_product_id_for_receive,
    );
  }, [transaction]);

  useEffect(() => {
    return setCustomer(customer);
  }, [customer, setCustomer]);

  useEffect(() => {
    if (customerID && store.id)
      fetchCustomerByCustomerID(store.id, parseInt(customerID));
  }, [customerID, store.id, fetchCustomerByCustomerID]);

  useEffect(() => {
    if (transactionID && store.id) {
      resetCart();
      setExecutedId(null);
      setTransactionID(parseInt(transactionID));
      fetchTransaction(store.id, parseInt(transactionID));
    }
  }, [transactionID, store.id, resetCart, fetchTransaction]);

  useEffect(() => {
    if (transaction && transaction.transaction_carts) {
      const ids = transaction.transaction_carts.map((x) => x.product_id);
      listProductsByProductIDs(store.id, ids);
      setMemo(transaction.description ?? '');
    }
  }, [transaction, store.id, listProductsByProductIDs]);

  const addTransactionItems = useCallback(async () => {
    if (!transaction || !transactionID || !products) return;
    if (transaction.id !== parseInt(transactionID)) return;
    if (executedId === transaction.id) return;
    setIsLoading(true);
    try {
      setExecutedId(transaction.id);
      const map = new Map(products.map((x) => [x.id, x]));
      for (const c of transaction.transaction_carts) {
        const p = map.get(c.product_id);
        if (!p) continue;

        await addProducts({
          newProduct: {
            productId: p.id,
            imageUrl: p.image_url ?? '',
            displayName: p.displayNameWithMeta ?? '',
            conditionName: p.is_special_price_product
              ? '特価在庫'
              : p.condition_option_display_name ?? '',
            stockNumber: p.stock_number ?? 0,
            originalSalePrice: p.sell_price ?? 0,
            originalSpecificSalePrice: p.specific_sell_price ?? 0,
          },
          itemCount: c.item_count,
          unitPrice: c.unit_price,
          discountPrice: c.discount_price,
          isUnique: true,
          reservationPrice: c.reservation_price,
          reservationReceptionProductIdForDeposit:
            c.reservation_reception_product_id_for_deposit,
          reservationReceptionProductIdForReceive:
            c.reservation_reception_product_id_for_receive,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [transaction, transactionID, products, addProducts, executedId]);

  useEffect(() => {
    if (transaction && products) {
      addTransactionItems();
      applyGlobalDiscount(transaction.discount_price, '円');
    }
  }, [transaction, products, addTransactionItems]);

  return (
    <>
      <ContainerLayout
        title="販売会計"
        helpArchivesNumber={951}
        actions={
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            width="100%"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ProductScanButtonContainer />
            </Box>

            <Stack flexDirection="row" gap={1}>
              <OpenDrawerButton />
              <EditPointButton />
              <OpenSaleDraftButton />
            </Stack>
          </Stack>
        }
      >
        <Stack
          width="100%"
          height="100%"
          flexDirection="row"
          gap={1}
          overflow="auto"
        >
          <Stack width="80%" height="100%" flexDirection="column" gap={3}>
            <Box height="100px">
              <CustomerSmallCard
                customer={state.customer}
                store={store}
                fetchCustomerByMycaID={fetchCustomerByMycaID}
                resetCustomer={resetCustomer}
                isSale={true}
              />
            </Box>
            <Stack height="100%" overflow="auto">
              <SaleTableCard isReservationDeposit={isReservationDeposit} />
            </Stack>
          </Stack>
          <Stack width="20%" height="100%" flexDirection="column" gap={1}>
            <SaleDetailsCard
              isAddCartLoading={isLoading}
              memo={memo}
              setMemo={setMemo}
              customer={customer}
              resetCustomer={resetCustomer}
              isReservationDeposit={isReservationDeposit}
              isReservationReceive={isReservationReceive}
            />
          </Stack>
        </Stack>
      </ContainerLayout>
    </>
  );
};
