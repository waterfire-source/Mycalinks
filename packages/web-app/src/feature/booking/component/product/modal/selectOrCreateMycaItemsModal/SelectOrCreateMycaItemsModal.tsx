import { Box, Stack } from '@mui/material';
import { useSearchMycaItems } from '@/feature/item/hooks/useSearchMycaItems';
import { useMycaGenres } from '@/feature/item/hooks/useMycaGenres';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';
import { useEffect, useMemo, useState } from 'react';
import { SelectOrCreateMycaItemsModalSearch } from '@/feature/booking/component/product/modal/selectOrCreateMycaItemsModal/SelectOrCreateMycaItemsModalSearch';
import { SelectOrCreateMycaItemsModalTable } from '@/feature/booking/component/product/modal/selectOrCreateMycaItemsModal/SelectOrCreateMycaItemsModalTable';
import { ModalType, MycaItemType } from '@/feature/booking';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';

interface Props {
  storeId: number;
  handleOpenCreateOrEditReservationModal: (
    posItemId?: number,
    mycaItemId?: number,
  ) => Promise<void>;
  handleChangeModalState: (modalType: ModalType) => void;
  isLoadingCreateItem: boolean;
}

export const SelectOrCreateMycaItemsModal = ({
  storeId,
  handleOpenCreateOrEditReservationModal,
  handleChangeModalState,
  isLoadingCreateItem,
}: Props) => {
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

  const { fetchItems, searchParams, setSearchParams } = useSearchMycaItems(
    storeId,
    1000,
    { itemType: 'ボックス' },
  );
  const { genres, fetchMycaGenres } = useMycaGenres();
  const {
    items: searchResults,
    isLoading,
    loadMoreItems,
    resetItemsAndSearch,
    hasMore,
    newItems,
  } = useInfiniteLoader({
    fetchItems,
    itemsPerPage: searchParams.itemsPerPage,
  });

  // genre_idとgenres.idを比較してgenre_nameを追加
  const mycaItemsWithGenreName: MycaItemType[] = useMemo(
    () =>
      searchResults?.map((item) => {
        const matchedGenre = genres.find((genre) => genre.id === item.genre_id);
        return {
          ...item,
          genre_name: matchedGenre?.display_name || '不明', // 見つからなかった場合は"不明"
        };
      }),
    [searchResults, genres],
  );

  const handleSearchTermChange = (newTerm: string) => {
    setSearchParams((prev) => ({
      ...prev,
      searchTerm: newTerm,
    }));
  };

  const handleCategoryChange = (newCategory: number | null) => {
    setSearchParams((prev) => ({
      ...prev,
      selectedCategory: newCategory,
    }));
  };

  const handleSearch = () => {
    resetItemsAndSearch();
  };

  //結果が5件未満なら再検索
  useEffect(() => {
    if (hasMore === false) {
      setIsInfiniteLoading(false);
      return;
    }
    if (newItems.filter((item) => !item.pos_item_id).length < 5) {
      setIsInfiniteLoading(true);
      loadMoreItems(); // 再検索
      return;
    }
    setIsInfiniteLoading(false);
  }, [newItems, hasMore, loadMoreItems]);

  useEffect(() => {
    fetchMycaGenres();
    resetItemsAndSearch();
  }, []);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <SelectOrCreateMycaItemsModalSearch
          searchState={{
            searchTerm: searchParams.searchTerm,
            selectedCategory: searchParams.selectedCategory,
          }}
          genres={genres}
          handleSearchTermChange={handleSearchTermChange}
          handleCategoryChange={handleCategoryChange}
          handleSearch={handleSearch}
        />
        <SecondaryButtonWithIcon
          onClick={() => handleChangeModalState(ModalType.CreateItem)}
        >
          独自商品の予約を作成
        </SecondaryButtonWithIcon>
      </Stack>
      <Box mt={2} height="calc(100% - 100px)">
        <SelectOrCreateMycaItemsModalTable
          mycaItemsWithGenreName={mycaItemsWithGenreName}
          isLoading={isLoading || isInfiniteLoading}
          hasMore={hasMore}
          loadMoreItems={loadMoreItems}
          handleOpenCreateOrEditReservationModal={
            handleOpenCreateOrEditReservationModal
          }
          isLoadingCreateItem={isLoadingCreateItem}
        />
      </Box>
    </>
  );
};
