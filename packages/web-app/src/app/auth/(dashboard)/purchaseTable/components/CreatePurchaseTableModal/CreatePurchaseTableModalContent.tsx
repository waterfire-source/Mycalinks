import {
  PurchaseTableElement,
  SelectedProduct,
} from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import { InputComponent } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/InputComponent/InputComponent';
import { PurchaseTableItemList } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/ItemComponent/PurchaseTableItemListComponent';
import { PurchaseTableNarrowDown } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/ItemComponent/PurchaseTableNarrowDown';
import { ListedProduct } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/ListedProductComponent/ListedProduct';
import { CustomTemplate } from '@/app/auth/(dashboard)/purchaseTable/hooks/useFetchCustomTemplates';
import { ItemSearch } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/ItemList/ItemSearch';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { useStore } from '@/contexts/StoreContext';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { Box, Stack } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  isShowInputField: boolean;
  selectedProduct: SelectedProduct[];
  setSelectedProduct: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  setPurchaseTable: React.Dispatch<
    React.SetStateAction<PurchaseTableElement | undefined>
  >;
  purchaseTable: PurchaseTableElement | undefined;
  customTemplates: CustomTemplate[];
}

export const CreatePurchaseTableModalContent = ({
  isShowInputField,
  selectedProduct,
  setSelectedProduct,
  setPurchaseTable,
  purchaseTable,
  customTemplates,
}: Props) => {
  const { store } = useStore();
  const { searchState, setSearchState, performSearch } = useItemSearch(
    store.id,
  );

  useEffect(() => {
    performSearch();
  }, [
    searchState.searchName,
    searchState.selectedGenreId,
    searchState.selectedCategoryId,
    searchState.rarity,
    searchState.tag,
    searchState.expansion,
    searchState.cardnumber,
    searchState.orderBy,
    searchState.isActive,
    searchState.isBuyOnly,
    searchState.id,
    searchState.isMycalinksItem,
    searchState.type,
    searchState.status,
  ]);

  return (
    <Stack
      height="100%"
      spacing={1}
      sx={{
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* 上部: 検索フィールド（商品選択時のみ表示） */}
      {!isShowInputField && (
        <Box sx={{ flexShrink: 0 }}>
          <ItemSearch setSearchState={setSearchState} />
        </Box>
      )}

      {/* 下部: メインコンテンツエリア */}
      <Stack
        direction="row"
        flex={1}
        spacing={2}
        sx={{
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* 左側: 商品選択エリア */}
        <Box
          sx={{
            minWidth: 0,
            flex: 7,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {isShowInputField ? (
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <InputComponent
                setPurchaseTable={setPurchaseTable}
                purchaseTable={purchaseTable}
                customTemplates={customTemplates}
              />
            </Box>
          ) : (
            <Stack
              sx={{
                backgroundColor: 'white',
                height: '100%',
                overflow: 'hidden',
              }}
              spacing={1}
            >
              {/* タブの表示 */}
              <Box sx={{ flexShrink: 0 }}>
                <GenreTabComponent setSearchState={setSearchState} />
              </Box>
              {/* 絞り込みの表示 */}
              <Box sx={{ flexShrink: 0 }}>
                <PurchaseTableNarrowDown
                  searchState={searchState}
                  setSearchState={setSearchState}
                />
              </Box>
              {/* テーブルの表示 */}
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <PurchaseTableItemList
                  searchState={searchState}
                  setSearchState={setSearchState}
                  setSelectedProduct={setSelectedProduct}
                />
              </Box>
            </Stack>
          )}
        </Box>

        {/* 右側: 選択済み商品リスト */}
        <Box
          sx={{
            flex: 4,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ListedProduct
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            isShowInputField={isShowInputField}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
