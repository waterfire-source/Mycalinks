import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { StockDetailModal } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { AddSpecialPriceStockModal } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SpecialPriceStockNarrowDown } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/SpecialPriceStockNarrowDown';
import { SpecialPriceStockSearch } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/SpecialPriceStockSearch';
import { SpecialPriceStockTable } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/SpecialPriceStockTable';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import { Box, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

export const SpecialPriceStockPageContent = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const { store } = useStore();
  const { searchState, setSearchState, fetchProducts } = useStockSearch(
    store.id,
    {
      itemPerPage: 30, // 1ページあたりのアイテム数
      currentPage: 0, // 初期ページ
      isActive: true,
      isSpecialPriceProduct: true, //特価在庫情報を含む
    },
  );
  const [printOption, setPrintOption] = useState<'stockQuantity' | 'single'>(
    'stockQuantity',
  ); //ラベル印刷時のオプション
  const { pushQueue } = useLabelPrinterHistory();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // カテゴリとジャンルの取得
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();

  useEffect(() => {
    fetchCategoryList();
    fetchGenreList();
  }, [fetchCategoryList, fetchGenreList]);

  // ジャンル取得＆itemGenreIdセット後のみfetchProductsを呼ぶ
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, store.id, searchState.itemGenreId]);

  return (
    <ContainerLayout
      title="特価在庫一覧"
      helpArchivesNumber={769}
      actions={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '60%' }}>
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
              value="single"
              control={<Radio />}
              label="1枚ずつ"
            />
            <FormControlLabel
              value="stockQuantity"
              control={<Radio />}
              label="在庫数分"
            />
          </RadioGroup>
          <PrimaryButtonWithIcon
            sx={{ width: '250px' }}
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
                  printOption === 'single'
                    ? 1
                    : // @ts-expect-error because of printCountは確実に含まれている
                      product.printCount ??
                      (product.item_infinite_stock ? 1 : product.stock_number);

                let isFirstStock =
                  (printOption == 'single' && product.stock_number <= 1) ||
                  printOption != 'single';

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
          <PrimaryButtonWithIcon
            sx={{ width: '220px', ml: 2 }}
            onClick={() => setIsAddModalOpen(true)}
          >
            新規特価在庫作成
          </PrimaryButtonWithIcon>
        </Box>
      }
    >
      <SpecialPriceStockSearch setSearchState={setSearchState} />
      <Stack
        sx={{
          backgroundColor: 'white',
          flex: 1,
          overflow: 'scroll',
          mt: 2,
          gap: 0.5,
        }}
      >
        <GenreTabComponent setSearchState={setSearchState} />
        <SpecialPriceStockNarrowDown
          searchState={searchState}
          setSearchState={setSearchState}
        />
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SpecialPriceStockTable
            searchState={searchState}
            setSearchState={setSearchState}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onRowClick={(params, event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest('[role="checkbox"]') ||
                target.closest('input[type="checkbox"]')
              ) {
                return;
              }

              const productId =
                typeof params.id === 'string'
                  ? parseInt(params.id, 10)
                  : (params.id as number);
              setSelectedProductId(productId);
              setIsDetailModalOpen(true);
            }}
          />
        </Box>
      </Stack>
      {/* モーダル */}

      <AddSpecialPriceStockModal
        isOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        fetchAllProducts={fetchProducts}
      />

      {/* 在庫詳細モーダル */}
      {selectedProductId && category && genre && (
        <StockDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProductId(null);
          }}
          productId={selectedProductId}
          category={category}
          genre={genre}
          fetchAllProducts={fetchProducts}
        />
      )}
    </ContainerLayout>
  );
};
