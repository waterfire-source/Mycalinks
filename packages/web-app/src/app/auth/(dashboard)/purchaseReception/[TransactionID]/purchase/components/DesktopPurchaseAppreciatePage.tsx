'use client';
import React, { useEffect } from 'react';
import { Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import {
  TransactionCartItem,
  useTransactionCart,
} from '@/feature/purchaseReception/hooks/useTransactionCart';
import { useStore } from '@/contexts/StoreContext';
import { useSearchParams } from 'next/navigation';
import { useCustomer } from '@/feature/customer/hooks/useCustomer';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { PurchaseCartCardContainer } from '@/feature/purchaseReception/components/cards/PurchaseCartCardContainer';
import { PurchaseProductScanButtonContainer } from '@/feature/purchaseReception/components/scan/PurchaseProductScanButtonContainer';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import {
  ItemSearchLayout,
  ReturnProductInfo,
} from '@/feature/item/components/search/ItemSearchLayout';
import { ColumnVisibility } from '@/feature/item/components/search/ItemDataTable';
import { FilterOptions } from '@/feature/item/components/search/ItemFilterComponent';
import { HelpIcon } from '@/components/common/HelpIcon';

export const DesktopPurchaseAppreciatePage: React.FC = () => {
  const { store } = useStore();
  const { customer, fetchCustomerByCustomerID } = useCustomer();
  const params = useParams();
  const transactionId = Number(params.TransactionID);
  const { cartItems, setCartItems, addToCart, isLoading } =
    useTransactionCart(transactionId);
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  useEffect(() => {
    fetchCustomerByCustomerID(store.id, Number(customerId));
  }, [customerId]);

  // 特殊状態
  const { specialties, fetchSpecialty } = useGetSpecialty();

  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);

  const handleAddToCart = (info: ReturnProductInfo[]) => {
    const converted: Omit<TransactionCartItem, 'cart_item_id'>[] = info.map(
      (i) => ({
        item_count: i.count,
        unit_price: i.customFieldValues['purchasePrice'],
        discount_price: 0,
        rarity: i.product.item_rarity,
        expansion: i.product.item_expansion,
        cardnumber: i.product.item_cardnumber,
        productGenreName: i.product.item_genre_display_name,
        productCategoryName: i.product.item_category_display_name,
        hasManagementNumber: typeof i.product.management_number === 'string',
        managementNumber: i.product.management_number ?? undefined,
        specialId: i.product.specialty_id ?? undefined,
        product_details: {
          id: i.product.id || -1,
          item_id: i.product.item_id,
          display_name: i.product.display_name,
          displayNameWithMeta: i.product.displayNameWithMeta,
          image_url: i.product.image_url,
          specific_buy_price: i.product.specific_buy_price,
          buy_price: i.product.buy_price,
          product_code: i.product.product_code,
          conditionDisplayName: i.product.condition_option_display_name,
          condition_option_id: i.product.condition_option_id!,
          actual_sell_price: i.product.actual_sell_price,
          average_wholesale_price: i.product.average_wholesale_price,
        },
      }),
    );

    converted.forEach((c) => addToCart(c));
  };

  const columnVisibility: ColumnVisibility = {
    showTotalStockNumber: false,
    showBuyPrice: false,
    inputFields: [
      {
        columnName: 'purchasePrice',
        headerName: '査定額',
        suffix: '円',
        defaultProperty: 'actual_buy_price',
      },
    ],
  };

  const filterOptions: FilterOptions = {
    showSpecialtyFilter: true,
    showManagementCheckBox: true,
  };

  return (
    <ContainerLayout
      title="買取査定"
      actions={
        <Stack flexDirection="row" width="100%">
          <PurchaseProductScanButtonContainer
            transactionId={transactionId}
            addToCart={addToCart}
          />
          <HelpIcon helpArchivesNumber={561} />
        </Stack>
      }
    >
      <Stack flexDirection="row" gap={3} width="100%" height="100%">
        <Stack sx={{ flex: 7, minWidth: 0, height: '100%' }}>
          <ItemSearchLayout
            columnVisibility={columnVisibility}
            filterOptions={filterOptions}
            onClickActionButton={handleAddToCart}
          />
        </Stack>
        <Stack sx={{ flex: 4, minWidth: 0, height: '100%' }}>
          <PurchaseCartCardContainer
            cartItems={cartItems}
            setCartItems={setCartItems}
            isLoading={isLoading}
            customer={customer}
            transactionId={transactionId}
            specialties={specialties}
          />
        </Stack>
      </Stack>
    </ContainerLayout>
  );
};
