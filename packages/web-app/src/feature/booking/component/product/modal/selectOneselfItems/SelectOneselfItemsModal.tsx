import { Box, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ModalType } from '@/feature/booking';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { SelectOneselfItemsModalSearch } from '@/feature/booking/component/product/modal/selectOneselfItems/SelectOneselfItemsModalSearch';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemCategoryHandle } from '@prisma/client';
import { SelectOneselfItemsModalTable } from '@/feature/booking/component/product/modal/selectOneselfItems/SelectOneselfItemsModalTable';

interface Props {
  storeId: number;
  handleOpenCreateOrEditReservationModal: (
    posItemId?: number,
    mycaItemId?: number,
  ) => Promise<void>;
  handleChangeModalState: (modalType: ModalType) => void;
  isLoadingCreateItem: boolean;
}

export const SelectOneselfItemsModal = ({
  storeId,
  handleOpenCreateOrEditReservationModal,
  handleChangeModalState,
  isLoadingCreateItem,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();
  const boxCategory = useMemo(
    () =>
      category?.itemCategories.find(
        (category) => category.handle === ItemCategoryHandle.BOX,
      ),
    [category],
  );

  const { searchState, setSearchState, performSearch } = useItemSearch(
    storeId,
    { isMycalinksItem: false },
  );

  const handleSearchNameChange = (newName: string) => {
    setSearchState((prev) => ({
      ...prev,
      searchName: newName,
    }));
  };

  const handleGenreChange = (newGenreId: number) => {
    setSearchState((prev) => ({
      ...prev,
      selectedGenreId: newGenreId,
    }));
  };

  const handleSearch = () => {
    performSearch();
  };

  useEffect(() => {
    setIsLoading(true);
    fetchGenreList();
    fetchCategoryList();
  }, []);

  useEffect(() => {
    if (boxCategory) {
      setSearchState((prev) => ({
        ...prev,
        selectedCategoryId: boxCategory?.id,
      }));
    }
  }, [boxCategory]);

  useEffect(() => {
    if (searchState.selectedCategoryId) {
      performSearch();
      setIsLoading(false);
    }
  }, [searchState.selectedCategoryId]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <SelectOneselfItemsModalSearch
          searchState={{
            searchName: searchState.searchName,
            selectedGenreId: searchState.selectedGenreId,
            selectedCategoryId: searchState.selectedCategoryId,
          }}
          genre={genre?.itemGenres}
          handleSearchNameChange={handleSearchNameChange}
          handleGenreChange={handleGenreChange}
          handleSearch={handleSearch}
        />
        <SecondaryButtonWithIcon
          onClick={() => handleChangeModalState(ModalType.CreateItem)}
        >
          新規で独自商品を作成
        </SecondaryButtonWithIcon>
      </Stack>
      <Box mt={2} height="calc(100% - 100px)">
        <SelectOneselfItemsModalTable
          oneselfItems={searchState.searchResults}
          isLoading={searchState.isLoading || isLoading}
          handleOpenCreateOrEditReservationModal={
            handleOpenCreateOrEditReservationModal
          }
          isLoadingCreateItem={isLoadingCreateItem}
        />
      </Box>
    </>
  );
};
