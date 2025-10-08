import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useState } from 'react';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { EnclosedDetailCard } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/productResult/EnclosedDetailCard';
import { Box, Stack } from '@mui/material';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { useSearchParams } from 'next/navigation';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { ColumnVisibility } from '@/feature/products/components/searchTable/ProductDataTable';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';

interface Props {
  open: boolean;
  onClose: () => void;
}

export type EnclosedProduct =
  ItemAPIRes['getAll']['items'][0]['products'][0] & {
    item_count: number | undefined;
    mean_wholesale_price: number | undefined;
    is_infinite_stock: boolean;
  };

export const EnclosedSelectModal = ({ open, onClose }: Props) => {
  const { fetchWholesalePrice } = useWholesalePrice();
  const [selectedProducts, setSelectedProducts] = useState<EnclosedProduct[]>(
    [],
  );
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState<boolean>(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);
  const { addEnclosedProduct } = useEnclosedProductContext();
  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');

  const { addLocalStorageItem } = useSaveLocalStorageOriginalPack();

  const addProduct = async () => {
    try {
      // 選択された商品を1つずつ登録
      for (const product of selectedProducts) {
        await addEnclosedProduct(product);
      }
      // 成功したら選択をクリアしてモーダルを閉じる
      setSelectedProducts([]);
      onClose();

      // 編集からだったら、商品をlocalStorageに追加する
      if (id) {
        addLocalStorageItem(Number(id), selectedProducts);
      }
    } catch (error) {
      console.error('Failed to add enclosed products:', error);
    }
  };

  const handleAddProduct = async (returnProductInfo: ReturnProductInfo[]) => {
    if (!returnProductInfo[0].product.id) return;

    handleAddProductToResult(
      { ...returnProductInfo[0].product, id: returnProductInfo[0].product.id! },
      returnProductInfo[0].count,
    );
  };

  const handleAddProductToResult = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
    count?: number,
  ) => {
    const meanWholesalePrice = await fetchWholesalePrice(
      product.id,
      undefined,
      true,
    );
    const newProduct: EnclosedProduct = {
      ...product,
      item_count: count || 1,
      mean_wholesale_price:
        meanWholesalePrice?.originalWholesalePrices[0]?.unit_price ?? 0,
      is_infinite_stock: product.item_infinite_stock,
    };

    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === newProduct.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existingProduct = updated[existingIndex];
        updated[existingIndex] = {
          ...existingProduct,
          item_count: Math.min(
            (existingProduct.item_count ?? 0) + 1,
            existingProduct.stock_number,
          ),
        };
        return updated;
      } else {
        return [...prev, newProduct];
      }
    });
  };

  const handleOpenMultipleProductModal = () => {
    setIsMultipleProductModalOpen(true);
  };

  const handleAddMultipleProducts = (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(multipleProduct);
  };

  const columnVisibility: ColumnVisibility = {
    showAverageWholesalePrice: true,
  };

  const filterOptions: FilterOptions = { showConditionFilter: true };

  return (
    <>
      <CustomModalWithIcon
        width="90%"
        height="90%"
        open={open}
        onClose={onClose}
        title={isReplenishment ? '補充商品を選択' : '封入商品を選択'}
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
              columnVisibility={columnVisibility}
              filterOptions={filterOptions}
            />
          </Box>
          <Stack sx={{ flex: 3, minWidth: 0 }} spacing={2}>
            {/* 右側 */}
            <Box>
              {/* スキャンボタン */}
              <ScanAddProductButton
                handleOpenMultipleProductModal={handleOpenMultipleProductModal}
                handleAddMultipleProducts={handleAddMultipleProducts}
                handleAddProductToResult={handleAddProductToResult}
              />
            </Box>
            {/* 封入商品リスト */}
            <EnclosedDetailCard
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              onClose={addProduct}
            />
          </Stack>
        </Stack>
      </CustomModalWithIcon>
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddProductToResult}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
