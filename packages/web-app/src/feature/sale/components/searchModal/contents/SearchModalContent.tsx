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
import { AddItemCard } from '@/feature/sale/components/searchModal/contents/AddItemCard';
import { SearchItemCard } from '@/feature/sale/components/searchModal/contents/SearchItemCard';

export const SearchModalContent: React.FC = () => {
  const { store } = useStore();

  // 通常商品用の検索フック
  const itemSearch = useItemSearch(store.id, {
    isActive: true,
    isBuyOnly: false,
    itemPerPage: 50,
  });

  // API レスポンスを SearchItemDetail 型に変換したアイテムを保持
  const [selectedItem, setSelectedItem] = useState<SearchItemDetail | null>(
    null,
  );
  const [currentDepartment, setCurrentDepartment] = useState<{
    categoryId?: number | null;
    genreId?: number | null;
  }>({ categoryId: null, genreId: null });

  const handleSearch = () => {
    itemSearch.performSearch();
  };

  const handleDetailsClose = () => {
    setSelectedItem(null);
  };

  const handleDepartmentChange = (
    categoryId?: number | null,
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
  }, [currentDepartment]);

  // ここで一括して SearchItemDetail に変換する
  const SearchItemDetailResults: SearchItemDetail[] = (
    itemSearch.searchState.searchResults || []
  ).map((item: BackendItemAPI[0]['response']['200']['items'][0]) => {
    const products: SearchItemDetail['products'] = item.products.map((p) => {
      const product: SearchItemDetail['products'][0] = {
        id: p.id,
        sell_price: p.sell_price,
        specific_sell_price: p.specific_sell_price,
        stock_number: p.stock_number,
        // 特殊状態がある場合はそれを表示
        condition_option_display_name: p.specialty__display_name
          ? p.specialty__display_name +
            ' (' +
            p.condition_option_display_name +
            ')'
          : p.condition_option_display_name,
        item_infinite_stock: p.item_infinite_stock,
        is_special_price_product: p.is_special_price_product,
        management_number: p.management_number,
        consignment_client_id: p.consignment_client_id ?? null,
        consignment_client__display_name:
          p.consignment_client__display_name ?? null,
        consignment_client__full_name: p.consignment_client__full_name ?? null,
      };
      return product;
    });
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
      products,
      infinite_stock: item.infinite_stock, //無限商品かどうか
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
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
      data-testid="product-search-content"
    >
      <Stack flexDirection="row" gap={2} sx={{ width: '100%' }}>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <SearchControls
            onSearch={handleSearch}
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
            onIsActiveChange={handleIsActiveChange}
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
  );
};
