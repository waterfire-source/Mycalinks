import React, { useEffect, useState } from 'react';
import { useSearchMycaItems } from '@/feature/item/hooks/useSearchMycaItems';
import { MycaItemsModal } from '@/app/auth/(dashboard)/item/components/MycaItemsModal';
import { useMycaGenres } from '@/feature/item/hooks/useMycaGenres';
import { useMycaCart } from '@/feature/item/hooks/useMycaCart';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { Item } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useInfiniteLoader } from '@/hooks/useInfiniteLoading';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const MycaItemsModalContainer: React.FC<Props> = ({ open, onClose }) => {
  const { store } = useStore();
  const { fetchItems, searchParams, setSearchParams } = useSearchMycaItems(
    store.id,
    1000,
  );
  const { genres, fetchMycaGenres } = useMycaGenres();
  const {
    createItem,
    cartMycaItems,
    addCartMycaItem,
    removeCartMycaItem,
    isLoading: addItemLoading,
  } = useMycaCart();

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
    //isPackItemは指定しない
  });

  // `pos_item_id`がないアイテムのみをフィルタリング。検索用のカスタムフックないでフィルタリングを行わず、ここで行なっている理由は、無限スクロールのhasMoreを判定するためにitemPerPageを使うため
  const filteredSearchResults = searchResults.filter(
    (item) => !item.pos_item_id,
  );

  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);

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

  const handleItemTypeChange = (newItemType: 'ボックス' | 'カード' | null) => {
    setSearchParams((prev) => ({
      ...prev,
      itemType: newItemType,
    }));
  };

  const handleSearch = () => {
    resetItemsAndSearch();
  };

  // カートにアイテムを追加する
  const addCartMycaItemFromSearchRes = (
    newItem: mycaItem & { pos_item_id?: Item['id']; genre_name?: string },
  ) => {
    addCartMycaItem({
      myca_item_id: newItem.id,
      ...(newItem.pack_id && { myca_pack_id: newItem.pack_id }),
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
  const createItemFromMyca = async () => {
    if (!store) return;

    try {
      await createItem(store.id);
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
    <MycaItemsModal
      open={open}
      onClose={onClose}
      genres={genres}
      searchState={{
        searchResults: filteredSearchResults,
        searchTerm: searchParams.searchTerm,
        selectedCategory: searchParams.selectedCategory,
        itemType: searchParams.itemType,
        isLoading,
        hasMore,
      }}
      handleSearchTermChange={handleSearchTermChange}
      handleCategoryChange={handleCategoryChange}
      handleItemTypeChange={handleItemTypeChange}
      loadMoreItems={loadMoreItems}
      handleSearch={handleSearch}
      createItem={createItemFromMyca}
      cartMycaItems={cartMycaItems}
      addCartMycaItem={addCartMycaItemFromSearchRes}
      removeCartMycaItem={removeCartMycaItem}
      isLoading={isLoading || isInfiniteLoading}
      addItemLoading={addItemLoading}
    />
  );
};
