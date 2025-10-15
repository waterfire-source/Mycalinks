import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { InventoryProductEditTableContent } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductEditTableContent';
import { InventoryProductNarrowDownComponent } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductNarrowDownComponent';
import { InventoryProductSearchField } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductSearchField';
import { InventoryProductTabComponent } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductTabComponent';
import { ShelfProduct } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/page';
import { Categories, useCategory } from '@/feature/category/hooks/useCategory';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { v4 as uuidv4 } from 'uuid';

import { Box } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { CartItem } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';

type Props = {
  shelfProducts: ShelfProduct[];
  setShelfProducts: Dispatch<SetStateAction<ShelfProduct[]>>;
  handleSubmitProducts: () => void;
  loading: boolean;
  submitLoading: boolean;
  categories: Categories;
  handleAddShelfProduct: (products: CartItem[]) => void;
};

export type Filter = {
  productName: string | null;
  productExpansion: string | null;
  productCardNumber: string | null;
  productRarity: string | null;
  genreId?: number | null;
  categoryId?: number | null;
  conditionId?: number | null;
  stockDiff: 'hasDiff' | 'noDiff' | 'hasPlusDiff' | 'hasMinusDiff' | null;
};

export const InventoryProductEditTable = ({
  shelfProducts,
  setShelfProducts,
  handleSubmitProducts,
  loading,
  submitLoading,
  categories,
  handleAddShelfProduct,
}: Props) => {
  const { fetchCategoryList } = useCategory();
  useEffect(() => {
    fetchCategoryList();
  }, []);
  //フィルタリングや検索をするための表示用のstate。
  // shelfProductは棚卸の処理と直接紐づいているのでフィルタリングで直接いじると棚卸される商品もフィルタリング後の商品になってしまう。
  const [rows, setRows] = useState<ShelfProduct[]>([]);

  useEffect(() => {
    setRows(shelfProducts);
  }, [shelfProducts]);

  const deleteShelfProduct = (shelfItemId: string) => {
    setShelfProducts((prev) =>
      [...prev].filter((p) => p.shelf_item_id !== shelfItemId),
    );
  };

  const handleQuantityChange = (shelfItemId: string, newValue: number) => {
    setShelfProducts((prev) =>
      [...prev].map((p) =>
        p.shelf_item_id === shelfItemId ? { ...p, item_count: newValue } : p,
      ),
    );
  };

  const [filter, setFilter] = useState<Filter>({
    productName: null,
    productExpansion: null,
    productCardNumber: null,
    productRarity: null,
    genreId: null,
    categoryId: null,
    conditionId: null,
    stockDiff: null,
  });

  useEffect(() => {
    setRows(() => {
      return shelfProducts.filter((p) => {
        if (
          filter.productName &&
          !p.display_name
            ?.toLowerCase()
            .includes(filter.productName.toLowerCase())
        )
          return false;

        if (
          filter.productExpansion &&
          !p.item_expansion
            ?.toLowerCase()
            .includes(filter.productExpansion.toLowerCase())
        )
          return false;

        if (
          filter.productCardNumber &&
          !p.item_cardnumber
            ?.toLowerCase()
            .includes(filter.productCardNumber.toLowerCase())
        )
          return false;

        if (
          filter.productRarity &&
          !p.item_rarity
            ?.toLowerCase()
            .includes(filter.productRarity.toLowerCase())
        )
          return false;

        if (filter.genreId && p.item_genre_id !== filter.genreId) return false;
        if (filter.categoryId && p.item_category_id !== filter.categoryId)
          return false;
        if (filter.conditionId && p.condition_option_id !== filter.conditionId)
          return false;

        if (filter.stockDiff) {
          const totalCount = p.item_count + p.item_count_in_other_shelf;
          const diff = totalCount - p.stock_number;

          switch (filter.stockDiff) {
            case 'hasDiff':
              if (diff === 0) return false;
              break;
            case 'noDiff':
              if (diff !== 0) return false;
              break;
            case 'hasPlusDiff':
              if (diff <= 0) return false;
              break;
            case 'hasMinusDiff':
              if (diff >= 0) return false;
              break;
          }
        }

        return true;
      });
    });
  }, [filter, shelfProducts]);

  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState<boolean>(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const handleOpenMultipleProductModal = () => {
    setIsMultipleProductModalOpen(true);
  };

  const handleAddMultipleProducts = (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(multipleProduct);
  };

  const handleAddShelfProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    const productToAdd: CartItem = {
      ...product,
      cart_item_id: uuidv4(),
      count: 1,
    };

    handleAddShelfProduct([productToAdd]);
  };

  return (
    <>
      <InventoryProductSearchField setFilter={setFilter} />
      <Box sx={{ mt: '10px' }}>
        <InventoryProductTabComponent setFilter={setFilter} />
      </Box>
      <Box sx={{ mt: '10px' }}>
        <InventoryProductNarrowDownComponent
          categories={categories}
          handleAddMultipleProduct={handleAddMultipleProducts}
          handleAddShelfProductFromScan={handleAddShelfProductFromScan}
          handleOpenMultipleProductModal={handleOpenMultipleProductModal}
          setFilter={setFilter}
        />
      </Box>
      <InventoryProductEditTableContent
        shelfProducts={shelfProducts}
        rows={rows}
        deleteShelfProduct={deleteShelfProduct}
        handleQuantityChange={handleQuantityChange}
        handleSubmitProducts={handleSubmitProducts}
        loading={loading}
        submitLoading={submitLoading}
      />
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddShelfProductFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
