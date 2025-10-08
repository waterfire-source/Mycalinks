import { useState } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { EditProductModal } from '@/feature/sale/components/scan/EditProductModal';
import { useStore } from '@/contexts/StoreContext';
import { SaleCartItem } from '@/feature/sale/hooks/useSaleCart';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { ProductScanButton } from '@/feature/products/components/ProductScanButton';
import { MultipleProductModal } from '@/feature/sale/components/scan/MultipleProductModal';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';

export const ProductScanButtonContainer = () => {
  const { store } = useStore();
  const { addProducts } = useSaleCartContext();
  const { setAlertState } = useAlert();
  const [isEditProductModalOpen, setIsEditProductModalOpen] =
    useState<boolean>(false);
  const [noStockProduct, setNoStockProduct] =
    useState<BackendProductAPI[0]['response']['200']['products'][0]>();
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState<boolean>(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const handleScanSearch = async (code: string) => {
    //数字以外も認める形にする
    const clientAPI = createClientAPI();
    const response = await clientAPI.product.listProducts({
      storeID: store.id,
      code,
    });

    if (response instanceof CustomError) {
      setAlertState({ message: response.message, severity: 'error' });
      return;
    }
    // 商品が見つからないときはアラートを表示する
    if (response.products.length === 0) {
      setAlertState({
        message: '商品が見つかりませんでした。',
        severity: 'error',
      });
      return;
    }
    // product_codeに紐づく商品が複数存在するかつ、在庫がある商品が複数存在する時は商品選択モーダルを表示する4289000525010
    if (
      response.products.length > 1 &&
      response.products.filter((p) => p.stock_number > 0).length > 1
    ) {
      // 在庫がある商品を表示する
      setMultipleProducts(response.products.filter((p) => p.stock_number > 0));
      setIsMultipleProductModalOpen(true);
      return;
    }
    const product = response.products[0];
    // 在庫が0で無限在庫でない時は編集モーダルを表示
    if (!product.item_infinite_stock && product.stock_number === 0) {
      setIsEditProductModalOpen(true);
      setNoStockProduct(product);
      return;
    }
    // 全て通過した際は販売用の商品を追加する
    const newProduct: Omit<SaleCartItem, 'variants'> = {
      productId: product.id,
      imageUrl: product.image_url ?? '',
      displayName: product.displayNameWithMeta,
      conditionName: getConditionDisplayName(product), // ここの型エラー吐かれる原因よくわからんなかったのでもしわかったら修正お願いします
      stockNumber: product.stock_number,
      originalSalePrice: product.sell_price,
      originalSpecificSalePrice: product.specific_sell_price,
      infinite_stock: product.item_infinite_stock,
      consignmentClientId: product.consignment_client_id,
      consignmentClientFullName: product.consignment_client__full_name,
      consignmentClientDisplayName: product.consignment_client__display_name,
    };

    addProducts({
      newProduct: newProduct,
      itemCount: 1,
      unitPrice: product.specific_sell_price ?? product.sell_price ?? 0,
    });
  };

  return (
    <>
      <ProductScanButton
        handleScanSearch={handleScanSearch}
        isShowInputField={false}
      />
      <EditProductModal
        open={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        noStockProduct={noStockProduct}
        storeId={store.id}
      />
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
