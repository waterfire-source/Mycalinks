'use client';

import { Box, Stack, Switch, FormControlLabel } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { CustomerSmallCard } from '@/feature/customer/components/CustomerSmallCard';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { useCallback, useEffect, useState } from 'react';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { PurchaseTableCard } from '@/feature/purchase/components/cards/PurchaseTableCard';
import { PurchaseDetailsCard } from '@/feature/purchase/components/cards/PurchaseDetailsCard';
import { ProductScanButtonContainer } from '@/feature/purchase/components/buttons/ProductScanButtonContainer';
import { OpenPurchaseDraftListButton } from '@/feature/purchase/components/OpenPurchaseDraftListButton';
import { useTransaction } from '@/feature/transaction/hooks/useTransaction';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { OpenDrawerButton } from '@/feature/ePosDevice/components/OpenDrawerButton';
import { useAlert } from '@/contexts/AlertContext';
const DesktopPurchasePage = () => {
  const { store } = useStore();
  const {
    customer,
    fetchCustomerByMycaID,
    fetchCustomerByCustomerID,
    resetCustomer,
  } = useCustomer();
  const {
    state,
    applyGlobalDiscount,
    setCustomer,
    addProducts,
    resetCart,
    setTransactionID,
  } = usePurchaseCartContext();
  const { transaction, fetchTransaction } = useTransaction();
  const { products, listProductsByProductIDs } = useProducts();
  const searchParams = useSearchParams();
  const customerID = searchParams.get('customerID') ?? undefined;
  const transactionID = searchParams.get('transactionID') ?? undefined;
  const [executedId, setExecutedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [memo, setMemo] = useState<string>('');
  const { setAlertState } = useAlert();
  const [isError, setIsError] = useState(false);
  // ラベル自動印刷スイッチ状態
  const [autoPrintLabel, setAutoPrintLabel] = useState<boolean>(true);

  // 初期化: localStorageから取得
  useEffect(() => {
    const saved = localStorage.getItem('purchase_auto_print_label_enabled');
    if (saved !== null) {
      setAutoPrintLabel(saved === 'true');
    }
  }, []);

  // 変更時にlocalStorageへ保存
  const handleChangeAutoPrintLabel = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAutoPrintLabel(event.target.checked);
    localStorage.setItem(
      'purchase_auto_print_label_enabled',
      String(event.target.checked),
    );
  };

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
      fetchTransaction(store.id, Number(transactionID));
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
        const customerCart = transaction.transaction_customer_carts?.find(
          (cc) =>
            cc.product_id === c.product_id && cc.unit_price === c.unit_price,
        );

        await addProducts({
          newProduct: {
            productId: p.id,
            imageUrl: p.image_url ?? '',
            displayName: p.displayNameWithMeta ?? '',
            conditionName: p.condition_option_display_name ?? '',
            stockNumber: p.stock_number ?? 0,
            originalPurchasePrice: p.buy_price ?? 0,
            originalSpecificPurchasePrice: p.specific_buy_price ?? 0,
            infinite_stock: p.item_infinite_stock,
            managementNumber: p.management_number ?? undefined,
          },
          itemCount: customerCart?.item_count ?? c.item_count,
          unitPrice: c.unit_price,
          discountPrice: c.discount_price,
          isUnique: true,
        });
      }
    } catch (error) {
      setAlertState({
        message: '商品の追加に失敗しました。再読み込みしてださい。',
        severity: 'error',
      });
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [
    transaction,
    transactionID,
    products,
    executedId,
    addProducts,
    setAlertState,
  ]);

  useEffect(() => {
    if (transaction && products) {
      addTransactionItems();
      applyGlobalDiscount(transaction.discount_price, '円');
    }
  }, [transaction, products, addTransactionItems]);

  return (
    <>
      <ContainerLayout
        title="買取会計"
        helpArchivesNumber={1294}
        actions={
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            width="100%"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ProductScanButtonContainer />
            </Box>
            <Stack flexDirection="row" gap={1} alignItems="center">
              {/* ▼ここにスイッチを追加 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={autoPrintLabel}
                    onChange={handleChangeAutoPrintLabel}
                    color="primary"
                  />
                }
                label="ラベル自動印刷"
                sx={{ userSelect: 'none', mr: 1 }}
              />
              <OpenDrawerButton />
              <OpenPurchaseDraftListButton />
            </Stack>
          </Stack>
        }
      >
        <Stack
          width={'100%'}
          height={'100%'}
          flexDirection={'row'}
          gap={1}
          overflow="auto"
        >
          <Stack width={'80%'} height={'100%'} flexDirection={'column'} gap={3}>
            <Box height={'100px'}>
              <CustomerSmallCard
                customer={state.customer}
                store={store}
                fetchCustomerByMycaID={fetchCustomerByMycaID}
                resetCustomer={resetCustomer}
              />
            </Box>
            <Stack height={'100%'} overflow="auto">
              <PurchaseTableCard />
            </Stack>
          </Stack>

          <Stack width={'20%'} height={'100%'} flexDirection={'column'} gap={1}>
            <PurchaseDetailsCard
              isAddCartLoading={isLoading}
              memo={memo}
              setMemo={setMemo}
              isError={isError}
            />
          </Stack>
        </Stack>
      </ContainerLayout>
    </>
  );
};

export default DesktopPurchasePage;
