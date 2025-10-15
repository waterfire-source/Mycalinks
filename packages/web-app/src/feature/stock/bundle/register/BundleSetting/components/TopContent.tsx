import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import SelectedProductsCard from '@/feature/stock/bundle/components/SelectedProductsCard/SelectedProductsCard';

import { FC } from 'react';

interface Props {
  selectedProducts: CountableProductType[];
  handleQuantityChange: (productId: number, quantity: number) => void;
  handleRemoveProduct: (productId: number) => void;
}

export const TopContent: FC<Props> = ({
  selectedProducts,
  handleQuantityChange,
  handleRemoveProduct,
}) => {
  return (
    <SelectedProductsCard
      products={selectedProducts}
      height="100%"
      showNumOfItems={true}
      handleAddProducts={handleQuantityChange}
      onRemoveProduct={handleRemoveProduct}
    />
  );
};
