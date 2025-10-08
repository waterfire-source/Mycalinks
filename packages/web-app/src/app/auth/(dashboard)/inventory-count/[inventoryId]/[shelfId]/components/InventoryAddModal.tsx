import { useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

import { useStore } from '@/contexts/StoreContext';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';

import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import SearchProductField from '@/components/inputFields/SearchProductField';
import { InventoryAddCart } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddCart';
import { InventorySearchResultTable } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventorySearchTable';
import { InventoryFilterBox } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryFilterBox';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';

import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Categories } from '@/feature/category/hooks/useCategory';

export type CartItem =
  BackendProductAPI[0]['response']['200']['products'][0] & {
    cart_item_id: string;
    count: number;
  };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  handleAddShelfProduct: (products: CartItem[]) => void;
  categories: Categories;
};

export const InventoryAddModal = ({
  isOpen,
  onClose,
  handleAddShelfProduct,
}: Props) => {
  // ---------------------
  // 状態管理
  // ---------------------
  const [addCart, setAddCart] = useState<CartItem[]>([]);
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  // ---------------------
  // データ取得系
  // ---------------------
  const { store } = useStore();
  const { searchState, setSearchState, fetchProducts } = useStockSearch(
    store.id,
    { isInfiniteStock: false, isConsignmentProduct: false },
  );

  useEffect(() => {
    fetchProducts(); // フィルタ変更時再取得
  }, [
    searchState.orderBy,
    searchState.itemCategoryId,
    searchState.itemGenreId,
    searchState.currentPage,
    searchState.itemsPerPage,
    searchState.specialtyId,
  ]);

  // ---------------------
  // イベントハンドラ
  // ---------------------
  const handleOpenMultipleProductModal = () => {
    setIsMultipleProductModalOpen(true);
  };

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  const handleAddShelfProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    setAddCart((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, count: p.count + 1 } : p,
        );
      }
      return [
        ...prev,
        {
          ...product,
          cart_item_id: uuidv4(),
          count: 1,
        },
      ];
    });
  };

  // ---------------------
  // レンダリング
  // ---------------------
  return (
    <CustomModalWithIcon
      title="棚卸登録商品検索"
      open={isOpen}
      onClose={onClose}
      hideButtons
      sx={{ width: '90%', height: '90%' }}
    >
      <Stack flexDirection="row" gap={3} width="100%" height="100%">
        {/* 左エリア：検索・絞り込み・検索結果 */}
        <Stack sx={{ flex: 7, overflow: 'scroll', minHeight: 0 }}>
          <Box sx={{ width: 'fit-content', py: 1 }}>
            <SearchProductField
              onSearch={fetchProducts}
              searchState={searchState}
              setSearchState={setSearchState}
            />
          </Box>
          <GenreTabComponent setSearchState={setSearchState} />
          <InventoryFilterBox
            searchState={searchState}
            setSearchState={setSearchState}
          />
          <InventorySearchResultTable
            searchState={searchState}
            setSearchState={setSearchState}
            setAddCart={setAddCart}
          />
        </Stack>

        {/* 右エリア：バーコード追加 + カート */}
        <Stack sx={{ flex: 3, gap: 3, py: 1, minHeight: 0 }}>
          <ScanAddProductButton
            handleOpenMultipleProductModal={handleOpenMultipleProductModal}
            handleAddMultipleProducts={handleAddMultipleProducts}
            handleAddProductToResult={handleAddShelfProductFromScan}
          />
          <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <InventoryAddCart
              addCart={addCart}
              setAddCart={setAddCart}
              handleAddShelfProduct={handleAddShelfProduct}
            />
          </Box>
        </Stack>
      </Stack>

      {/* 複数商品スキャン用モーダル */}
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddShelfProductFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </CustomModalWithIcon>
  );
};
