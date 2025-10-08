import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  product: EnclosedProduct;
  allSearchResults: EnclosedProduct[];
  selectedProducts: EnclosedProduct[];
  setSelectedProducts: Dispatch<SetStateAction<EnclosedProduct[]>>;
}
export const EnclosedProductAddButton = ({
  product,
  allSearchResults,
  selectedProducts,
  setSelectedProducts,
}: Props) => {
  const { fetchWholesalePrice } = useWholesalePrice();

  const targetResult = allSearchResults.find((p) => p.id === product.id);
  const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);

  const handleAddProduct = async () => {
    const meanWholesalePrice = await fetchWholesalePrice(
      product.id,
      targetResult?.item_count,
      true,
    );
    setSelectedProducts((prev) => [
      ...prev,
      {
        ...product,
        mean_wholesale_price:
          meanWholesalePrice?.originalWholesalePrices[0]?.unit_price ?? 0,
      },
    ]);
  };

  return (
    <PrimaryButton
      disabled={targetResult?.item_count === undefined || isAlreadySelected}
      onClick={handleAddProduct}
    >
      {isAlreadySelected ? '追加済み' : '登録'}
    </PrimaryButton>
  );
};
