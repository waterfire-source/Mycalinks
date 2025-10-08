import { LocationDetailProductTableContent } from '@/app/auth/(dashboard)/location/components/LocationDetailProductTableContent';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { useStore } from '@/contexts/StoreContext';
import { Location } from '@/feature/location/hooks/useLocation';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useEffect, useState } from 'react';

type Props = { selectedLocation: Location | undefined };

export const LocationDetailProductTable = ({ selectedLocation }: Props) => {
  const { listProductsByProductIDs, isLoadingGetProducts } = useProducts();
  const { store } = useStore();

  const [locationProducts, setLocationProducts] = useState<LocationProduct[]>(
    [],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedLocation) return;
      const productIds = selectedLocation.products.map((p) => p.product_id);
      const products = await listProductsByProductIDs(store.id, productIds);
      const converted: LocationProduct[] =
        products
          ?.map((p) => {
            const targetProduct = selectedLocation.products.find(
              (lp) => lp.product_id === p.id,
            );
            if (!targetProduct) return null;
            return { ...p, itemCount: targetProduct.item_count };
          })
          .filter((item): item is LocationProduct => item !== null) ?? [];
      setLocationProducts(converted);
    };

    fetchProducts();
  }, [selectedLocation]);

  return (
    <LocationDetailProductTableContent
      locationProducts={locationProducts}
      fetching={isLoadingGetProducts}
    />
  );
};
