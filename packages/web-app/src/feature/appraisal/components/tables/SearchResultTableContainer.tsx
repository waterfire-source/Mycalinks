import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import SearchField from '@/components/inputFields/SearchField';
import { CartProduct } from '@/app/auth/(dashboard)/appraisal/register/page';
import { SearchResultTable } from '@/feature/appraisal/components/tables/SearchResultTable';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';

interface Props {
  onAddToCart: (product: CartProduct) => void;
  cardCategoryId: number | null;
}

export const ProductSearchTableContainer: React.FC<Props> = ({
  onAddToCart,
  cardCategoryId,
}) => {
  const { store } = useStore();
  const { searchState, setSearchState, performSearch } = useItemSearch(
    store.id,
    {
      isActive: true,
    },
  );

  // 初回レンダリング時に検索をかける
  useEffect(() => {
    if (cardCategoryId) {
      setSearchState((prev) => ({
        ...prev,
        selectedCategoryId: cardCategoryId,
      }));
      performSearch();
    }
  }, [cardCategoryId]);
  // 商品検索時にカードのカテゴリIDを指定する
  // useEffect(() => {
  //   if (cardCategoryId) {
  //     setSearchState((prev) => ({
  //       ...prev,
  //       selectedCategoryId: cardCategoryId,
  //     }));
  //   }
  // }, [cardCategoryId]);

  const handlePageChange = (newPage: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      currentPage: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      itemsPerPage: newSize,
      currentPage: 0,
    }));
  };

  // WARN: 仕入れ値が現状の商品取得apiの結果に含まれるproductsには取得できず、nullで返ってきてしまうので、以下の記述で仕入れ値をセットしています。商品取得apiで仕入れ値が返ってくるようになれば、除却が必要
  const { fetchWholesalePrice } = useWholesalePrice();

  const [hasFetchedWholesalePrices, setHasFetchedWholesalePrices] =
    useState(false);

  useEffect(() => {
    setHasFetchedWholesalePrices(false);
  }, [
    searchState.searchName,
    searchState.selectedCategoryId,
    searchState.rarity,
    searchState.cardnumber,
    searchState.currentPage,
    searchState.itemsPerPage,
  ]);

  useEffect(() => {
    const updateWholesalePrices = async () => {
      if (hasFetchedWholesalePrices) {
        return;
      }

      if (
        searchState.searchResults &&
        Array.isArray(searchState.searchResults) &&
        searchState.searchResults.length > 0
      ) {
        const updatedSearchResults = await Promise.all(
          searchState.searchResults.map(async (item) => {
            const updatedProducts = await Promise.all(
              item.products.map(async (product) => {
                if (
                  product.wholesale_price !== null &&
                  product.wholesale_price !== undefined
                ) {
                  return product;
                }
                const priceResponse = await fetchWholesalePrice(
                  product.id,
                  product.stock_number,
                  true,
                );
                return {
                  ...product,
                  wholesale_price: priceResponse
                    ? priceResponse.totalWholesalePrice / product.stock_number
                    : null,
                };
              }),
            );
            return {
              ...item,
              products: updatedProducts,
            };
          }),
        );

        setSearchState((prevState) => ({
          ...prevState,
          searchResults: updatedSearchResults,
        }));

        setHasFetchedWholesalePrices(true);
      }
    };

    updateWholesalePrices();
  }, [
    searchState.searchResults,
    fetchWholesalePrice,
    store.id,
    setSearchState,
    hasFetchedWholesalePrices,
  ]);

  return (
    <Stack direction={'column'} gap={2} sx={{ width: '100%', height: '100%' }}>
      <SearchField
        searchState={searchState}
        setSearchState={setSearchState}
        onSearch={performSearch}
      />
      <SearchResultTable
        searchResults={searchState.searchResults}
        onRegister={onAddToCart}
        isLoading={searchState.isLoading}
        currentPage={searchState.currentPage}
        itemsPerPage={searchState.itemsPerPage}
        totalItems={searchState.totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Stack>
  );
};
