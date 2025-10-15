import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { useEnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/hooks/useEnclosedProduct';
import { createContext, useContext } from 'react';

interface EnclosedProductContextType {
  enclosedProducts: EnclosedProduct[];
  handleItemCountChange: ReturnType<
    typeof useEnclosedProduct
  >['handleItemCountChange'];
  addEnclosedProduct: ReturnType<
    typeof useEnclosedProduct
  >['addEnclosedProduct'];
  deleteEnclosedProduct: ReturnType<
    typeof useEnclosedProduct
  >['deleteEnclosedProduct'];
  resetEnclosedProducts: ReturnType<
    typeof useEnclosedProduct
  >['resetEnclosedProducts'];
  totalSellPrice: ReturnType<typeof useEnclosedProduct>['totalSellPrice'];
  totalWholesalePrice: ReturnType<
    typeof useEnclosedProduct
  >['totalWholesalePrice'];
  handleSetEnclosedProducts: ReturnType<
    typeof useEnclosedProduct
  >['handleSetEnclosedProducts'];
  refreshEnclosedProducts: ReturnType<
    typeof useEnclosedProduct
  >['refreshEnclosedProducts'];
}

const EnclosedProductContext = createContext<
  EnclosedProductContextType | undefined
>(undefined);

export const EnclosedProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const value = useEnclosedProduct();

  return (
    <EnclosedProductContext.Provider value={value}>
      {children}
    </EnclosedProductContext.Provider>
  );
};

export const useEnclosedProductContext = () => {
  const context = useContext(EnclosedProductContext);
  if (!context) {
    throw new Error(
      'useEnclosedProductContext must be used within a EnclosedProductProvider',
    );
  }
  return context;
};
