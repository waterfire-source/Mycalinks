import {
  SaleTransactionState,
  useSaleCart,
} from '@/feature/sale/hooks/useSaleCart';
import React, { createContext, useContext } from 'react';

interface SaleCartContextValue {
  state: SaleTransactionState;
  addProducts: ReturnType<typeof useSaleCart>['addProducts'];
  updateItemCount: ReturnType<typeof useSaleCart>['updateItemCount'];
  updateUnitPrice: ReturnType<typeof useSaleCart>['updateUnitPrice'];
  deleteCartItem: ReturnType<typeof useSaleCart>['deleteCartItem'];
  applyIndividualDiscount: ReturnType<
    typeof useSaleCart
  >['applyIndividualDiscount'];
  applyGlobalDiscount: ReturnType<typeof useSaleCart>['applyGlobalDiscount'];
  changePaymentMethod: ReturnType<typeof useSaleCart>['changePaymentMethod'];
  changeCashReceived: ReturnType<typeof useSaleCart>['changeCashReceived'];
  getCartTotalItemCount: ReturnType<
    typeof useSaleCart
  >['getCartTotalItemCount'];
  setCustomer: ReturnType<typeof useSaleCart>['setCustomer'];
  setTransactionID: ReturnType<typeof useSaleCart>['setTransactionID'];
  resetCart: ReturnType<typeof useSaleCart>['resetCart'];
  applyPoint: ReturnType<typeof useSaleCart>['applyPoint'];
}

const SaleCartContext = createContext<SaleCartContextValue | undefined>(
  undefined,
);

export const SaleCartProvider: React.FC<{
  children: React.ReactNode;
  initial?: Partial<SaleTransactionState>;
}> = ({ children, initial }) => {
  const saleCart = useSaleCart(initial);

  return (
    <SaleCartContext.Provider value={saleCart}>
      {children}
    </SaleCartContext.Provider>
  );
};

export const useSaleCartContext = (): SaleCartContextValue => {
  const context = useContext(SaleCartContext);
  if (!context) {
    throw new Error(
      'useSaleCartContext must be used within a SaleCartProvider',
    );
  }
  return context;
};
