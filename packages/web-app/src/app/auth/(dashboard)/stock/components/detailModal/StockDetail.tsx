import { CategoryAPIRes } from '@/api/frontend/category/api';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { HistoryTab } from '@/app/auth/(dashboard)/stock/components/detailModal/tabs/HistoryTab';
import { InformationTab } from '@/app/auth/(dashboard)/stock/components/detailModal/tabs/InformationTab';
import { PurchaseDetailTab } from '@/app/auth/(dashboard)/stock/components/detailModal/tabs/PurchaseDetailTab';
import { TransferTab } from '@/app/auth/(dashboard)/stock/components/detailModal/tabs/TransferTab';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { ProductImageData } from '@/feature/products/hooks/useUpdateProductImages';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import { useChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';
import { Box, Stack, Tabs } from '@mui/material';
import { Product } from 'backend-core';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { SecondaryCustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import {
  StockTabValue,
  transferProduct,
} from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { useSpecialPriceCancellation } from '@/feature/stock/hooks/useSpecialPriceCancellation';

interface Props {
  selectedTab: StockTabValue;
  setSelectedTab: Dispatch<SetStateAction<StockTabValue>>;
  storeId: number;
  productId?: number;
  stockNumber: number;
  isStockSaveModalOpen: boolean;
  setIsStockSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResetSpecificPrice: boolean;
  setIsResetSpecificPrice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStockChange: React.Dispatch<React.SetStateAction<boolean>>;
  formData?: Partial<Product>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<Product> | undefined>
  >;
  transferItems: transferProduct[];
  setTransferItems: React.Dispatch<React.SetStateAction<transferProduct[]>>;
  category: CategoryAPIRes['getCategoryAll'];
  genre: GenreAPIRes['getGenreAll'];
  searchState: ProductSearchState;
  searchItemState: ItemSearchState;
  setSearchItemState: React.Dispatch<React.SetStateAction<ItemSearchState>>;
  performSearch: (isPageSkip?: boolean) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchAllProducts?: () => Promise<void>;
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  productImages: ProductImageData[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImageData[]>>;
  setIsImagesChanged: React.Dispatch<React.SetStateAction<boolean>>;
  isRefetchHistories: boolean;
}

export const StockDetail = ({
  selectedTab,
  setSelectedTab,
  storeId,
  productId,
  stockNumber,
  isStockSaveModalOpen,
  formData,
  setFormData,
  setIsStockSaveModalOpen,
  isResetSpecificPrice,
  setIsResetSpecificPrice,
  setIsStockChange,
  transferItems,
  setTransferItems,
  category,
  genre,
  searchState,
  searchItemState,
  setSearchItemState,
  performSearch,
  fetchProducts,
  fetchAllProducts,
  isReset,
  setIsReset,
  productImages,
  setProductImages,
  setIsImagesChanged,
  isRefetchHistories,
}: Props) => {
  const { wholesalePrice, fetchWholesalePrice } = useWholesalePrice();
  const { handleCancelSpecialPrice, loading: cancelSpecialPriceLoading } =
    useSpecialPriceCancellation();

  // 商品の仕入れ値を取得

  useEffect(() => {
    const getWholesalePrice = async () => {
      if (storeId && productId && stockNumber) {
        await fetchWholesalePrice(productId, stockNumber);
      }
    };
    getWholesalePrice();
    if (selectedTab === StockTabValue.DETAIL) {
      getWholesalePrice();
    }
  }, [storeId, productId, fetchWholesalePrice, selectedTab, stockNumber]);

  useEffect(() => {
    performSearch();
  }, []);

  const { histories, setParams, fetchStockChangeHistory } = useChangeHistory();

  useEffect(() => {
    if (selectedTab === StockTabValue.HISTORY) {
      if (productId) {
        setParams({
          productId: productId,
        });
      }
    }
  }, [setParams, productId, selectedTab]);

  useEffect(() => {
    if (selectedTab === StockTabValue.HISTORY) {
      if (productId && isRefetchHistories) {
        fetchStockChangeHistory();
      }
    }
  }, [productId, selectedTab, isRefetchHistories, fetchStockChangeHistory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, storeId]);

  useEffect(() => {
    setFormData(searchState.searchResults[0]);
  }, [searchState.searchResults]);

  const handleChange = (_: React.SyntheticEvent, newValue: StockTabValue) => {
    setSelectedTab(newValue);
  };

  const handleCancelSpecialPriceWrapper = async () => {
    const specialProduct = searchState.searchResults.find(
      (p) => p.id === productId,
    );
    if (!specialProduct) return;
    await handleCancelSpecialPrice(specialProduct, {
      fetchProducts,
      fetchAllProducts,
    });
  };

  return (
    <Stack sx={{ height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {/* タブ */}
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
        >
          <SecondaryCustomTabTableStyle
            label="在庫変動履歴"
            value={StockTabValue.HISTORY}
          />
          <SecondaryCustomTabTableStyle
            label="在庫情報"
            value={StockTabValue.INFO}
          />
          <SecondaryCustomTabTableStyle
            label="仕入れ値詳細"
            value={StockTabValue.DETAIL}
          />
          {!searchState.searchResults[0]?.consignment_client_id && (
            <SecondaryCustomTabTableStyle
              label="在庫変換"
              value={StockTabValue.TRANSFER}
            />
          )}
        </Tabs>
      </Box>
      <Stack sx={{ height: '100%', overflowY: 'scroll' }}>
        {selectedTab === StockTabValue.HISTORY &&
          // 在庫変動履歴
          searchState.searchResults.length > 0 && (
            <HistoryTab
              detailData={searchState.searchResults}
              fetchProducts={fetchProducts}
              histories={histories}
              onCancelSpecialPrice={handleCancelSpecialPriceWrapper}
              loading={cancelSpecialPriceLoading}
              fetchAllProducts={fetchAllProducts}
            />
          )}
        {selectedTab === StockTabValue.INFO && (
          // 在庫情報
          <InformationTab
            detailData={searchState.searchResults}
            formData={formData}
            setFormData={setFormData}
            wholesalePrice={wholesalePrice}
            isStockSaveModalOpen={isStockSaveModalOpen}
            setIsStockSaveModalOpen={setIsStockSaveModalOpen}
            isResetSpecificPrice={isResetSpecificPrice}
            setIsResetSpecificPrice={setIsResetSpecificPrice}
            setIsStockChange={setIsStockChange}
            fetchProducts={fetchProducts}
            storeId={storeId}
            productId={Number(productId)}
            fetchAllProducts={fetchAllProducts}
            onCancelSpecialPrice={handleCancelSpecialPriceWrapper}
            loading={cancelSpecialPriceLoading}
            productImages={productImages}
            setProductImages={setProductImages}
            setIsImagesChanged={setIsImagesChanged}
          />
        )}
        {selectedTab === StockTabValue.DETAIL && (
          // 仕入れ値詳細
          <PurchaseDetailTab
            detailData={searchState.searchResults}
            originalWholesalePrices={wholesalePrice?.originalWholesalePrices}
            onCancelSpecialPrice={handleCancelSpecialPriceWrapper}
            loading={cancelSpecialPriceLoading}
            fetchProducts={fetchProducts}
            fetchAllProducts={fetchAllProducts}
          />
        )}
        {selectedTab === StockTabValue.TRANSFER && (
          // 在庫変換
          <TransferTab
            storeId={storeId}
            detailData={searchState.searchResults}
            searchItemState={searchItemState}
            setSearchItemState={setSearchItemState}
            transferItems={transferItems}
            setTransferItems={setTransferItems}
            performSearch={performSearch}
            category={category}
            genre={genre}
            isReset={isReset}
            setIsReset={setIsReset}
          />
        )}
      </Stack>
    </Stack>
  );
};
