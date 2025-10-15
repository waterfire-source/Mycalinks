import { EcListingModal } from '@/app/auth/(dashboard)/ec/stock/components/EcListingModal/EcListingModal';
import { DetailEcProductModal } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/DetailEcProductModal';
import { EcProductList } from '@/app/auth/(dashboard)/ec/stock/components/EcProductList';
import { EcProductNarrowDown } from '@/app/auth/(dashboard)/ec/stock/components/EcProductNarrowDown';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { ecShopCommonConstants } from '@/constants/ecShops';
import { useStore } from '@/contexts/StoreContext';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { ProductSearch } from '@/feature/products/components/ProductSearch';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import { Box, Stack, Menu, MenuItem, ListItemText } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useOchanokoProductCsv } from '@/app/auth/(dashboard)/ec/list/hooks/useOchanokoProductCsv';

export const EcStockPageContent = () => {
  const { store } = useStore();
  const { updateProduct } = useUpdateProduct();
  const { createProductCsv } = useOchanokoProductCsv({ storeId: store.id });
  const { searchState, setSearchState, fetchProducts, refetchProducts } =
    useStockSearch(store.id, {
      itemPerPage: 30, // 1ページあたりのアイテム数
      currentPage: 0, // 初期ページ
      isActive: true,
      ecAvailable: true,
      isMycalinksItem: true,
    });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEcListingModalState, setIsEcListingModalState] = useState<{
    open: boolean;
    mode: 'show' | 'cancel' | 'shopify_show' | null;
  }>({
    open: false,
    mode: null,
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmCancelModalOpen, setIsConfirmCancelModalOpen] =
    useState(false);
  const [productId, setProductId] = useState<number>();

  // 選択商品操作メニューの状態管理
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // 検索条件変更時に商品を再取得
  const fetchProductsRef = useRef(fetchProducts);
  fetchProductsRef.current = fetchProducts;

  useEffect(() => {
    fetchProductsRef.current();
  }, [
    searchState.searchName,
    searchState.itemGenreId,
    searchState.itemCategoryId,
    searchState.conditionOptionId,
    searchState.orderBy,
    searchState.rarity,
    searchState.modelNumber,
    searchState.mycalinksEcEnabled,
    searchState.currentPage,
    searchState.itemsPerPage,
    store.id,
  ]);

  // 出品価格が0のものは、強制的にECモールから非表示に
  useEffect(() => {
    if (searchState.searchResults.length > 0) {
      // 出品価格0円かつ出品中の商品ID
      const zeroEcSellPriceProductIds = searchState.searchResults
        .filter(
          (product) =>
            product.actual_ec_sell_price === 0 &&
            product.mycalinks_ec_enabled === true,
        )
        .map((product) => product.id);

      const unListFromMycalinksEc = async () => {
        if (zeroEcSellPriceProductIds.length === 0) return;
        try {
          await Promise.all(
            zeroEcSellPriceProductIds.map((selectedId) =>
              updateProduct(store.id, selectedId, {
                mycalinksEcEnabled: false,
              }),
            ),
          );
        } catch (error) {
          console.error('更新中にエラーが発生しました', error);
        } finally {
          // リストをリフェッチ
          fetchProducts();
        }
      };

      unListFromMycalinksEc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, searchState.searchResults]);

  const handleDetailModalOpen = (id: number) => {
    setIsDetailModalOpen(true);
    setProductId(id);
  };

  const handleEcListingModalClose = () => {
    setSelectedIds([]);
    fetchProducts();
    setIsEcListingModalState({
      open: false,
      mode: null,
    });
  };

  const handleConfirmCancelModalClose = () => {
    setProductId(undefined);
    fetchProducts();
    setIsConfirmCancelModalOpen(false);
  };

  // メニューの開閉ハンドラー
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // メニュー項目のクリックハンドラー
  const handleMenuItemClick = (mode: 'show' | 'cancel') => {
    setIsEcListingModalState({
      open: true,
      mode: mode,
    });
    handleMenuClose();
  };

  // おちゃのこCSV生成ハンドラー
  const handleOchanokoCsvClick = async () => {
    if (selectedIds.length === 0) return;

    const result = await createProductCsv(selectedIds);
    if (result) {
      // CSVファイルをダウンロード
      window.open(result.fileUrl, '_blank');
    }
    handleMenuClose();
  };

  // Shopify在庫連携ハンドラー
  const handleShopifyListingClick = () => {
    setIsEcListingModalState({
      open: true,
      mode: 'shopify_show',
    });
    handleMenuClose();
  };

  const publishStoreInfos = ecShopCommonConstants.shopInfo.map((shop) => ({
    key: shop.key,
    displayName: shop.shopName,
    icon: shop.shopIconInfo,
    ImageUrl: shop.shopImageUrl,
  }));

  return (
    <ContainerLayout
      title="EC出品可能在庫"
      actions={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack sx={{ py: 1, mt: 2 }}>
            <PrimaryButtonWithIcon
              sx={{ width: '300px' }}
              onClick={handleMenuClick}
              endIcon={<KeyboardArrowDownIcon />}
              disabled={selectedIds.length === 0}
            >
              選択商品を一括操作{' '}
              {selectedIds.length > 0 && `(${selectedIds.length}件)`}
            </PrimaryButtonWithIcon>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  width: '280px',
                  mt: 1,
                },
              }}
            >
              <MenuItem onClick={() => handleMenuItemClick('show')}>
                <ListItemText primary="MycalinksMallに表示" />
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('cancel')}>
                <ListItemText primary="MycalinksMallから非表示" />
              </MenuItem>
              <MenuItem onClick={handleOchanokoCsvClick}>
                <ListItemText primary="おちゃのこ在庫作成用CSV生成" />
              </MenuItem>
              {/* TODO:Shopify連携
              <MenuItem onClick={handleShopifyListingClick}>
                <ListItemText primary="Shopifyに在庫連携する" />
              </MenuItem>
               */}
            </Menu>
          </Stack>
        </Box>
      }
    >
      {/* 検索 */}
      <ProductSearch setSearchState={setSearchState} />
      <Stack
        sx={{
          backgroundColor: 'white',
          flex: 1,
          minHeight: 0,
          overflow: 'scroll',
        }}
        mt={2}
      >
        {/* タブ */}
        <GenreTabComponent setSearchState={setSearchState} ecAvailable />
        {/* 並び替え */}
        <EcProductNarrowDown
          searchState={searchState}
          setSearchState={setSearchState}
        />
        {/* 在庫リスト */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <EcProductList
            searchState={searchState}
            setSearchState={setSearchState}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            handleDetailModalOpen={handleDetailModalOpen}
          />
        </Box>
      </Stack>

      {/* 出品＆取り消しモーダル */}
      <EcListingModal
        onClose={handleEcListingModalClose}
        selectedIds={selectedIds}
        publishStoreInfos={publishStoreInfos}
        isEcListingModalState={isEcListingModalState}
        refetchProducts={refetchProducts}
      />
      {/* 詳細モーダル */}
      <DetailEcProductModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        productId={productId ?? 0}
        setIsConfirmCancelModalOpen={setIsConfirmCancelModalOpen}
        openConfirmCancelModal={isConfirmCancelModalOpen}
        onCloseConfirmCancelModal={handleConfirmCancelModalClose}
        refetchProducts={refetchProducts}
        searchState={searchState}
      />
    </ContainerLayout>
  );
};
