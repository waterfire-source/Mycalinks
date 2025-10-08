'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useSession } from 'next-auth/react';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import theme from '@/theme';
import { MobileStockSearchField } from '@/components/inputFields/MobileStockSearchField';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';
import { usePaginatedProductSearch } from '@/feature/products/hooks/usePaginatedProductSearch';
import { StockItem } from '@/feature/stock/components/StockItem';
import Grey500whiteButton from '@/components/buttons/grey500whiteButton';
import { MobileChangeHistoryListModal } from '@/feature/stock/change-history/list/MobileChangeHistoryListModal';
import { MobileChangeHistoryModal } from '@/feature/stock/components/MobileChangeHistoryModal/MobileChangeHistoryModal';

export function MobileStockPageContent() {
  const { store } = useStore();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;

  const [editItem, setEditItem] = useState<
    BackendProductAPI[0]['response']['200']['products'][0] | null
  >(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const { searchState, setSearchState, fetchItems } = usePaginatedProductSearch(
    store.id,
    {
      isActive: true,
    },
  );

  const {
    items: searchResults,
    isLoading,
    loadMoreItems,
    hasMore,
    resetItemsAndSearch,
  } = useInfiniteLoader({
    fetchItems,
    itemsPerPage: searchState.itemsPerPage,
  });

  // モーダルを開く
  const handleOpenEditModal = (
    item: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    setEditItem(item);
    setEditModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditItem(null);
  };

  //ProductDetailTableで更新したらモーダルを閉じて検索をやりなおす。
  useEffect(() => {
    if (isUpdated) {
      handleCloseEditModal();
      resetItemsAndSearch();
      setIsUpdated(false);
    }
  }, [isUpdated, resetItemsAndSearch]);

  // TODO: 優先度低: 初回レンダリング時に以下のuseEffectが二回発火される。
  useEffect(() => {
    resetItemsAndSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasMore &&
      !isLoading
    ) {
      loadMoreItems();
    }
  };

  return (
    <>
      <Stack
        flexDirection={'column'}
        gap={1}
        width={'100%'}
        height={'100%'}
        padding={'10px'}
      >
        <Stack
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          width={'100%'}
        >
          <Stack direction={'row'} gap="12px">
            <InventoryIcon sx={{ color: theme.palette.grey[700] }} />
            <Typography variant="body1">在庫状況</Typography>
          </Stack>
          <Grey500whiteButton onClick={() => setHistoryModalOpen(true)}>
            在庫数変更履歴
          </Grey500whiteButton>
        </Stack>

        <MobileStockSearchField
          onSearch={resetItemsAndSearch}
          searchState={searchState}
          setSearchState={setSearchState}
        />

        <Stack direction={'column'} height={'100%'} sx={{ overflowY: 'auto' }}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'common.black',
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              overflowY: 'auto',
            }}
            onScroll={handleScroll}
          >
            {searchResults.length > 0 ? (
              <>
                {searchResults.map((stockItem, index) => (
                  <Stack key={index}>
                    <StockItem
                      imageUrl={stockItem.image_url ?? ''}
                      title={stockItem.displayNameWithMeta ?? ''}
                      condition={stockItem.condition_option_display_name ?? ''}
                      rarity={stockItem.item_rarity || ''}
                      stock={stockItem.stock_number}
                      sellPrice={
                        stockItem.specific_sell_price ??
                        stockItem.sell_price ??
                        0
                      }
                      buyPrice={
                        stockItem.specific_buy_price ?? stockItem.buy_price ?? 0
                      }
                      onDetailClick={() => handleOpenEditModal(stockItem)}
                    />
                    <Divider sx={{ width: '100%' }} />
                  </Stack>
                ))}
                {isLoading && (
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
              </>
            ) : isLoading ? (
              <Stack
                justifyContent={'center'}
                alignItems={'center'}
                sx={{ height: '100%', width: '100%' }}
              >
                <CircularProgress size={24} />
              </Stack>
            ) : (
              <Stack
                justifyContent={'center'}
                alignItems={'center'}
                sx={{ height: '100%', width: '100%' }}
              >
                <Typography variant="body1" color="text.primary">
                  在庫データがありません。
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Stack>

      <MobileChangeHistoryModal
        isOpen={editModalOpen}
        setIsOpen={handleCloseEditModal}
        editItem={editItem}
        store={store}
        staffAccountID={staffAccountID}
        setIsUpdated={setIsUpdated}
      />

      <MobileChangeHistoryListModal
        isOpen={historyModalOpen}
        setIsOpen={setHistoryModalOpen}
      />
    </>
  );
}
