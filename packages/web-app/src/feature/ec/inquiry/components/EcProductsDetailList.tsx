import { useStore } from '@/contexts/StoreContext';
import { EcProductDetail } from '@/feature/ec/inquiry/components/EcProductDetail';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useEffect } from 'react';

export interface EcCartProducts {
  products: Array<{
    id: number;
    product: {
      id: number;
      displayNameWithMeta?: string;
    };
    totalUnitPrice: number;
    originalItemCount: number;
    itemCount: number;
  }>;
}

//取引した商品の詳細情報をカード形式で表示
export const EcProductsDetailList = ({ products }: EcCartProducts) => {
  const { store } = useStore();
  const { products: productDetails, listProductsByProductIDs } = useProducts();

  useEffect(() => {
    const productIDs = products.map((product) => product.product.id);
    listProductsByProductIDs(store.id, productIDs);
  }, [products, listProductsByProductIDs, store.id]);

  return (
    <>
      {products.map(
        (product, index) =>
          productDetails &&
          productDetails[index] && (
            <EcProductDetail
              key={index}
              product={product}
              productDetail={productDetails[index]}
            />
          ),
      )}
    </>
  );
};
