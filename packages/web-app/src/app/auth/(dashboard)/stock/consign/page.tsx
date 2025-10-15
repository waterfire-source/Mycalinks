'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack, SelectChangeEvent } from '@mui/material';
import { useState, useCallback } from 'react';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { Tabs, Box } from '@mui/material';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import {
  ConsignmentClient,
  ConsignmentProduct,
} from '@/feature/consign/hooks/useConsignment';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { ConsignmentProductDetailModal } from '@/feature/consign/components/ConsignmentProductDetailModal';
import { ConsignmentSalesHistoryModal } from '@/feature/consign/components/ConsignmentSalesHistoryModal';
import { GenreSelect } from '@/feature/item/components/select/GenreSelect';
import { CategorySelect } from '@/feature/item/components/select/CategorySelect';
import { CancelConsignmentModal } from '@/feature/consign/components/cancelConsignment/CancelConsignmentModal';
import { HelpIcon } from '@/components/common/HelpIcon';
import { ConsignmentClientTable } from '@/app/auth/(dashboard)/stock/consign/components/ConsignmentClientTable';
import { ConsignmentProductTable } from '@/app/auth/(dashboard)/stock/consign/components/ConsignmentProductTable';
import { ConsignmentSearchForm } from '@/app/auth/(dashboard)/stock/consign/components/ConsignmentSearchForm';

type QueryType = {
  productName?: string;
  consignmentUser?: string;
  genreId?: number;
  categoryId?: number;
};

type PrintCount = {
  id: number;
  count: number;
};

export default function ConsignmentPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<QueryType>({});
  const [selectedProducts, setSelectedProducts] = useState<
    ConsignmentProduct[]
  >([]);
  const [currentTab, setCurrentTab] = useState('consignor');
  const [selectedConsignmentClient, setSelectedConsignmentClient] =
    useState<ConsignmentClient | null>(null);
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [salesHistoryModalOpen, setSalesHistoryModalOpen] = useState(false);
  const [printCounts, setPrintCounts] = useState<PrintCount[]>([]);
  const [isOpenCancelModal, setIsOpenCancelModal] = useState(false);

  const { pushQueue } = useLabelPrinterHistory();
  // ページング関連
  const [currentPage, setCurrentPage] = useState(1);

  // 検索実行
  const handleSearch = useCallback((query: QueryType) => {
    setSearchQuery(query);
  }, []);

  // テーブルコンポーネント用の検索ハンドラー
  const handleTableSearch = useCallback(() => {
    // テーブルコンポーネントは既にsearchQueryを監視しているため、何もしない
  }, []);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setSearchQuery({});
    setSelectedProducts([]);
    setCurrentPage(1);
  };

  const handleGenreChange = (e: SelectChangeEvent<string>) => {
    setSearchQuery({
      ...searchQuery,
      genreId: Number(e.target.value),
    });
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setSearchQuery({
      ...searchQuery,
      categoryId: Number(e.target.value),
    });
    setCurrentPage(1);
  };

  const handleProductSelect = (
    product: ConsignmentProduct,
    checked: boolean,
  ) => {
    setSelectedProducts((prev) => {
      if (checked) {
        const exists = prev.some((p) => p.id === product.id);
        if (!exists) {
          return [...prev, product];
        }
        return prev;
      } else {
        return prev.filter((p) => p.id !== product.id);
      }
    });
  };

  const handleLabelPrint = async () => {
    // 在庫数分印刷の場合→価格無し1枚+残り価格あり
    selectedProducts.forEach((product) => {
      const printCount =
        printCounts.find((p) => p.id === product.id)?.count ??
        product.stock_number;
      let isFirstStock = product.stock_number <= printCount;

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
  };

  const handleOpenProductDetail = (consignmentClient: ConsignmentClient) => {
    setSelectedConsignmentClient(consignmentClient);
    setProductDetailModalOpen(true);
  };

  const handleOpenSalesHistory = (consignmentClient: ConsignmentClient) => {
    setSelectedConsignmentClient(consignmentClient);
    setSalesHistoryModalOpen(true);
  };

  const handleCloseModals = () => {
    setProductDetailModalOpen(false);
    setSalesHistoryModalOpen(false);
    setSelectedConsignmentClient(null);
  };

  const renderActions = () => {
    return (
      <Stack gap="12px" direction="row">
        {currentTab === 'inventory' && (
          <SecondaryButton
            onClick={() => setIsOpenCancelModal(true)}
            disabled={!selectedProducts.length}
          >
            選択した委託を取り消し
          </SecondaryButton>
        )}
        {currentTab === 'inventory' && selectedProducts.length > 0 && (
          <PrimaryButtonWithIcon onClick={handleLabelPrint}>
            選択商品のラベル印刷 ({selectedProducts.length}件)
          </PrimaryButtonWithIcon>
        )}
        <PrimaryButtonWithIcon
          onClick={() => router.push(PATH.STOCK.consign.register)}
        >
          新規受託商品追加
        </PrimaryButtonWithIcon>
        <HelpIcon helpArchivesNumber={3023} />
      </Stack>
    );
  };

  return (
    <>
      <ContainerLayout
        title="受託商品管理"
        helpArchivesNumber={3042}
        actions={renderActions()}
      >
        <Stack
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* 固定される検索エリア */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ flexShrink: 0 }}
          >
            <ConsignmentSearchForm onSearch={handleSearch} />
          </Stack>

          {/* 固定されるタブエリア */}
          <Box sx={{ width: '100%', mt: 2, flexShrink: 0 }}>
            <Box
              sx={{
                borderBottom: '8px solid #b82a2a',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(_, value) => handleTabChange(value)}
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{
                  margin: 0,
                  padding: 0,
                  minHeight: '31px',
                  '& .MuiTabs-scrollButtons': {
                    display: 'none',
                  },
                }}
              >
                <CustomTabTableStyle
                  label={<Box>委託者</Box>}
                  value="consignor"
                />
                <CustomTabTableStyle
                  label={<Box>在庫一覧</Box>}
                  value="inventory"
                />
              </Tabs>
            </Box>

            {/* 固定されるフィルターエリア */}
            {currentTab === 'inventory' && (
              <Stack
                direction="row"
                gap="16px"
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  backgroundColor: 'white',
                  borderBottom: '1px solid',
                  borderBottomColor: 'grey.200',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    p: 1,
                    py: 1.5,
                  }}
                >
                  <GenreSelect
                    selectedGenreId={searchQuery.genreId}
                    onSelect={handleGenreChange}
                    inputLabel="ジャンル"
                    sx={{ minWidth: 150 }}
                  />
                  <CategorySelect
                    selectedCategoryId={searchQuery.categoryId}
                    onSelect={handleCategoryChange}
                    inputLabel="カテゴリ"
                    sx={{ minWidth: 150 }}
                  />
                </Box>
              </Stack>
            )}
          </Box>

          {/* スクロール可能なテーブルエリア */}
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {currentTab === 'consignor' ? (
              <ConsignmentClientTable
                searchQuery={searchQuery}
                onOpenSalesHistory={handleOpenSalesHistory}
                onOpenProductDetail={handleOpenProductDetail}
                onSearch={handleTableSearch}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            ) : (
              <ConsignmentProductTable
                searchQuery={searchQuery}
                selectedProducts={selectedProducts}
                printCounts={printCounts}
                onProductSelect={handleProductSelect}
                onSelectedProductsChange={setSelectedProducts}
                onPrintCountsChange={setPrintCounts}
                onSearch={handleTableSearch}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </Box>
        </Stack>
      </ContainerLayout>

      {/* 商品詳細モーダル */}
      <ConsignmentProductDetailModal
        open={productDetailModalOpen}
        onClose={handleCloseModals}
        consignmentClient={selectedConsignmentClient}
      />

      {/* 販売履歴モーダル */}
      <ConsignmentSalesHistoryModal
        open={salesHistoryModalOpen}
        onClose={handleCloseModals}
        consignmentClient={selectedConsignmentClient}
      />

      {/* 委託取り消しモーダル */}
      <CancelConsignmentModal
        open={isOpenCancelModal}
        onClose={() => setIsOpenCancelModal(false)}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        fetchProductsData={handleTableSearch}
      />
    </>
  );
}
