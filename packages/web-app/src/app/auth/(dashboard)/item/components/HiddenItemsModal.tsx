import { ItemTable } from '@/app/auth/(dashboard)/item/components/itemTable/ItemTable';
import SearchFieldWithParams from '@/components/inputFields/SearchFieldWithParams';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { Box } from '@mui/material';
import { ItemStatus } from '@prisma/client';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}
export const HiddenItemsModal = ({
  open,
  setOpen,
  onPageChange,
  onPageSizeChange,
}: Props) => {
  const { store } = useStore();
  const {
    searchState,
    setSearchState,
    performSearch,
    selectedFindOption,
    handleChangeFindOption,
  } = useItemSearch(store.id, {
    status: ItemStatus.HIDDEN,
  });
  useEffect(() => {
    performSearch();
  }, [
    searchState.currentPage,
    searchState.itemsPerPage,
    searchState.selectedGenreId,
    searchState.selectedCategoryId,
    selectedFindOption,
  ]);
  return (
    <CustomModalWithIcon
      open={open}
      onClose={() => {
        setOpen(false);
        setSearchState({
          ...searchState,
          currentPage: 0,
          itemsPerPage: 30,
          selectedGenreId: undefined,
          selectedCategoryId: undefined,
        });
      }}
      title="非表示商品一覧"
      width="90%"
      height="85%"
      hideButtons={true}
    >
      <SearchFieldWithParams
        onSearch={performSearch}
        setSearchState={setSearchState}
        searchState={searchState}
      />
      <Box height="10px" />
      <ItemTable
        items={searchState.searchResults}
        selectedStoreID={store.id}
        paginationModel={{
          page: searchState.currentPage,
          pageSize: searchState.itemsPerPage,
          totalCount: searchState.totalCount,
        }}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={searchState.isLoading}
        refetchItemsAfterUpdate={performSearch}
        isEditMode={false}
        editedPrices={{}}
        setEditedPrices={() => {}}
        setSearchState={setSearchState}
        selectedGenreID={searchState.selectedGenreId}
        selectedFindOption={selectedFindOption}
        handleChangeFindOption={handleChangeFindOption}
        isHiddenItems
      />
    </CustomModalWithIcon>
  );
};
