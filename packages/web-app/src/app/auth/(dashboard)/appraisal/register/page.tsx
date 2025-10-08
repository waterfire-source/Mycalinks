'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { AppraisalSubmitCard } from '@/feature/appraisal/components/cards/AppraisalSubmitCard';
import { Box, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ColumnVisibility } from '@/feature/products/components/searchTable/ProductDataTable';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useAppraisal } from '@/feature/appraisal/hooks/useAppraisal';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { useCategory } from '@/feature/category/hooks/useCategory';

export type CartProduct =
  BackendProductAPI[0]['response']['200']['products'][0] & {
    item_count: number;
  };

const PsaRegisterNewPage: React.FC = () => {
  const { store } = useStore();
  const { listProductsByProductIDs } = useProducts();
  const { getAppraisal } = useAppraisal();
  const { setAlertState } = useAlert();
  const { fetchCategoryList } = useCategory();

  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [cardCategoryId, setCardCategoryId] = useState<number | undefined>(
    undefined,
  );
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const searchParams = useSearchParams();
  const editId = Number(searchParams.get('editId'));

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  const addToCart = (
    product: BackendProductAPI[0]['response']['200']['products'][number],
    count: number,
  ) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const updatedCount = existingItem.item_count + count;
        const finalCount = Math.min(updatedCount, existingItem.stock_number);

        return prevCart.map((item) =>
          item.id === product.id ? { ...item, item_count: finalCount } : item,
        );
      } else {
        const finalCount = Math.min(count, product.stock_number);
        return [...prevCart, { ...product, item_count: finalCount }];
      }
    });
  };

  const handleAddToCart = (returnProductInfo: ReturnProductInfo[]) => {
    addToCart(
      { ...returnProductInfo[0].product, id: returnProductInfo[0].product.id! },
      returnProductInfo[0].count,
    );
  };

  const handleAddCartFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][number],
  ) => {
    addToCart(product, 1);
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleChangeCartItemQuantity = (id: number, quantity: number) => {
    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, item_count: Math.max(1, quantity) } : item,
      ),
    );
  };

  useEffect(() => {
    const fetchCategory = async () => {
      const categories = await fetchCategoryList();
      const cardCategory = categories?.itemCategories.find(
        (c) => c.handle === 'CARD',
      );

      setCardCategoryId(cardCategory?.id);
    };

    fetchCategory();
  }, [store.id]);

  useEffect(() => {
    const fetchAppraisalProducts = async () => {
      if (!editId) return;
      //編集時はすでに削除しているためdeleted: trueへ
      const appraisal = await getAppraisal({
        id: editId,
        finished: false,
        deleted: true,
      });

      if (!appraisal)
        return setAlertState({
          message: '鑑定情報が見つかりません',
          severity: 'error',
        });

      const appraisalProductInfo = appraisal.appraisals[0].products;
      const productId = appraisalProductInfo.map((p) => p.product_id);

      const products = await listProductsByProductIDs(store.id, productId);

      if (!products)
        return setAlertState({
          message: '鑑定に出した在庫が見つかりません',
          severity: 'error',
        });

      // productId => infoのmapを作成
      const productInfoMap = new Map(
        products.map((product) => [product.id, product]),
      );

      appraisalProductInfo.forEach((info) => {
        const product = productInfoMap.get(info.product_id);
        if (!product) return;
        addToCart(product, 1);
      });
    };
    fetchAppraisalProducts();
  }, [editId]);

  const columnVisibility: ColumnVisibility = {
    showSellPrice: false,
    showAverageWholesalePrice: true,
  };

  const filterOptions: FilterOptions = {
    showConditionFilter: true,
    showCategoryFilter: true,
    showSpecialtyFilter: false,
  };

  if (!cardCategoryId) return <></>;

  return (
    <ContainerLayout title="新規鑑定">
      <Stack
        direction={'row'}
        height={'100%'}
        width={'100%'}
        sx={{ overflowY: 'auto' }}
        spacing={2}
      >
        <Box sx={{ flex: 7, minWidth: 0 }}>
          <SearchLayout
            onClickActionButton={handleAddToCart}
            columnVisibility={columnVisibility}
            filterOptions={filterOptions}
            searchStateOption={{
              isConsignmentProduct: false,
              itemCategoryId: cardCategoryId,
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 3,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: '12px' }}>
            <ScanAddProductButton
              handleOpenMultipleProductModal={() =>
                setIsMultipleProductModalOpen(true)
              }
              handleAddMultipleProducts={handleAddMultipleProducts}
              handleAddProductToResult={handleAddCartFromScan}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <AppraisalSubmitCard
              products={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              onChangeQuantity={handleChangeCartItemQuantity}
            />
          </Box>
        </Box>
      </Stack>
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddCartFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </ContainerLayout>
  );
};

export default PsaRegisterNewPage;
