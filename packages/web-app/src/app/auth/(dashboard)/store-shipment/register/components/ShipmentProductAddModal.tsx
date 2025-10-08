import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ShipmentCartDetail } from '@/app/auth/(dashboard)/store-shipment/register/components/ShipmentCartDetail';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { Box, Stack } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shipmentProducts: ShipmentProduct[];
  setShipmentProducts: Dispatch<SetStateAction<ShipmentProduct[]>>;
};

export const ShipmentProductAddModal = ({
  isOpen,
  onClose,
  shipmentProducts,
  setShipmentProducts,
}: Props) => {
  const { setAlertState } = useAlert();

  const [shipmentCart, setShipmentCart] = useState<ShipmentProduct[]>([]);
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState<boolean>(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const quantityChange = (id: number, newValue: number) => {
    setShipmentCart((prev) => {
      return prev.map((p) => {
        return p.id === id ? { ...p, itemCount: newValue } : p;
      });
    });
  };

  const deleteFromCart = (id: number) => {
    setShipmentCart((prev) => prev.filter((p) => p.id !== id));
  };

  const handleOpenMultipleProductModal = () => {
    setIsMultipleProductModalOpen(true);
  };

  const handleAddMultipleProducts = (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(multipleProduct);
  };

  //実際にカートに追加する処理
  const addProductToCart = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
    count: number,
  ) => {
    setShipmentCart((prev) => {
      //100件以上は登録できないように
      if (shipmentProducts.length + prev.length + 1 > 100) {
        setAlertState({
          message: '100種類以上の商品を一度に出荷できません',
          severity: 'error',
        });
        return prev;
      }

      // 既存商品が存在するかチェック
      const existingProduct = prev.find((p) => p.id === product.id);

      if (existingProduct) {
        // 既存商品の数量を更新
        return prev.map((p) =>
          p.id === product.id ? { ...p, itemCount: p.itemCount + count } : p,
        );
      } else {
        // 新規商品を追加
        const newProduct: ShipmentProduct = {
          ...product,
          itemCount: count,
        };
        return [...prev, newProduct];
      }
    });
  };

  //サーチレイアウトからの追加処理
  const handleAddProduct = (info: ReturnProductInfo[]) => {
    addProductToCart(
      { ...info[0].product, id: info[0].product.id! },
      info[0].count,
    );
  };

  //スキャンからの追加処理
  const handleAddProductToCartFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    addProductToCart(product, 1);
  };

  //出荷ボタンを押した時にShipmentProductsに反映
  const cartToShipmentProduct = () => {
    setShipmentProducts((prev) => {
      // 既存のIDリストを作成
      const existingIds = new Set(prev.map((product) => product.id));

      // 重複していない新しい商品のみを抽出
      const newProducts = shipmentCart.filter(
        (cartProduct) => !existingIds.has(cartProduct.id),
      );

      // 既存の商品と新しい商品を結合
      return [...prev, ...newProducts];
    });

    setShipmentCart([]);
    onClose();
  };

  const filterOptions: FilterOptions = {
    showCategoryFilter: true,
    showConditionFilter: true,
    showSortOrderFilter: true,
    showStockStatusFilter: true,
    showFindOptionSelect: true,
  };

  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose}
        title="出荷商品の選択"
        width="90%"
        height="90%"
        hideButtons
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: '100%', height: '100%' }}
        >
          <Box sx={{ flex: 7, minWidth: 0 }}>
            {/* 左側 */}
            <SearchLayout
              onClickActionButton={handleAddProduct}
              actionButtonText="追加"
              filterOptions={filterOptions}
              searchStateOption={{
                isSpecialPriceProduct: false,
                isConsignmentProduct: false,
              }}
            />
          </Box>
          <Stack sx={{ flex: 3, minWidth: 0 }} spacing={1.5}>
            {/* 右側 */}
            <Box>
              {/* スキャンボタン */}
              <ScanAddProductButton
                handleOpenMultipleProductModal={handleOpenMultipleProductModal}
                handleAddMultipleProducts={handleAddMultipleProducts}
                handleAddProductToResult={handleAddProductToCartFromScan}
              />
            </Box>
            {/* 出荷商品カード */}
            <ShipmentCartDetail
              shipmentCart={shipmentCart}
              setShipmentCart={setShipmentCart}
              cartToShipmentProduct={cartToShipmentProduct}
              quantityChange={quantityChange}
              deleteFromCart={deleteFromCart}
              onClose={onClose}
            />
          </Stack>
        </Stack>
      </CustomModalWithIcon>
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddProductToCartFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
