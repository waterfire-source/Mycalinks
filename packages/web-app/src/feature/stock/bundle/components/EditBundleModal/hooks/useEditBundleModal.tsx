import { useProducts } from '@/feature/products/hooks/useProducts';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { useEffect, useState } from 'react';

interface Props {
  storeID: number;
  bundle: BundleSetProductType;
  setIsLoading: (isLoading: boolean) => void;
}

export const useEditBundleModal = ({
  storeID,
  bundle,
  setIsLoading,
}: Props) => {
  // バンドルに含まれる商品の情報
  const [bundledProducts, setBundledProducts] = useState<
    CountableProductType[]
  >([]);

  const { products, listProductsByProductIDs } = useProducts();

  // 割引額の表記を分岐する関数
  const discountToString = (discount: string) => {
    if (discount.endsWith('%')) {
      return `${discount}`;
    } else {
      return `${discount}円`;
    }
  };

  // バンドルに含まれる商品のうち指定したIDの商品の個数を取得する関数
  const getProductCount = (bundle: BundleSetProductType, productID: number) => {
    const product = bundle.products.find(
      (product) => product.productID === productID,
    );
    return product ? product.itemCount : 0;
  };

  useEffect(() => {
    // 初期化
    setBundledProducts([]);

    // バンドルに含まれる商品の情報を取得
    const fetchProducts = async () => {
      setIsLoading(true);
      const productIDs = bundle.products.map((product) => product.productID);
      await listProductsByProductIDs(storeID, productIDs);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  // productをbundledProductsに変換
  useEffect(() => {
    if (products !== undefined && products.length > 0) {
      const newBundledProducts = products.map((product) => ({
        id: product.id,
        display_name: product.display_name,
        displayNameWithMeta: product.displayNameWithMeta,
        expansion: product.item_expansion,
        cardnumber: product.item_cardnumber,
        rarity: product.item_rarity,
        sell_price: product.actual_sell_price,
        specific_sell_price: product.specific_sell_price,
        condition: {
          id: product.condition_option_id,
          displayName: product.condition_option_display_name,
        },
        image_url: product.image_url,
        stock_number: getProductCount(bundle, product.id), // バンドルに含まれる商品の数
        real_stock_number: product.stock_number, // 実際の在庫数
      }));
      setBundledProducts(newBundledProducts);
    }
  }, [products]);

  return {
    bundledProducts,
    discountToString,
  };
};
