import React, { useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { SearchItemDetail } from '@/components/modals/searchModal/SearchDetail';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import { useStore } from '@/contexts/StoreContext';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { SearchControls } from '@/components/modals/searchModal/SearchControls';
import { AddItemCard } from '@/feature/purchase/components/searchModal/contents/AddItemCard';
import { SearchItemCard } from '@/feature/purchase/components/searchModal/contents/SearchItemCard';
import { isOriginalProductCategory } from '@/feature/item/utils';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';

export const SearchModalContent: React.FC = () => {
  const { store } = useStore();

  // 通常商品用の検索フック
  const itemSearch = useItemSearch(store.id, {
    itemPerPage: 50,
  });

  // API レスポンスを SearchItemDetail 型に変換したアイテムを保持
  const [selectedItem, setSelectedItem] = useState<SearchItemDetail | null>(
    null,
  );

  const handleDetailsClose = () => {
    setSelectedItem(null);
  };

  const [currentDepartment, setCurrentDepartment] = useState<{
    categoryId?: number;
    genreId?: number | null;
  }>({ categoryId: undefined, genreId: undefined });

  const handleDepartmentChange = (
    categoryId?: number,
    genreId?: number | null,
  ) => {
    setCurrentDepartment({ categoryId, genreId });
    itemSearch.setSearchState((prevState: ItemSearchState) => ({
      ...prevState,
      selectedCategoryId: categoryId ?? undefined,
      selectedGenreId: genreId ?? undefined,
    }));
  };

  // DepartmentID に応じた検索の実施
  useEffect(() => {
    itemSearch.performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDepartment, itemSearch.selectedFindOption]);

  // SearchItemDetail に変換する
  const SearchItemDetailResults: SearchItemDetail[] = (
    itemSearch.searchState.searchResults || []
  )
    .filter((item) => !isOriginalProductCategory(item.category_handle)) // オリパや福袋などは表示しない
    .map((item: BackendItemAPI[0]['response']['200']['items'][0]) => {
      const products: SearchItemDetail['products'] = item.products
        .map((p) => {
          if (p.consignment_client_id) return null;
          const product: SearchItemDetail['products'][0] = {
            id: p.id,
            purchase_price: p.buy_price,
            specific_purchase_price: p.specific_buy_price,
            stock_number: p.stock_number,
            condition_option_display_name: p.condition_option_display_name,
            conditionDisplayName: getConditionDisplayName(p),
            specialty__display_name: p.specialty__display_name,
            item_infinite_stock: p.item_infinite_stock,
            is_special_price_product: p.is_special_price_product,
          };
          return product;
        })
        .filter(
          (product): product is NonNullable<typeof product> => product !== null,
        );

      // 通常商品の場合
      return {
        id: item.id,
        image_url: item.image_url,
        display_name: item.display_name,
        display_name_with_meta: item.products[0]?.displayNameWithMeta,
        stock_number: item.init_stock_number,
        description: item.description,
        expansion: item.expansion,
        cardnumber: item.cardnumber,
        pack_name: item.pack_name,
        rarity: item.rarity,
        infinite_stock: item.infinite_stock,
        products,
      };
    });

  // 在庫がある商品を初期選択状態にセット
  useEffect(() => {
    if (!selectedItem && SearchItemDetailResults.length > 0) {
      const itemWithStock = SearchItemDetailResults.find((item) =>
        item.products.some((p) => p.stock_number && p.stock_number > 0),
      );
      if (itemWithStock) {
        setSelectedItem(itemWithStock);
      }
    }
  }, [SearchItemDetailResults, selectedItem]);

  const handleIsActiveChange = (value: boolean | undefined) => {
    if (typeof value === 'boolean') {
      if (value) {
        itemSearch.setSearchState((prev: ItemSearchState) => ({
          ...prev,
          isActive: true,
        }));
      } else {
        itemSearch.setSearchState((prev: ItemSearchState) => ({
          ...prev,
          isActive: false,
        }));
      }
    } else {
      itemSearch.setSearchState((prev: ItemSearchState) => ({
        ...prev,
        isActive: undefined,
      }));
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          overflowY: 'auto',
          gap: '10px',
        }}
        data-testid="product-search-content"
      >
        <Stack flexDirection="row" gap={2} sx={{ width: '100%' }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <SearchControls
              onSearch={() => itemSearch.performSearch()}
              onCategoryOrGenreChange={handleDepartmentChange}
              searchTerm={itemSearch.searchState.searchName}
              setSearchTerm={(e) =>
                itemSearch.setSearchState((prev: ItemSearchState) => ({
                  ...prev,
                  searchName: e.target.value,
                }))
              }
              isActive={
                itemSearch.searchState.isActive === true
                  ? 'true'
                  : itemSearch.searchState.isActive === false
                  ? 'false'
                  : 'undefined'
              }
              isPurchase={true}
              onIsActiveChange={handleIsActiveChange}
              storeId={store.id}
              selectedGenreId={itemSearch.searchState.selectedGenreId}
              selectedCategoryId={itemSearch.searchState.selectedCategoryId}
              selectedFindOption={itemSearch.selectedFindOption}
              handleChangeFindOption={itemSearch.handleChangeFindOption}
            />
          </Box>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            overflowY: 'auto',
            flex: '1',
            gap: '10px',
          }}
        >
          <Box width="60%">
            <SearchItemCard
              itemSearch={itemSearch}
              SearchItemDetailResults={SearchItemDetailResults}
              setSelectedItem={setSelectedItem}
            />
          </Box>
          <AddItemCard
            selectedItem={selectedItem}
            handleDetailsClose={handleDetailsClose}
          />
        </Box>
      </Box>
    </>
  );
};
