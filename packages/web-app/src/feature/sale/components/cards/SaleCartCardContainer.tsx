'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionKind } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import { useSession } from 'next-auth/react';
import { useSellTransactions } from '@/feature/transaction/hooks/useSellTransactions';
import {
  CartDisplayCard,
  MobileCartResultItem,
} from '@/components/cards/CartDisplayCard';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import {
  calculateDiscountPrice,
  calculateTotalDiscount,
  getTotalItemCount,
} from '@/feature/sale/hooks/useSaleCart';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { PATH } from '@/constants/paths';

interface SaleCartCardContainerProps {
  transactionID: string | undefined;
  customer:
    | BackendCustomerAPI[0]['response']['200'] // getCustomerのレスポンス
    | BackendCustomerAPI[1]['response']['200'][0] // getCustomerByCustomerIDのレスポンス
    | undefined;
}

export const SaleCartCardContainer: React.FC<
  SaleCartCardContainerProps
> = () => {
  const { state, resetCart, updateItemCount } = useSaleCartContext();
  const { store } = useStore();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const { createDraftSellTransaction, isLoading } = useSellTransactions();

  const router = useRouter();

  const handleCreateTransaction = async () => {
    if (!staffAccountID) return;

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
      staff_account_id: parseInt(staffAccountID),
      customer_id: state.customer?.id,
      transaction_kind: TransactionKind.sell,
      total_price: state.totalPrice,
      payment_method: state.paymentMethod,
      subtotal_price: state.subtotalPrice,
      recieved_price: state.receivedPrice,
      change_price: state.changePrice,
      discount_price: state.discountPrice,
      tax: state.tax,
      set_deals: state.availableSetDeals?.map((deal) => ({
        set_deal_id: deal.setDealID,
        apply_count: deal.applyCount,
        total_discount_price: deal.totalDiscountPrice,
      })),
      carts: mappedCarts,
    };

    const transactionId = await createDraftSellTransaction(transactionRequest);

    if (transactionId) {
      resetCart();
      router.push(PATH.SALE.mobileSaleDraft(transactionId));
    }
  };

  const transactionCartItems: MobileCartResultItem[] = useMemo(() => {
    return state.carts.flatMap((cart) => {
      return cart.variants.map((variant) => {
        return {
          id: variant.variantId,
          productId: cart.productId,
          imageUrl: cart.imageUrl,
          displayName: cart.displayName,
          conditionName: cart.conditionName,
          unitPrice: variant.unitPrice,
          discountPrice: Math.abs(
            calculateTotalDiscount({
              individualDiscount:
                variant.individualDiscount?.discountAmount ?? undefined,
              saleDiscount: variant.sale?.discountAmount ?? undefined,
              unitPrice: variant.unitPrice,
            }),
          ),
          itemCount: variant.itemCount,
        };
      });
    });
  }, [state.carts]);

  return (
    <>
      {/* 査定内容 */}
      <CartDisplayCard
        totalItems={getTotalItemCount(state.carts)}
        totalAmount={state.totalPrice}
        items={transactionCartItems}
        onConfirmAppraisal={handleCreateTransaction}
        onQuantityChange={(id: string, newQuantity: number) =>
          updateItemCount(id, newQuantity)
        }
        isLoading={isLoading}
        title={'作成内容'}
        buttonText={'作成内容を送信'}
      />
    </>
  );
};
