import React, { useCallback, useEffect } from 'react';
import { useSearchMycaItems } from '@/feature/item/hooks/useSearchMycaItems';
import { useMycaGenres } from '@/feature/item/hooks/useMycaGenres';
import { useMycaCart } from '@/feature/item/hooks/useMycaCart';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { Item } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';
import { MycaPackItemsModal } from '@/app/auth/(dashboard)/item/components/MycaPackItemsModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MycaPackItemsModalContainer: React.FC<Props> = ({
  open,
  onClose,
}) => {
  const { store } = useStore();
  const { fetchItems, searchParams, setSearchParams } = useSearchMycaItems(
    store.id,
  );
  const { genres, fetchMycaGenres } = useMycaGenres();
  const {
    createPackItem,
    cartMycaItems,
    addCartMycaItem,
    removeCartMycaItem,
    isLoading: addItemLoading,
  } = useMycaCart();

  const fetchItemsExcludesCompletedPack = useCallback(
    (page: number, itemsPerPage: number, isPack?: true) => {
      return fetchItems(page, itemsPerPage, isPack, true);
    },
    [fetchItems],
  );

  const {
    items: searchResults,
    isLoading,
    loadMoreItems,
    resetItemsAndSearch,
    hasMore,
  } = useInfiniteLoader({
    fetchItems: fetchItemsExcludesCompletedPack,
    itemsPerPage: searchParams.itemsPerPage,
    isPackItem: true,
  });

  useEffect(() => {
    fetchMycaGenres();
  }, []);

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

  // カートにアイテムを追加する
  const addCartMycaItemFromSearchRes = (
    newItem: mycaItem & { pos_item_id?: Item['id']; genre_name?: string },
  ) => {
    addCartMycaItem({
      myca_item_id: newItem.id,
      ...(newItem.pack_id && { myca_pack_id: newItem.pack_id }),
      ...(newItem.item_pack_id && { myca_item_pack_id: newItem.item_pack_id }),
      display_name: newItem.cardname,
      displayNameWithMeta: newItem.displayNameWithMeta,
      ...(newItem.price && { price: newItem.price }),
      ...(newItem.rarity && { rarity: newItem.rarity }),
      ...(newItem.pack && { pack_name: newItem.pack }),
      ...(newItem.full_image_url && { image_url: newItem.full_image_url }),
      ...(newItem.genre_id && { department_id: newItem.genre_id }),
      ...(newItem.displaytype1 && { displaytype1: newItem.displaytype1 }),
      ...(newItem.genre_name && { genre_name: newItem.genre_name }),
    });
  };

  // Mycaから新しいアイテムを作成
  const createPackItemFromMyca = async () => {
    if (!store) return;

    try {
      await createPackItem(store.id);
    } catch (error) {
      console.error('Item creation failed:', error);
    }
  };

  // モーダルを開いた直後の初回検索(初回検索をしたくないコンポーネントがありそうだからカスタムフックでは作らないでおいた。)
  useEffect(() => {
    if (open) {
      resetItemsAndSearch();
    }
  }, [open]);

  return (
    <MycaPackItemsModal
      open={open}
      onClose={onClose}
      genres={genres}
      searchState={{
        searchResults: searchResults,
        searchTerm: searchParams.searchTerm,
        selectedCategory: searchParams.selectedCategory,
        isLoading,
        hasMore,
      }}
      handleSearchTermChange={handleSearchTermChange}
      handleCategoryChange={handleCategoryChange}
      loadMoreItems={loadMoreItems}
      handleSearch={resetItemsAndSearch}
      createPackItem={createPackItemFromMyca}
      cartMycaItems={cartMycaItems}
      addCartMycaItem={addCartMycaItemFromSearchRes}
      removeCartMycaItem={removeCartMycaItem}
      isLoading={isLoading}
      addItemLoading={addItemLoading}
    />
  );
};
