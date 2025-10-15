import {
  PurchaseTransactionState,
  usePurchaseCart,
} from '@/feature/purchase/hooks/usePurchaseCart';
import React, { createContext, useContext } from 'react';

interface PurchaseCartContextValue {
  state: PurchaseTransactionState;
  addProducts: ReturnType<typeof usePurchaseCart>['addProducts'];
  updateItemCount: ReturnType<typeof usePurchaseCart>['updateItemCount'];
  updateUnitPrice: ReturnType<typeof usePurchaseCart>['updateUnitPrice'];
  deleteCartItem: ReturnType<typeof usePurchaseCart>['deleteCartItem'];
  applyIndividualDiscount: ReturnType<
    typeof usePurchaseCart
  >['applyIndividualDiscount'];
  applyGlobalDiscount: ReturnType<
    typeof usePurchaseCart
  >['applyGlobalDiscount'];
  changePaymentMethod: ReturnType<
    typeof usePurchaseCart
  >['changePaymentMethod'];
  changeCashReceived: ReturnType<typeof usePurchaseCart>['changeCashReceived'];
  getCartTotalItemCount: ReturnType<
    typeof usePurchaseCart
  >['getCartTotalItemCount'];
  setCustomer: ReturnType<typeof usePurchaseCart>['setCustomer'];
  setTransactionID: ReturnType<typeof usePurchaseCart>['setTransactionID'];
  resetCart: ReturnType<typeof usePurchaseCart>['resetCart'];
}

const PurchaseCartContext = createContext<PurchaseCartContextValue | undefined>(
  undefined,
);

export const PurchaseCartProvider: React.FC<{
  children: React.ReactNode;
  initial?: Partial<PurchaseTransactionState>;
}> = ({ children, initial }) => {
  const PurchaseCart = usePurchaseCart(initial);

  return (
    <PurchaseCartContext.Provider value={PurchaseCart}>
      {children}
    </PurchaseCartContext.Provider>
  );
};

export const usePurchaseCartContext = (): PurchaseCartContextValue => {
  const context = useContext(PurchaseCartContext);
  if (!context) {
    throw new Error(
      'usePurchaseCartContext must be used within a PurchaseCartProvider',
    );
  }
  return context;
};
