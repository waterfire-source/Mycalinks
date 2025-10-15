import { useEffect, useState } from 'react';
import {
  ConsignmentProduct,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { ConsignmentProductTableContent } from '@/app/auth/(dashboard)/stock/consign/components/ConsignmentProductTableContent';

type SearchQuery = {
  productName?: string;
  consignmentUser?: string;
  genreId?: number;
  categoryId?: number;
};

type PrintCount = {
  id: number;
  count: number;
};

interface Props {
  searchQuery: SearchQuery;
  selectedProducts: ConsignmentProduct[];
  printCounts: PrintCount[];
  onProductSelect: (product: ConsignmentProduct, checked: boolean) => void;
  onSelectedProductsChange: (products: ConsignmentProduct[]) => void;
  onPrintCountsChange: (counts: PrintCount[]) => void;
  onSearch: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function ConsignmentProductTable({
  searchQuery,
  selectedProducts,
  printCounts,
  onProductSelect,
  onSelectedProductsChange,
  onPrintCountsChange,
  onSearch,
  currentPage,
  setCurrentPage,
}: Props) {
  // ページング関連
  const [pageSize, setPageSize] = useState(20);

  const {
    isLoading,
    consignmentProducts,
    fetchConsignmentProducts,
    totalCountProducts,
  } = useConsignment();
  const { pushQueue } = useLabelPrinterHistory();

  // 初期データ取得
  useEffect(() => {
    fetchConsignmentProducts({
      includesSummary: true,
      take: pageSize,
      skip: 0,
    });
  }, [fetchConsignmentProducts]);

  const productName =
    searchQuery.productName === '' ? undefined : searchQuery.productName;
  const consignmentClientFullName =
    searchQuery.consignmentUser === ''
      ? undefined
      : searchQuery.consignmentUser;

  // カテゴリ・ジャンル変更時の検索
  useEffect(() => {
    fetchConsignmentProducts({
      includesSummary: true,
      genreId: searchQuery.genreId,
      categoryId: searchQuery.categoryId,
      displayName: productName,
      consignmentClientFullName: consignmentClientFullName,
      take: pageSize,
      skip: 0,
    });
  }, [searchQuery.genreId, searchQuery.categoryId, fetchConsignmentProducts]);

  // 検索実行（親から呼ばれる）
  useEffect(() => {
    fetchConsignmentProducts({
      includesSummary: true,
      genreId: searchQuery.genreId,
      categoryId: searchQuery.categoryId,
      displayName: productName,
      consignmentClientFullName: consignmentClientFullName,
      take: pageSize,
      skip: 0,
    });
  }, [
    searchQuery.productName,
    searchQuery.consignmentUser,
    searchQuery.genreId,
    searchQuery.categoryId,
    fetchConsignmentProducts,
  ]); // onSearchが変更されたときに実行

  const handleSelectAll = (checked: boolean) => {
    const products = consignmentProducts || [];
    if (checked && products.length > 0) {
      onSelectedProductsChange(products);
    } else {
      onSelectedProductsChange([]);
    }
  };

  const handleCountChange = (id: number, value: string) => {
    const newValue = parseInt(value, 10) || 0;
    const existing = printCounts.find((p) => p.id === id);

    if (existing) {
      const newCounts = printCounts.map((p) =>
        p.id === id ? { ...p, count: newValue } : p,
      );
      onPrintCountsChange(newCounts);
    } else {
      onPrintCountsChange([...printCounts, { id, count: newValue }]);
    }
  };

  const handleSingleProductLabelPrint = async (product: ConsignmentProduct) => {
    // 在庫数>指定した枚数の場合→価格無しラベルのみ
    // 在庫数=指定した枚数の場合→価格ありラベル1枚+残り価格無しラベル

    const productId = product.id;
    const printCount = printCounts.find((p) => p.id === product.id)?.count ?? 1;
    const stockNumber = product.stock_number ?? 0;

    let isFirstStock = stockNumber <= printCount;

    for (let i = 0; i < printCount; i++) {
      pushQueue({
        template: 'product',
        data: productId,
        meta: {
          isFirstStock,
          isManual: true,
        },
      });
      isFirstStock = false; // 2枚目以降はfalseで
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchConsignmentProducts({
      includesSummary: true,
      genreId: searchQuery.genreId,
      categoryId: searchQuery.categoryId,
      displayName: productName,
      consignmentClientFullName: consignmentClientFullName,
      take: pageSize,
      skip: (newPage - 1) * pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchConsignmentProducts({
      includesSummary: true,
      genreId: searchQuery.genreId,
      categoryId: searchQuery.categoryId,
      displayName: productName,
      consignmentClientFullName: consignmentClientFullName,
      take: newPageSize,
      skip: 0,
    });
  };

  return (
    <ConsignmentProductTableContent
      data={consignmentProducts || []}
      isLoading={isLoading}
      selectedProducts={selectedProducts}
      printCounts={printCounts}
      onProductSelect={onProductSelect}
      onSelectAll={handleSelectAll}
      onCountChange={handleCountChange}
      onSingleProductLabelPrint={handleSingleProductLabelPrint}
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={totalCountProducts}
      totalPages={Math.ceil(totalCountProducts / pageSize)}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
