import React from 'react';
import { Box, Typography, SelectChangeEvent } from '@mui/material';
import { SearchItemDetail } from '@/components/modals/searchModal/SearchDetail';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import { SearchResults } from '@/components/modals/searchModal/SearchResults';
import { SearchResultView } from '@/feature/item/components/search/SearchResultView';

interface Props {
  itemSearch: ReturnType<typeof useItemSearch>;
  SearchItemDetailResults: SearchItemDetail[];
  setSelectedItem: React.Dispatch<
    React.SetStateAction<SearchItemDetail | null>
  >;
}

export const SearchItemCard: React.FC<Props> = ({
  itemSearch,
  SearchItemDetailResults,
  setSelectedItem,
}) => {
  // ページ切替
  const handlePageChange = (newPage: number) => {
    itemSearch.setSearchState((prevState: ItemSearchState) => ({
      ...prevState,
      currentPage: newPage,
    }));
  };

  // 表示件数変更
  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    const newItemsPerPage = parseInt(event.target.value as string, 10);
    itemSearch.setSearchState((prevState: ItemSearchState) => ({
      ...prevState,
      itemsPerPage: newItemsPerPage,
    }));
  };

  return (
    <SearchResultView
      itemsPerPage={itemSearch.searchState.itemsPerPage}
      currentPage={itemSearch.searchState.currentPage}
      handleItemsPerPageChange={handleItemsPerPageChange}
      handlePageChange={handlePageChange}
      isLoading={itemSearch.searchState.isLoading}
    >
      {SearchItemDetailResults.length > 0 ? (
        <SearchResults
          onItemClick={(item) => setSelectedItem(item)}
          items={SearchItemDetailResults}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Typography>商品が見つかりませんでした。</Typography>
        </Box>
      )}
    </SearchResultView>
  );
};
