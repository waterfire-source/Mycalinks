import { useEffect, useState, useRef, useMemo } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useInfiniteItemSearch } from '@/feature/item/hooks/useInfiniteItemSearch';
import { ItemSearchField } from '@/app/guest/[storeId]/stock/components/ItemSearchField';
import { ProductAddModal } from '@/app/guest/[storeId]/stock/components/ProductAddModal';
import {
  ProductItem,
  formatApiResponseToProductItem,
} from '@/app/guest/[storeId]/stock/components/ProductItem';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { useParamsInGuest } from '@/app/guest/[storeId]/stock/hooks/useParamsInGuest';

import Image from 'next/image';
import NoImg from '@/components/common/NoImg';
import { getSellPrice } from '@/feature/products/utils/price';
import { CategoryAPIRes } from '@/api/frontend/category/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ItemCategoryHandle } from '@prisma/client';

export function ItemListContent() {
  // モーダルの状態管理
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductItem | null>(null);

  // URLからパラメータを取得
  const { storeId } = useParamsInGuest();
  const searchParams = useSearchParams();
  const genreId = searchParams.get('genreId');
  const hasStockParam = searchParams.get('hasStock');
  const hasStock = hasStockParam === 'true' || hasStockParam === null;

  // カテゴリの取得(find option用)
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [category, setCategory] = useState<CategoryAPIRes['getCategoryAll']>();
  const fetchCategoryList = async (storeId: number) => {
    try {
      const res = await clientAPI.category.getCategoryAll({
        storeID: storeId,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setCategory(res);
    } catch (error) {
      setAlertState({
        message: 'カテゴリの取得に失敗しました',
        severity: 'error',
      });
    }
  };
  // カテゴリー内の「カード」
  const cardCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.CARD,
      ),
    [category],
  );

  // 商品検索（無限スクロール対応）
  const {
    searchState,
    setSearchState,
    performSearch,
    loadMoreItems,
    selectedFindOption,
    handleChangeFindOption,
  } = useInfiniteItemSearch(Number(storeId), {
    selectedGenreId: genreId ? Number(genreId) : undefined,
    hasStock,
    fromTablet: true,
    itemsPerPage: 100,
  });

  // スクロール監視用のRef
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (genreId && searchState.selectedGenreId !== Number(genreId)) {
      setSearchState((prev) => ({
        ...prev,
        selectedGenreId: Number(genreId),
      }));
    }
  }, [genreId]);

  useEffect(() => {
    fetchCategoryList(storeId);
  }, [storeId]);

  useEffect(() => {
    if (genreId && !searchState.isLoading) {
      performSearch();
    }
  }, [genreId, selectedFindOption, searchState.hasStock]);

  // 無限スクロールの処理
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      searchState.hasMore &&
      !searchState.isLoading
    ) {
      loadMoreItems();
    }
  };

  // カードがクリックされたときにモーダルを開く
  const handleCardClick = (
    item: BackendItemAPI[0]['response']['200']['items'][0],
  ) => {
    setSelectedItem(formatApiResponseToProductItem(item));
    setModalOpen(true);
  };

  return (
    <ContainerLayout title="在庫検索">
      <Grid
        container
        columnSpacing={3}
        sx={{ height: '120px', alignItems: 'center' }}
      >
        <Grid item xs={9} sx={{ minWidth: '100%' }}>
          <ItemSearchField
            onSearch={performSearch}
            setSearchState={setSearchState}
            searchState={searchState}
            storeId={storeId}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
            cardCategoryId={cardCategory?.id}
          />
        </Grid>
      </Grid>

      {/* スクロール可能なボックス */}
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          height: '100%',
          overflowY: 'auto',
          mt: 2,
          p: 1,
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: 2,
        }}
      >
        <Grid container spacing={2}>
          {searchState.searchResults?.map((item) => {
            const availableProduct =
              item.products.find((product) => product.stock_number > 0) ||
              item.products[0];
            return (
              <Grid item xs={4} key={item.id}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid',
                    borderRadius: '8px',
                    p: 2,
                    boxShadow: 3,
                    height: '200px',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 },
                  }}
                  onClick={() => handleCardClick(item)}
                >
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={4}>
                      {item.image_url ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Image
                            src={item.image_url}
                            alt="product"
                            width={110 * 0.71}
                            height={110}
                          />
                        </Box>
                      ) : (
                        <NoImg height={110} width={110 * 0.71} />
                      )}
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={7}>
                      <Typography sx={{ whiteSpace: 'normal' }}>
                        {item.display_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ whiteSpace: 'normal' }}
                      >
                        ({item.expansion} {item.cardnumber} {item.rarity})
                      </Typography>
                      <Typography sx={{ whiteSpace: 'normal' }}>
                        【{availableProduct.condition_option_display_name}】
                        {availableProduct.specialty__display_name}
                      </Typography>
                      <Typography
                        sx={{
                          whiteSpace: 'normal',
                          color: 'primary.main',
                          fontWeight: 'bold',
                        }}
                      >
                        <Box fontSize={16}>
                          {getSellPrice(availableProduct).toLocaleString()} 円
                        </Box>
                      </Typography>
                      <Typography sx={{ whiteSpace: 'normal' }}>
                        在庫{' '}
                        {availableProduct.item_infinite_stock
                          ? '∞'
                          : availableProduct.stock_number?.toLocaleString() +
                            ' 枚 ~'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* ローディングインジケータ */}
        {searchState.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {selectedItem && (
        <ProductAddModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          item={selectedItem}
        />
      )}
    </ContainerLayout>
  );
}
