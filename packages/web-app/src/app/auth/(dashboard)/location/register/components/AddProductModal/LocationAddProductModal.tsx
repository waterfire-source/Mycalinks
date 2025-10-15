import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { LocationCartDetail } from '@/app/auth/(dashboard)/location/register/components/AddProductModal/LocationCartDetail';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { ColumnVisibility } from '@/feature/products/components/searchTable/ProductDataTable';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';

type Props = {
  addLocationProduct: (products: LocationProduct[]) => void;
  open: boolean;
  onClose: () => void;
};

export const LocationAddProductModal = ({
  open,
  onClose,
  addLocationProduct,
}: Props) => {
  const [locationCartProducts, setLocationCartProducts] = useState<
    LocationProduct[]
  >([]);
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  const close = () => {
    onClose();
    setLocationCartProducts([]);
  };

  const deleteLocationCartProduct = (productId: number) => {
    setLocationCartProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const itemCountChange = (productId: number, newValue: number) => {
    setLocationCartProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, itemCount: newValue } : p)),
    );
  };

  //カートへ追加する実際の処理
  const addLocationCartProducts = (product: LocationProduct) => {
    setLocationCartProducts((prev) => {
      const existProduct = prev.find((p) => p.id === product.id);

      if (existProduct) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, itemCount: p.itemCount + product.itemCount }
            : p,
        );
      } else {
        return [...prev, product];
      }
    });
  };

  //サーチテーブルからカートへ追加する処理
  const handleAddLocationCartProduct = (info: ReturnProductInfo[]) => {
    //複数返却されるのは管理番号付きのみ
    const productInfo = info[0];
    const converted: LocationProduct = {
      ...productInfo.product,
      id: productInfo.product.id!,
      itemCount: productInfo.count,
    };

    addLocationCartProducts(converted);
  };

  const handleAddLocationCartProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    addLocationCartProducts({ ...product, itemCount: 1 });
  };

  //カートの商品を封入商品に追加する処理
  const addLocationProductFromCart = () => {
    addLocationProduct(locationCartProducts);
  };

  const columnVisibility: ColumnVisibility = {
    showProductState: false,
    showAverageWholesalePrice: true,
  };
  const filterOptions: FilterOptions = {
    showConsignmentFilter: true,
  };
  return (
    <CustomModalWithIcon
      title="ロケーション新規登録"
      open={open}
      onClose={close}
      width="90%"
      height="90%"
    >
      <Stack direction="row" sx={{ width: '100%', height: '100%' }} spacing={2}>
        <Stack sx={{ flex: 7, minWidth: 0 }}>
          <SearchLayout
            columnVisibility={columnVisibility}
            filterOptions={filterOptions}
            onClickActionButton={handleAddLocationCartProduct}
          />
        </Stack>
        <Stack sx={{ flex: 4, minWidth: 0 }}>
          <Box sx={{ mb: '12px' }}>
            <ScanAddProductButton
              handleOpenMultipleProductModal={() =>
                setIsMultipleProductModalOpen(true)
              }
              handleAddMultipleProducts={handleAddMultipleProducts}
              handleAddProductToResult={handleAddLocationCartProductFromScan}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <LocationCartDetail
              cartProducts={locationCartProducts}
              deleteCartProduct={deleteLocationCartProduct}
              itemCountChange={itemCountChange}
              onClose={close}
              addLocationProductFromCart={addLocationProductFromCart}
            />
          </Box>
        </Stack>
      </Stack>

      <MultipleProductModal
        open={isMultipleProductModalOpen}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
        handleAddProductToResult={handleAddLocationCartProductFromScan}
      />
    </CustomModalWithIcon>
  );
};
