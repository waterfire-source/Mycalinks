'use client';

import { NarrowDownComponent } from '@/app/auth/(dashboard)/stock/components/NarrowDownComponent';
import { ProductSearch } from '@/app/auth/(dashboard)/stock/components/ProductSearch';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { TableComponent } from '@/app/auth/(dashboard)/stock/components/TableComponent';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import { Box, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { StockDetailModal } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { HelpIcon } from '@/components/common/HelpIcon';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ProductCsvDownloadModal } from '@/components/modals/csvDownload/ProductCsvDownloadModal';

export const StockPageContent = () => {
  const { store } = useStore();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [productId, setProductId] = useState<number>();
  const { pushQueue } = useLabelPrinterHistory();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { category, fetchCategoryList } = useCategory();
  const [printOption, setPrintOption] = useState<
    'stockQuantity' | 'customNumber'
  >('stockQuantity'); //ラベル印刷時のオプション
  const [customPrintCount, setCustomPrintCount] = useState(1);
  const {
    searchState,
    setSearchState,
    fetchProducts,
    selectedFindOption,
    handleChangeFindOption,
    refetchProducts,
  } = useStockSearch(store.id, {
    itemPerPage: 30, // 1ページあたりのアイテム数
    currentPage: 0, // 初期ページ
    isActive: true,
    stockNumberGte: 1,
  });

  const { genre, fetchGenreList } = useGenre();
  const { specialties, fetchSpecialty } = useGetSpecialty();

  useEffect(() => {
    fetchCategoryList();
    fetchGenreList();
  }, [store.id, fetchCategoryList, fetchGenreList]);

  useEffect(() => {
    fetchProducts();
  }, [searchState.itemGenreId, fetchProducts, store.id]);

  useEffect(() => {
    fetchSpecialty();
  }, [store.id, fetchSpecialty]);

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsDetailModalOpen(false);
    setProductId(undefined);
  };

  return (
    <ContainerLayout
      title="在庫一覧"
      helpArchivesNumber={666}
      actions={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <RadioGroup
            row
            aria-label="printOption"
            name="printOption"
            value={printOption}
            onChange={(event) =>
              setPrintOption(event.target.value as typeof printOption)
            }
          >
            <FormControlLabel
              value="customNumber"
              control={<Radio />}
              label={
                <NumericTextField
                  value={customPrintCount}
                  onChange={(number) => setCustomPrintCount(number)}
                  min={1}
                  sx={{ width: '120px' }}
                  endSuffix="枚ずつ"
                  suffixSx={{ whiteSpace: 'nowrap' }}
                ></NumericTextField>
              }
            />
            <FormControlLabel
              value="stockQuantity"
              control={<Radio />}
              label="在庫数(入力数)"
            />
          </RadioGroup>
          <PrimaryButtonWithIcon
            sx={{
              minWidth: '220px',
            }}
            onClick={async () => {
              const printDatas = searchState.searchResults.filter((e) =>
                selectedIds.includes(e.id),
              );

              //在庫数分印刷の場合→価格無し1枚+残り価格あり
              //1枚ずつ印刷の場合↓

              //在庫数1のもの→価格あり
              //在庫数が２以上のもの→価格無し

              printDatas.forEach((product) => {
                const printCount =
                  printOption === 'customNumber'
                    ? Math.min(customPrintCount, product.stock_number)
                    : product.printCount ?? product.stock_number;

                let isFirstStock =
                  (printOption === 'customNumber' &&
                    product.stock_number <= 1) ||
                  printOption != 'customNumber';

                for (let i = 0; i < printCount; i++) {
                  pushQueue({
                    template: 'product',
                    data: product.id,
                    meta: {
                      isFirstStock,
                      isManual: true,
                    },
                  });

                  isFirstStock = false;
                }
              });
            }}
          >
            選択済みの
            {selectedIds.length}
            ラベルを全て印刷
          </PrimaryButtonWithIcon>
          <HelpIcon helpArchivesNumber={1533} />
          <ProductCsvDownloadModal />
          <HelpIcon helpArchivesNumber={1573} />
        </Box>
      }
    >
      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          gap: 1,
        }}
      >
        {/* 検索 */}
        <ProductSearch setSearchState={setSearchState} />
        {/* タブコンポーネント */}
        <GenreTabComponent setSearchState={setSearchState} />
        <Stack sx={{ backgroundColor: 'white', flex: 1, minHeight: 0 }}>
          {/* 絞り込み */}
          <NarrowDownComponent
            searchState={searchState}
            setSearchState={setSearchState}
            category={category}
            specialties={specialties}
            storeId={store.id}
            selectedFindOption={selectedFindOption}
            handleChangeFindOption={handleChangeFindOption}
          />
          {/* テーブル */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <TableComponent
              searchState={searchState}
              setSearchState={setSearchState}
              setIsDetailModalOpen={setIsDetailModalOpen}
              setProductId={setProductId}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          </Box>
        </Stack>
      </Stack>

      {/* モーダル */}
      {productId && category && genre && (
        <StockDetailModal
          productId={productId}
          isOpen={isDetailModalOpen}
          onClose={closeModal}
          genre={genre}
          category={category}
          fetchAllProducts={refetchProducts}
        />
      )}
    </ContainerLayout>
  );
};
