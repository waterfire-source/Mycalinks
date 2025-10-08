'use client';

import { useEffect } from 'react';
import { Stack } from '@mui/material';
import { MobileSearchField } from '@/components/inputFields/MobileSearchField';
import { usePaginatedItemSearch } from '@/feature/item/hooks/usePaginatedItemSearch';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { useStore } from '@/contexts/StoreContext';
import { MobileSearchResults } from '@/components/common/MobileSearchResults';

interface Props {
  onRegister: (
    productId: number,
    row: BackendItemAPI[0]['response']['200']['items'][0],
    registerCount: number,
  ) => void;
  height: string | number;
  isStockRestriction?: boolean; // 在庫数以上登録できなくするかどうか。
}

export const MobileItemSearchSection = ({
  onRegister,
  height,
  isStockRestriction = false,
}: Props) => {
  const { store } = useStore();

  const { searchState, setSearchState, fetchItems } = usePaginatedItemSearch(
    store.id,
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

  // TODO: 優先度低: 初回レンダリング時に以下のuseEffectが二回発火される。
  useEffect(() => {
    resetItemsAndSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack direction={'column'} sx={{ height }} gap={1}>
      <MobileSearchField
        onSearch={resetItemsAndSearch}
        searchState={searchState}
        setSearchState={setSearchState}
      />
      <Stack sx={{ flex: 1, overflowY: 'auto' }}>
        <MobileSearchResults
          searchResults={searchResults}
          onRegister={onRegister}
          isLoading={isLoading}
          loadMoreItems={loadMoreItems}
          hasMore={hasMore}
          isStockRestriction={isStockRestriction}
        />
      </Stack>
    </Stack>
  );
};
